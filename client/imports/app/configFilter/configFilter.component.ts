import {Component, Input, OnInit} from "@angular/core";
import template from "./configFilter.component.html";
import style from "./configFilter.component.scss";
import {Mapping} from "../../../../both/models/mapping.model";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Config} from "../../../../both/models/config";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";

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
    private filters: any[];

    constructor(
        private mappingDS: MappingsDataService,
        private configDS: ConfigSetsDataService
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
            $('.modal').modal({
                complete: function () {
                    $('.collapsible').collapsible();
                }
            });
        });
    }

    addFilter(key: string) {
        if (this.canAddFilter(key)) {
            let options = [];
            this.configs.forEach((config : Config) => {
                let val = config.getValueOf(key);
                if (val != '') {
                    options.push(val);
                }
            });
            options = _.uniq(options);
            console.log(options);
            this.filters.push({
                key: key,
                options: options
            });

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
}