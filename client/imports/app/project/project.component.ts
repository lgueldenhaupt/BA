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
import {Mapping} from "../../../../both/models/mapping.model";

declare let $: any;

@Component({
    selector: "project",
    template,
    styles: [style]
})
export class ProjectComponent implements OnInit {
    private projectID: any;
    private project: Project;
    private mapping: Mapping;
    private configSets: ConfigSet[];
    private searchText: string;
    private chosenConfig: Object;
    private view: number;

    constructor(private projectsDS: ProjectsDataService,
                private configSetsDS: ConfigSetsDataService,
                private mappingDS: MappingsDataService,
                private route: ActivatedRoute,
                private router: Router,
                private notification: NotificationService,
                private search: SearchService,
                private parser: ParamExtractor,
                private confirm: ConfirmationModalService) {
        this.project = {name: '', description: '', mappingID: ''};
        this.chosenConfig = null;
        this.view = 1;
    }

    ngOnInit(): void {
        //parse route params to get the project
        this.route.params.subscribe(params => {
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                data => {
                    this.project = data[0];
                    this.getProjectMapping();
                }
            )
        });
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
        this.configSetsDS.getProjectConfigs(this.projectID).subscribe((results) => {
            this.configSets = results;
        });

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('select').material_select();
        });
    }

    openAddConfigSetModal() {
        $(document).ready(function () {
            $('.modal').modal();
        });
    }

    createConfigSet(name, desc, params) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addConfig({
            name: name,
            description: desc,
            projectID: this.projectID,
            params: params
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

    deleteConfigSet(id, name) {
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

    goToConfig(id) {
        this.router.navigate(['/config', id]);
    }

    chooseConfig(configSet) {
        this.chosenConfig = configSet;
    }

    createMapping() {
        if (!this.configSets || this.configSets.length <= 0) {
            this.notification.error("No configuration Sets");
            return;
        }
        this.mappingDS.addMappingFromConfig(this.project.name + ' mapping', this.configSets[0].params).subscribe((mappingID) => {
            if (mappingID && mappingID != '') {
                this.updateProjectWithMapping(mappingID);
                if (this.configSets.length > 1) {
                    let toAddParams = [];
                    for (let i = 0; i < this.configSets.length; i++) {
                        let configSet = this.configSets[i];
                        this.mappingDS.assignConfigToMapping(configSet.params, mappingID).subscribe((unrelatedParams) => {
                            if (unrelatedParams.length > 0) {
                                toAddParams = toAddParams.concat(unrelatedParams);
                            }
                        }, () => {
                            this.notification.error("Something went wrong while adding Configs to mapping");
                        }, () => {
                            if (i === this.configSets.length - 1) {
                                this.mappingDS.addUnrelatedParamsToMapping(mappingID, toAddParams).subscribe((changedMappings)=> {
                                    if (changedMappings == 1) {
                                        this.notification.warning("Mapping has " + toAddParams.length + " unrelated Params");
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
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
        if (this.project.mappingID && this.project.mappingID != '') {
            this.mappingDS.getMappingById(this.project.mappingID).subscribe((mappings) => {
                if (mappings && mappings[0]) {
                    this.mapping = mappings[0];
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
            let params = this.parser.searchForParams(result);
            this.createConfigSet(file.name, file.lastModifiedDate + '', params);
        };
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