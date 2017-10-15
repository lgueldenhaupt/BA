import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "./projects-data.service";
import template from "./dashboard.component.html";
import style from "./dashboard.component.scss";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../both/models/project.model";
import {Router} from "@angular/router";

declare var $ :any;

@Component({
    selector: "dashboard",
    template,
    styles: [ style ]
})
export class DashboardComponent implements OnInit{
    projects: Observable<Project[]>;

    constructor(
        private projectsDS: ProjectsDataService,
        private router: Router
    ) {
        $(document).ready(function(){
            $('.carousel').carousel();
        });
    }

    openAddProjectModal() {
        $(document).ready(function(){
            // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
            $('.modal').modal();
        });
    }

    openProject(ID) {
        this.router.navigate(['/project', ID]);
    }

    createProject(name, description) {
        this.projectsDS.addData({name: name, description: description});
    }

    deleteItem(id) {
        this.projectsDS.delete(id);
    }

    ngOnInit(): void {
        this.projects = this.projectsDS.getData().zone();
    }

}