import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "../../services/projects-data.service";
import template from "./dashboard.component.html";
import styleScss from "./dashboard.component.scss";
import {Observable} from "rxjs/Observable";
import {Project} from "../../../../both/models/project.model";
import {NotificationService} from "../../services/notification.service";
import {SearchService} from "../../services/search.service";
import {trigger, state, style, animate, transition} from "@angular/animations";
import {Router} from "@angular/router";
import undefined = Match.undefined;
import {ConfirmationModalService} from "../../services/confirmationModal.service";

declare const $ :any;

@Component({
    selector: "dashboard",
    template,
    styles: [ styleScss ],
    animations: [
        trigger('growShrink', [
            state('in', style({opacity: 1, transform: 'scale(1.0)'})),
            transition('void => *', [
                style({
                    opacity: 0,
                    transform: 'scale(0.1)'
                }),
                animate('0.4s ease-in')
            ]),
            transition('* => void', [
                animate('0.2s 0.2s ease-out', style({
                    opacity: 0,
                    transform: 'scale(0.1)'
                }))
            ])
        ])
    ]
})
export class DashboardComponent implements OnInit{
    projects: Observable<Project[]>;
    editedProject: Project;
    projectID: string;
    searchText: string;

    constructor(
        private projectsDS: ProjectsDataService,
        private notification: NotificationService,
        private search: SearchService,
        private router: Router,
        private confirmation: ConfirmationModalService
    ) {
        this.editedProject = {name: '', description: '', mappingID: ''};
        this.projectID = '';
    }

    ngOnInit(): void {
        this.projects = this.projectsDS.getData().zone();
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
    }

    openAddProjectModal() {
        $('.modal').modal();
    }

    openProject(ID) {
        this.router.navigate(['/project', ID]);
    }

    createProject(name, description) {
        if (name === '') {
            this.notification.error("Please insert a name!");
            return;
        }
        this.projectsDS.addData({name: name, description: description}).subscribe((newID) => {
            if (newID != '' && newID != undefined) {
                $('#createModal_name').val('');
                $('#createModal_desc').val('');
                $('#modal1').modal('close');
                this.notification.success("Project added")
            } else {
                this.notification.error("Could not add Project");
            }
        });

    }

    deleteItem(id, name) {
        this.confirmation.openModal('Delete ' + name, 'Do you really want to delete this project? <br>All related configs will be deleted too!').then((fullfilled) => {
            if (fullfilled) {
                this.projectsDS.delete(id).subscribe((removedItems) => {
                    if (removedItems === 1) {
                        this.notification.warning("Deleted");
                    } else {
                        this.notification.error("Could not delete Project");
                    }
                });
            }
        });
    }

    openEditModal(id, name, description) {
        this.editedProject.name = name;
        this.editedProject.description = description;
        this.projectID = id;
        $('.modal').modal();
    }

    editProject() {
        this.projectsDS.updateProject(this.projectID, this.editedProject);
        this.editedProject.name = '';
        this.editedProject.description = '';
        this.projectID = '';
        this.notification.success("Entry updated");
    }
}