import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "./projects-data.service";
import template from "./dashboard.component.html";
import style from "./dashboard.component.scss";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../both/models/project.model";
import {Router} from "@angular/router";
import {NotificationService} from "../../services/notification.service";

declare var $ :any;

@Component({
    selector: "dashboard",
    template,
    styles: [ style ]
})
export class DashboardComponent implements OnInit{
    projects: Observable<Project[]>;
    projectName: string;
    projectDesc: string;
    projectID: string;

    constructor(
        private projectsDS: ProjectsDataService,
        private router: Router,
        private notification: NotificationService
    ) {
        this.projectName = '';
        this.projectDesc = '';
        this.projectID = '';
    }

    ngOnInit(): void {
        this.projects = this.projectsDS.getData().zone();
    }

    openAddProjectModal() {
        $(document).ready(function(){
            $('.modal').modal();
        });
    }

    openProject(ID) {
        this.router.navigate(['/project', ID]);
    }

    createProject(name, description) {
        if (name === '') {
            this.notification.error("Please insert a name!");
            return;
        }
        this.projectsDS.addData({name: name, description: description});
        $('#createModal_name').val('');
        $('#createModal_desc').val('');
        $('#modal1').modal('close');
    }

    deleteItem(id) {
        this.projectsDS.delete(id);
    }

    editProject(id, name, description) {
        if (this.projectDesc === '' && this.projectName === '' && this.projectID === '') {
            this.projectName = name;
            this.projectDesc = description;
            this.projectID = id;
            $('.modal').modal();
        } else {

            this.projectsDS.updateProject(this.projectID, this.projectName, this.projectDesc);
            this.projectName = '';
            this.projectDesc = '';
            this.projectID = '';
        }
    }

}