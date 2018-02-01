import {ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit} from "@angular/core";
import template from "./configFilter.component.html";
import style from "./configFilter.component.scss";
import {Mapping, ParamMapping} from "../../../../both/models/mapping.model";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Config} from "../../../../both/models/config";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {Filter} from "../../../../both/models/filter";
import {Option} from "../../../../both/models/option.interface";
import {FilterService} from "../../services/filter.service";
import {ParamAliases} from "../../../../both/models/paramAliases";
import { Session } from 'meteor/session'
import {UserPreferences} from "../../../../both/models/userPreferences";
import {Observable} from "rxjs/Observable";
import {AliasFinder} from "../../helpers/alias-finder";
import {Flag} from "../../../../both/models/flag";

declare let $ :any;
declare let _ : any;

/**
 * The configFilter component gives the option to set filters for a given mappings. With every action the FilterService gets updated.
 * The filters gets saved in the session.
 */
@Component({
    selector: "configFilter",
    template,
    styles: [ style ]
})
export class ConfigFilterComponent implements OnInit{
    /**
     * mappingID: the id of the mapping to filter for
*/
    @Input() mappingID: string;
    @Input() projectID: string;
    @Input() filesUpdateEmitter: EventEmitter<boolean>;

    private mapping: Mapping;
    private configs: Config[];
    private filters: Filter[];
    private hintText: string;
    private projectMappingMatchingParams: ParamAliases[];

    constructor(
        private mappingDS: MappingsDataService,
        private configDS: ConfigSetsDataService,
        private aliasFinder: AliasFinder
    ) {
        this.filters = [];
        this.configs = [];
    }

    ngOnInit(): void {
        if (Meteor.user() && Meteor.userId()) {
            if ((<any>Meteor.user()).preferences) {
                let preferences = (<UserPreferences>(<any>Meteor.user()).preferences);
                preferences.lastConfigFilter.forEach((filter: Filter) => {
                    if (filter.projectID === this.projectID) {
                        this.filters.push(new Filter(filter.key, filter.options, this.projectID, filter.active));
                    }
                });
            }
        } else {
            //searches for filters in the session and sets them
            if (Session.get('filters')) {
                let sessionFilters = Session.get('filters');
                sessionFilters.forEach((filter : Filter) => {
                    if (filter.projectID === this.projectID) {
                        this.filters.push(new Filter(filter.key, filter.options, this.projectID, filter.active));
                    }
                });
            }
        }
        this.getAllConfigs();

        //gets the corresponding mapping
        this.mappingDS.getMappingById(this.mappingID).subscribe(mappings => {
            this.mapping = mappings[0];
            this.updateFilter();
            this.mappingDS.getProjectRelatedMappingParams(this.mapping, this.projectID).subscribe((paramsWithAliases : ParamAliases[]) => {
                this.projectMappingMatchingParams = paramsWithAliases;
            });
        });

        //update options if new files available
        this.filesUpdateEmitter.subscribe((data) => {
            this.getAllConfigs();
            this.filters.forEach(filter => {
                filter.options = this.getFilterOptions(filter.key, filter.options);
            });
        });
    }

    public getFlags() : Flag[] {
        if (!this.mapping) return [];
        return this.mapping.flags;
    }

    /**
     * gets all configs of that mapping to search for possible values
     */
    public getAllConfigs() {
        this.configDS.getData().subscribe((data : ConfigSet[]) => {
            this.configs = [];
            data.forEach((configSet : ConfigSet) => {
                this.configs.push(new Config(configSet.name, configSet.description, configSet.projectID, configSet.creator, configSet.params, configSet.results, (<any>configSet)._id));
            });
        });
    }

    /**
     * Adds a filter with the given key or removes the filter if existent already
     * @param {string} key
     */
    public addFilter(key: string) {
        if (this.canAddFilter(key) == null) {
            this.filters.push(new Filter(key, this.getFilterOptions(key), this.projectID));
        } else {
            this.filters.splice(this.filters.indexOf(this.canAddFilter(key)), 1);
        }
        this.updateFilter();
    }

    public getFilterOptions(key : string, oldOptions : Option[] = []) : Option[] {
        let options : Option[] = [];
        let aliases = this.aliasFinder.getAliasesStraight(this.mappingID, key);
        let values = [];
        this.configs.forEach((config : Config) => {
            let val = config.getValueOf(key);
            if (val != '') {
                values.push(val);
            }
            aliases.forEach((alias) => {
                let valueOfAlias = config.getValueOf(alias);
                if (valueOfAlias != '') {
                    values.push(valueOfAlias);
                }
            });
        });
        values = _.uniq(values);
        values.forEach((val) => {
            let ena = true;
            //get old filter enabled options, if they are existent
            for (let i = 0; i < oldOptions.length; i++) {
                if (val === oldOptions[i].name) {
                    ena = oldOptions[i].enabled;
                    break;
                }
            }
            let flags = this.mapping ? this.mapping.flags : [];
            options.push({name: val, enabled: ena});
        });
        return options;
    }

    /**
     * Checks if a filter is existent and returns it if so
     * @param {string} key The filter to search for
     * @returns {Filter} Filter if found || null
     */
    public canAddFilter(key :string) : Filter {
        let result = null;
        this.filters.forEach(filter => {
            if (filter.key === key) {
                result = filter;
            }
        });
        return result;
    }

    /**
     * Updates the filterservice and session
     */
    public updateFilter() {
        FilterService.setFilters(this.filters);
        Session.set('filters', this.filters);
    }

    /**
     * Sets the modal hint text to the aliases of the given param
     * @param {ParamAliases} paramWithAliases The aliases to display
     */
    public setModalHintText(paramWithAliases : ParamAliases) {
        this.hintText = paramWithAliases.key;
        paramWithAliases.aliases.forEach((alias) => {
            this.hintText += " - " + alias;
        });
    }

    /**
     * Opens the collapsible
     */
    public openHeader() {
        $('.collapsible').collapsible();
    }

    public openModal() {
        $('#addFilterModal').modal({
                complete: () => {
                    $('.collapsible').collapsible();
                },
                ready: () => {
                    let autoCompleteData = {};
                    if (this.mapping) {
                        this.mapping.params.forEach((paramWithAliases : ParamAliases) => {
                            autoCompleteData[paramWithAliases.key] = 0;
                        });
                    }
                    $('input.autocomplete').autocomplete({
                        data: autoCompleteData,
                        onAutocomplete: (val) => {
                            this.addFilter(val);
                            this.updateFilter();
                        }
                    });
                }
            }
        ).modal('open');
    }

}