import { Component, OnInit } from "@angular/core";
import template from "./config.component.html";
import style from "./config.component.scss";
import {ActivatedRoute} from "@angular/router";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import {NotificationService} from "../../services/notification.service";

declare let $ :any;

@Component({
    selector: "config",
    template,
    styles: [ style ]
})
export class ConfigComponent implements OnInit{
    private configID: string;
    private config: ConfigSet;
    private changedConfig: ConfigSet;
    private pureText: string;
    private canSafe: boolean;
    private hideText: boolean;

    constructor(
        private route: ActivatedRoute,
        private configDS: ConfigSetsDataService,
        private parser: ParamExtractor,
        private notification: NotificationService,
    ) {
        this.config = {name: '', projectID: '', description: '', params: []};
        this.changedConfig = {name: '', projectID: '', description: '', params: []};
        this.canSafe = false;
        this.hideText = true;
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

        $(document).ready(function(){
            $('.collapsible').collapsible();
        });
    }

    public dataInput(event) {
        var input = event.srcElement.files;
        let FR = new FileReader();
        FR.onload = (ev : FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            this.pureText = result;
            this.config.params = this.parser.searchForParams(result);
            this.canSafe = true;
        };
        FR.readAsText(input[0]);
    }

    public saveChanges() {
        this.configDS.updateConfig(this.configID, this.config).subscribe((n) => {
            if (n == 1) {
                this.notification.success("Config updated");
            } else {
                this.notification.error("Could not update");
            }
        }, (err) => {
            console.log(err)
        });
        this.canSafe = false;
    }

    public changedAttr() {
        this.canSafe = true;
    }

    public toggleText() {
        this.hideText = !this.hideText;
    }
}