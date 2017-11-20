import {Component, Input, OnInit} from "@angular/core";
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

declare let $ :any;
declare let _ : any;

@Component({
    selector: "configFilter",
    template,
    styles: [ style ]
})
export class ConfigFilterComponent implements OnInit{
    @Input() mappingID: string;

    private mapping: Mapping;
    private configs: Config[];
    private filters: Filter[];
    private hintText: string;

    constructor(
        private mappingDS: MappingsDataService,
        private configDS: ConfigSetsDataService,
    ) {
        this.filters = [];
        this.configs = [];
    }

    ngOnInit(): void {
        this.mappingDS.getMappingById(this.mappingID).subscribe(mappings => {
            this.mapping = mappings[0];
        });
        this.configDS.getData().subscribe((data : ConfigSet[]) => {
            this.configs = [];
            data.forEach((configSet : ConfigSet) => {
                this.configs.push(new Config(configSet.name, configSet.description, configSet.projectID, configSet.params, configSet.results, (<any>configSet)._id));
            });
        });
        $(document).ready(function () {
            $('.collapsible').collapsible();
            $('#addFilterModal').modal({
                complete: function () {
                    $('.collapsible').collapsible();
                    console.log("collapse")
                },
                ready: function () {
                    console.log("ready")
                    $('input.autocomplete').autocomplete({
                        data: {
                            "Apple": null,
                            "Microsoft": null,
                            "Google": 'https://placehold.it/250x250'
                        }
                    });
                }
            });
        });
    }

    addFilter(key: string) {
        if (this.canAddFilter(key)) {
            let options : Option[] = [];
            let values = [];
            this.configs.forEach((config : Config) => {
                let val = config.getValueOf(key);
                if (val != '') {
                    values.push(val);
                }
            });
            values = _.uniq(values);
            values.forEach((val) => {
                options.push({name: val, enabled: true, meaning: ParamMapping.getFlagName(this.mapping.flags, val)});
            });
            this.filters.push(new Filter(key, options));
            FilterService.setFilters(this.filters);
        }
    }

    canAddFilter(key :string) : boolean {
        let result = true;
        this.filters.forEach(filter => {
            if (filter.key === key) {
                result = false;
            }
        });
        return result;
    }

    updateFilter() {
        FilterService.setFilters(this.filters);
    }

    setModalHintText(paramWithAliases : ParamAliases) {
        this.hintText = paramWithAliases.key;
        paramWithAliases.aliases.forEach((alias) => {
            this.hintText += " - " + alias;
        });
    }

}