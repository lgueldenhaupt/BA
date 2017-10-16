import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "../dashboard/projects-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {Router, ActivatedRoute, ParamMap} from "@angular/router";
import {Observable} from "rxjs/Observable";

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

    constructor(
        private projectsDS: ProjectsDataService,
        private router: Router,
        private route: ActivatedRoute
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

    }

}