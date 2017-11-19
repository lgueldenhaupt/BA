import {Component, OnInit} from "@angular/core";
import {ProjectsDataService} from "../../services/projects-data.service";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";
import {SearchService} from "../../services/search.service";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import undefined = Match.undefined;
import {ConfirmationModalService} from "../../services/confirmationModal.service";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Mapping, ParamMapping} from "../../../../both/models/mapping.model";
import {TrainingSet} from "../../../../both/models/trainingSet";
import {FilterService} from "../../services/filter.service";
import {Config} from "../../../../both/models/config";
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable";
import {ConfigsPipe, ProjectFilterPipe} from "../../helpers/filter.pipe";

declare let $: any;
declare let _: any;

@Component({
    selector: "project",
    template,
    styles: [style]
})
export class ProjectComponent implements OnInit {
    private projectID: string;
    private project: Project;
    private mapping: ParamMapping;
    private configSets: ConfigSet[];
    private filteredConfigs: ConfigSet[];
    private searchText: string;
    private chosenConfig: Config;
    private view: number;
    private initialColumns: DynamicTableColumn[];
    private onColumnClick: Function;
    private tableOptions: DynamicTableOptions;

    constructor(private projectsDS: ProjectsDataService,
                private configSetsDS: ConfigSetsDataService,
                private mappingDS: MappingsDataService,
                private route: ActivatedRoute,
                private notification: NotificationService,
                private search: SearchService,
                private confirm: ConfirmationModalService,
                private router: Router) {
        this.project = new Project();
        this.view = 1;
        this.onColumnClick = (item) => {
            this.router.navigate(['/config', item._id]);
        };
        this.tableOptions = new DynamicTableOptions("Configurations", true, "highlight",new ProjectFilterPipe());
        this.initialColumns = [];
        this.initialColumns.push(new DynamicTableColumn('Name', 'name', false));
        this.initialColumns.push(new DynamicTableColumn('Description', 'description', false));
        this.initialColumns.push(new DynamicTableColumn('Actions', 'name', true, [
            "<i class=\"material-icons grey-text text-darken-2 pointer\">edit</i>",
            "<i class=\"material-icons grey-text text-darken-2 pointer\">delete</i>"]));
    }

