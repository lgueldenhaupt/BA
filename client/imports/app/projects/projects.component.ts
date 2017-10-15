import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "./projects-data.service";
import template from "./projects.component.html";
import style from "./projects.component.scss";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../both/models/project.model";

declare var $ :any;

@Component({
    selector: "projects",
    template,
    styles: [ style ]
})
export class ProjectsComponent implements OnInit{
    projects: Observable<Project[]>;

    constructor(private projectsDS: ProjectsDataService) {
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