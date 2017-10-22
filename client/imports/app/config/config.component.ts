import { Component, OnInit } from "@angular/core";
import template from "./config.component.html";
import style from "./config.component.scss";
import {ActivatedRoute} from "@angular/router";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";

declare let $ :any;

@Component({
    selector: "config",
    template,
    styles: [ style ]
})
export class ConfigComponent implements OnInit{
    private configID: string;
    private config: ConfigSet;

    constructor(
        private route: ActivatedRoute,
        private configDS: ConfigSetsDataService
    ) {
    }

    ngOnInit(): void {
        let self = this;
        this.route.params.subscribe(params =>{
            this.configID = params['id'];
            let config$ = this.configDS.getConfigById(this.configID);
            config$.subscribe(
                data => {
                    self.config = data[0];
                }
            )
        });
    }
}