import {Component, Input, OnInit} from "@angular/core";
import template from "./configFilter.component.html";
import style from "./configFilter.component.scss";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";

declare let $ :any;

@Component({
    selector: "configFilter",
    template,
    styles: [ style ]
})
export class ConfigFilterComponent implements OnInit{
    @Input() projectID: string;
    private configSets: ConfigSet[];

    constructor(
        private configDS: ConfigSetsDataService
    ) {

    }

    ngOnInit(): void {
        this.configDS.getProjectConfigs(this.projectID).subscribe((configs) => {
            this.configSets = configs;
        });
    }
}