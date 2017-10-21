import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "../dashboard/projects-data.service";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {Router, ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";

declare let $ :any;
declare let Materialize : any;

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

    constructor(
        private projectsDS: ProjectsDataService,
        private configSetsDS: ConfigSetsDataService,
        private router: Router,
        private route: ActivatedRoute,
        private notification : NotificationService
    ) {
        this.project = {name: '', description: ''};
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
        this.configSets = this.configSetsDS.getProjectConfigs(this.projectID).zone();

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
        });
    }

    openAddConfigSetModal() {
        $(document).ready(function(){
            $('.modal').modal();
        });
    }

    createConfigSet(name, desc) {
        this.configSetsDS.addData({name: name, description: desc, projectID: this.projectID});
        this.notification.success("ConfigSet added");
    }

    deleteConfigSet(id) {
        this.configSetsDS.delete(id);
    }
}