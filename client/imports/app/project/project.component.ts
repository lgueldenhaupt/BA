import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "../dashboard/projects-data.service";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";
import {SearchService} from "../../services/search.service";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";

declare let $ :any;

@Component({
    selector: "project",
    template,
    styles: [ style ]
})
export class ProjectComponent implements OnInit{
    projectID: any;
    project: Project;
    sub: any;
    configSets: Observable<ConfigSet[]>;
    searchText: string;
    chosenConfig: Object;

    constructor(
        private projectsDS: ProjectsDataService,
        private configSetsDS: ConfigSetsDataService,
        private route: ActivatedRoute,
        private notification : NotificationService,
        private search: SearchService
    ) {
        this.project = {name: '', description: ''};
        this.chosenConfig = null;
    }

    ngOnInit(): void {
        //to use 'this' in inner functions
        let self = this;

        //parse route params to get the project
        this.sub = this.route.params.subscribe(params =>{
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                data => {
                    self.project = data[0];
                }
            )
        });
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
        this.configSets = this.configSetsDS.getProjectConfigs(this.projectID).zone();

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('select').material_select();
        });
    }

    openAddConfigSetModal() {
        $(document).ready(function(){
            $('.modal').modal();
        });
    }

    createConfigSet(name, desc) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addData({name: name, description: desc, projectID: this.projectID});
        this.notification.success("ConfigSet added");
        $('.modal').modal('close');
    }

    deleteConfigSet(id) {
        this.configSetsDS.delete(id);
    }

    chooseConfig(configSet) {
        this.chosenConfig = configSet;
    }

    dataInput(event) {
        var input = event.srcElement.files;
        let FR = new FileReader();
        FR.onload = (ev : FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            console.log(result);
        };
        FR.readAsText(input[0]);
    }
}