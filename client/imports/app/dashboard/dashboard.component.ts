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

/**
 * The dashboard component displays all projects.
 * Here are the animations declared for the project cards
 */
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
        this.editedProject = new Project();
        this.projectID = '';
    }

    ngOnInit(): void {
        this.projects = this.projectsDS.getData().zone();

        //subscribe to top search
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
    }

    /**
     * Opens the project create modal
     */
    public openAddProjectModal() {
        $('#modal1').modal();
    }

    /**
     * Navigates to the project with the given id
     * @param ID
     */
    public openProject(ID) {
        this.router.navigate(['/project', ID]);
    }

    /**
     * Creates a project with the name and description
     * @param name
     * @param description
     */
    public createProject(name, description) {
        if (name === '') {
            this.notification.error("Please insert a name!");
            return;
        }
        this.projectsDS.addData({name: name, description: description, creator: Meteor.userId()}).subscribe((newID) => {
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

    /**
     * Deletes the project with the given id after confirmation.
     * @param id Project id of the project to delete.
     * @param project the project to delete
     */
    public deleteItem(id, project: Project) {
        if (project.creator != Meteor.userId()) {
            this.notification.error("Not permitted");
            return;
        }
        this.confirmation.openModal('Delete ' + project.name, 'Do you really want to delete this project? <br>All related configs will be deleted too!').then((fullfilled) => {
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

    /**
     * Opens the edit modal for a project
     * @param id
     * @param project
     */
    public openEditModal(id, project: Project) {
        if (project.creator != Meteor.userId()) {
            this.notification.error("Not permitted");
            return;
        }
        this.editedProject.name = project.name;
        this.editedProject.description = project.description;
        this.editedProject.creator = project.creator;
        this.editedProject.mappingID = project.mappingID;
        this.projectID = id;
        $('#editModal').modal();
    }

    /**
     * Updates the project.
     */
    public editProject() {
        this.projectsDS.updateProject(this.projectID, this.editedProject).subscribe((changedEntries) => {
            if (changedEntries === 1) {
                this.editedProject.name = '';
                this.editedProject.description = '';
                this.projectID = '';
                this.notification.success("Entry updated");
            }
        });
    }
}