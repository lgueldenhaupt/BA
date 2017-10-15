import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "./../projects/projects-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {Router, ActivatedRoute, ParamMap} from "@angular/router";

declare let $ :any;

@Component({
    selector: "project",
    template,
    styles: [ style ]
})
export class ProjectComponent implements OnInit{
    project: Project;

    constructor(
        private projectsDS: ProjectsDataService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit(): void {
        let id = this.route.snapshot.paramMap.get('id');
        this.project = this.projectsDS.getProject(id);
    }

}