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
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable.classes";
import {ConfigsPipe, ProjectFilterPipe} from "../../helpers/filter.pipe";
import {ParamSet} from "../../../../both/models/paramSet";
import {AliasFinder} from "../../helpers/alias-finder";
import {UserPreferences} from "../../../../both/models/userPreferences";
import {UsersDataService} from "../../services/users-data.service";

declare let $: any;
declare let _: any;

/**
 * This component respresents the project page
 */
@Component({
    selector: "project",
    template,
    styles: [style]
})
export class ProjectComponent implements OnInit {
    private projectID: string;
    private project: Project;
    private mapping: ParamMapping;
    private mappings: Mapping[];
    private configSets: ConfigSet[];
    private filteredConfigs: ConfigSet[];
    private searchText: string;
    private chosenConfig: Config;
    private initialColumns: DynamicTableColumn[];
    private tableOptions: DynamicTableOptions;
    private fixColumn: DynamicTableColumn = new DynamicTableColumn('Actions', '', true, "", [
        "<i class=\"material-icons grey-text text-darken-2 pointer\">edit</i>",
        "<i class=\"material-icons grey-text text-darken-2 pointer\">delete</i>"]);

    constructor(private projectsDS: ProjectsDataService,
                private configSetsDS: ConfigSetsDataService,
                private mappingDS: MappingsDataService,
                private route: ActivatedRoute,
                private notification: NotificationService,
                private search: SearchService,
                private confirm: ConfirmationModalService,
                private router: Router) {
        this.project = new Project();

        //inits the dyn table configurations
        this.tableOptions = new DynamicTableOptions("Configurations", new ProjectFilterPipe(), "highlight", true,true);
        this.initialColumns = [];
        this.initialColumns.push(new DynamicTableColumn('Name', 'name', false));
        this.initialColumns.push(this.fixColumn);
    }

    ngOnInit(): void {

        //parse route params to get the project
        this.route.params.subscribe(params => {
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                (data: Project[]) => {
                    this.project = data[0];
                    if ((<any>Meteor.user()).preferences) {
                        let prefs = <UserPreferences>(<any>Meteor.user()).preferences;
                        if (prefs.lastConfigSetColumns && prefs.lastConfigSetColumns != []) {
                            prefs = new UserPreferences().copyData(prefs);
                            if (prefs.getProjectsColumns(this.projectID).length != 0) {
                                this.initialColumns = [];
                                this.initialColumns.push(this.fixColumn);
                                this.initialColumns = this.initialColumns.concat(prefs.getProjectsColumns(this.projectID));
                            }
                        }
                    }
                    this.getProjectMapping();
                    this.configSetsDS.getProjectConfigs(this.projectID).subscribe((results) => {
                        this.configSets = results;
                        //add result max and min vals to every config file to show in table
                        this.configSets.forEach((configSet : ConfigSet) => {
                            if (configSet.results && configSet.results.length > 0) {
                                configSet.results.forEach((result : TrainingSet, index) => {
                                    configSet[index + '. Set Max'] = Math.round(10000 * _.max(result.epochs)) / 10000;
                                    configSet[index + '. Set Min'] = Math.round(10000 * _.min(result.epochs)) / 10000;
                                });
                            }
                            this.flattenParams(configSet);
                        });
                        this.filteredConfigs = FilterService.filterConfigs(this.configSets, this.mapping);
                    });
                }
            );
        });