    ngOnInit(): void {

        //parse route params to get the project
        this.route.params.subscribe(params => {
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                (data : Project[]) => {
                    this.project = data[0];
                    this.getProjectMapping();
                }
            );
        });

        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
        this.configSetsDS.getProjectConfigs(this.projectID).subscribe((results) => {
            this.configSets = results;
            this.filteredConfigs = FilterService.filterConfigs(this.configSets, this.mapping);
        });
        FilterService.getFilters().subscribe(() => {
            this.filteredConfigs = FilterService.filterConfigs(this.configSets, this.mapping);
        });

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('.modal').modal();
        });
    }

    handleDynTableCall(event) {
        switch (event.index) {
            case 0:
                this.openConfigSetEditModal(event.item);
                break;
            case 1:
                this.deleteConfigSet(event.item);
                break;
            default:
                break;
        }
    }

    openConfigSetEditModal(set: Config) {
        this.chosenConfig = set;
        $('#editName').val(this.chosenConfig.name);
        $('#editDesc').val(this.chosenConfig.description);
        $('#configSetEditModal').modal('open');
    }

    createConfigSet(name, desc, params, results: TrainingSet[] = []) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addConfig({
            name: name,
            description: desc,
            projectID: this.projectID,
            params: params,
            results: results
        }).subscribe((newID) => {
            if (newID != '' || newID != undefined) {
                this.notification.success("ConfigSet added");
            }
            else {
                this.notification.error("Could not add Config Set");
            }
        });
        if ($('.modal').modal()) {
            $('.modal').modal('close');
        }
    }

    editChosenConfig(name: string, description: string) {
        if (this.chosenConfig === null) {
            this.notification.error("No config chosen");
            return;
        } else {
            this.chosenConfig.name = name;
            this.chosenConfig.description = description;
            this.configSetsDS.updateConfig(this.chosenConfig._id, this.chosenConfig).subscribe((changedConfigs) => {
                if (changedConfigs == 1) {
                    this.notification.success("Config udpdated");
                    $('#configSetEditModal').modal('close');
                }
            });
        }
    }

    deleteConfigSet(item) {
        let id = item._id;
        this.confirm.openModal('Delete ' + name, "Do you really want to delete that config?").then((fullfilled) => {
            if (fullfilled) {
                this.configSetsDS.delete(id).subscribe((changedEntries) => {
                    if (changedEntries === 1) {
                        this.notification.success("ConfigSet deleted");
                    } else {
                        this.notification.error("ConfigSet not deleted");
                    }
                });
            }
        });
    }

    createMapping() {
        if (!this.configSets || this.configSets.length <= 0) {
            this.notification.error("No configuration Sets");
            return;
        }
        this.mappingDS.addMappingFromConfig(this.project.name + ' mapping', this.configSets[0].params).subscribe((mappingID) => {
            if (mappingID && mappingID != '') {
                this.updateProjectWithMapping(mappingID);
                this.addAllConfigsToMapping(mappingID);
            }
        });
    }

    updateMapping() {
        this.addAllConfigsToMapping(this.mapping._id);
    }

    private addAllConfigsToMapping(mappingID) {
        if (this.configSets.length > 1) {
            let toAddParams = [];
            for (let i = 0; i < this.configSets.length; i++) {
                let configSet = this.configSets[i];
                this.mappingDS.assignConfigToMapping(configSet.params, mappingID).subscribe((unrelatedParams) => {
                    if (unrelatedParams.length > 0) {
                        toAddParams = toAddParams.concat(unrelatedParams);
                        toAddParams = _.uniq(toAddParams);
                    }
                }, () => {
                    this.notification.error("Something went wrong while adding Configs to mapping");
                }, () => {
                    if (i === this.configSets.length - 1) {
                        this.mappingDS.addUnrelatedParamsToMapping(mappingID, toAddParams).subscribe((changedMappings)=> {
                            if (changedMappings == 1) {
                                this.notification.warning("Mapping has " + toAddParams.length + " new unrelated Params");
                            } else {
                                this.notification.warning("Nothing to update");
                            }
                        });
                    }
                });
            }
        }
    }

    private updateProjectWithMapping(mappingID: string) {
        this.project.mappingID = mappingID;
        this.notification.success("Mapping Created");
        this.projectsDS.updateProject(this.projectID, this.project).subscribe((changedEntries) => {
            if (changedEntries == 1) {
                this.notification.success("Project updated");
            }
        });
    }

    private getProjectMapping() {
        if (this.project && this.project.mappingID && this.project.mappingID != '') {
            this.mappingDS.getMappingById(this.project.mappingID).subscribe((mappings : Mapping[]) => {
                if (mappings && mappings[0]) {
                    let m  = mappings[0];
                    this.mapping = new ParamMapping(m.name, m.params, m.unrelatedParams, m.flags,(<any>m)._id);
                }
            });
        }
    }

    onDrop(e) {
        let file = e.dataTransfer.files[0];
        e.preventDefault();
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        let FR = new FileReader();
        FR.onload = (ev: FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            let splitted = result.split("\n");
            let params = [];
            let results = [];
            if (splitted[0]) {
                params = ParamExtractor.searchForParams(splitted[0]);
                if (splitted.length > 1) {
                    splitted.splice(0, 1);
                    results = ParamExtractor.searchForTrainingSets(splitted);
                }
            }
            this.createConfigSet(file.name, file.lastModifiedDate + '', params, results);

        };
        console.log(typeof file.name == 'string');
        FR.readAsText(file);
    }

    onDragOver(e) {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-4 dropCard';
        e.preventDefault();
        return false;
    }

    onDragLeave() {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        return false;
    }

    changeView(value: number) {
        if (value >= 0 && value <= 1) {
            this.view = value;
        }
    }
}