        this.mappingDS.getData().subscribe((data) => {
            if (data) {
                this.mappings = data;
            }
        });

        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });

        // subscribe to the filterservice to update displayed configs
        FilterService.getFilters().subscribe(() => {
            this.filteredConfigs = FilterService.filterConfigs(this.configSets, this.mapping);
        });

        // init materialize css things
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('#configSetEditModal').modal();
            $('#configSetModal').modal();
        });
    }

    /**
     * Gets all configSet params and puts them as a first layer property in the object.
     * Made to configure the dyntable with params
     * @param {ConfigSet} configSet
     */
    private flattenParams(configSet: ConfigSet) {
        configSet.params.forEach((paramSet : ParamSet) => {
            configSet[paramSet.param] = ParamMapping.getFlagName(this.mapping.flags, paramSet.value);
        })
    }

    /**
     * Handle the event coming from dynTable
     * @param event
     */
    public handleDynTableCall(event) {
        if (this.project.creator != Meteor.userId()) {
            this.notification.notPermitted();
            return;
        }
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

    /**
     * Handles the event when clicking on a row of the dynTable
     * @param event
     */
    onTableRowClicked(event) {
        this.router.navigate(['/config', event._id]);
    }

    /**
     * Opens the config set edit modal
     * @param {Config} set
     */
    openConfigSetEditModal(set: Config) {
        this.chosenConfig = set;
        $('#editName').val(this.chosenConfig.name);
        $('#editDesc').val(this.chosenConfig.description);
        $('#configSetEditModal').modal('open');
    }

    /**
     * craetes the configSet with the given params.
     * @param name
     * @param desc
     * @param params
     * @param {TrainingSet[]} results
     */
    public createConfigSet(name, desc, params, results: TrainingSet[] = []) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addConfig({
            name: name,
            description: desc,
            projectID: this.projectID,
            params: params,
            results: results,
            creator: Meteor.userId()
        }).subscribe((newID) => {
            if (newID != '' || newID != undefined) {
                this.notification.success("ConfigSet added");
            }
            else {
                this.notification.error("Could not add Config Set");
            }
        });
        if ($('#configSetModal').modal()) {
            $('#configSetModal').modal('close');
        }
    }

    /**
     * Edits the name and description of the chosenConfig
     * @param {string} name
     * @param {string} description
     */
    public editChosenConfig(name: string, description: string) {
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

    /**
     * Deletes the config set after confirmation
     * @param item
     */
    public deleteConfigSet(item) {
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

    /**
     * creates a new mapping for the project. Takes all configsSets for that. The first one builds the keys for the mapping
     */
    public createMapping() {
        if (this.project.creator != Meteor.userId()) {
            this.notification.notPermitted();
            return;
        }
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

    /**
     * updates the mapping by adding all new configs to it
     */
    public updateMapping() {
        this.addAllConfigsToMapping(this.mapping._id);
    }

    /**
     * Called to add all new configs to the projects related mapping.
     * @param mappingID
     */
    private addAllConfigsToMapping(mappingID) {
        if (this.configSets.length > 1) {
            let toAddParams = [];
            //goes through all configSets
            for (let i = 0; i < this.configSets.length; i++) {
                let configSet = this.configSets[i];
                //assigns the current config to the mapping
                this.mappingDS.assignConfigToMapping(configSet.params, mappingID).subscribe((unrelatedParams) => {
                    if (unrelatedParams.length > 0) {
                        toAddParams = toAddParams.concat(unrelatedParams);
                        toAddParams = _.uniq(toAddParams);
                    }
                }, () => {
                    this.notification.error("Something went wrong while adding Configs to mapping");
                }, () => {
                    //if all configs are added -> display the number of unrelated params
                    if (i === this.configSets.length - 1) {
                        this.mappingDS.addUnrelatedParamsToMapping(mappingID, toAddParams).subscribe((changedMappings) => {
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

    /**
     * Updates the project to contain the mapping
     * @param {string} mappingID
     */
    private updateProjectWithMapping(mappingID: string) {
        this.project.mappingID = mappingID;
        this.notification.success("Mapping Created");
        this.projectsDS.updateProject(this.projectID, this.project).subscribe((changedEntries) => {
            if (changedEntries == 1) {
                this.notification.success("Project updated");
            }
        });
    }

    /**
     * Gets the mapping for the project
     */
    private getProjectMapping() {
        if (this.project && this.project.mappingID && this.project.mappingID != '') {
            this.mappingDS.getMappingById(this.project.mappingID).subscribe((mappings: Mapping[]) => {
                if (mappings && mappings[0]) {
                    let m = mappings[0];
                    this.mapping = new ParamMapping(m.name, m.creator, m.params, m.unrelatedParams, m.flags, (<any>m)._id);
                }
            });
        }
    }

    /**
     * Called when dropping a file on the 'drop config' card.
     * @param e
     */
    public onDrop(e) {
        e.preventDefault();
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        let file = e.dataTransfer.files[0];

        // read file and try to extract params and results
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
        FR.readAsText(file);
    }

    /**
     * Called on drag over config card. Change color and prevent default
     * @param e
     * @returns {boolean}
     */
    public onDragOver(e) {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-4 dropCard';
        e.preventDefault();
        return false;
    }

    /**
     * Called on leaving drop config card. Change color.
     * @returns {boolean}
     */
    public onDragLeave() {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        return false;
    }

    public isOwner(creator : string) {
        return (creator === Meteor.userId());
    }

    public assignToMapping(mapping) {
        this.confirm.openModal("Assign to " + mapping.name + " ?").then((fulfilled) => {
            if (fulfilled && mapping._id && mapping._id != '') {
                this.updateProjectWithMapping(mapping._id);
                this.addAllConfigsToMapping(mapping._id);
            }
        })
    }

    public columnsUpdated(columns: DynamicTableColumn[]) {
        let preferences = (<any>Meteor.user()).preferences;
        if (!preferences) {
            preferences = new UserPreferences();
        } else {
            preferences = new UserPreferences().copyData(preferences);
        }
        preferences.setConfigSetTablePreferences(columns);
        if (preferences.lastConfigSetColumns) {
            preferences.lastConfigSetColumns.forEach((column) => {
                column.projectID = this.projectID;
            });
        }
        UsersDataService.updateUser(Meteor.userId(), preferences);
    }
}