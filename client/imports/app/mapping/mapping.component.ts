import { Component, OnInit } from "@angular/core";
import template from "./mapping.component.html";
import style from "./mapping.component.scss";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../../both/models/mapping.model";
import {ActivatedRoute, Router} from "@angular/router";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import {NotificationService} from "../../services/notification.service";
import {ConfirmationModalService} from "../../services/confirmationModal.service";
import {Flag} from "../../../../both/models/flag";
import {ProjectsDataService} from "../../services/projects-data.service";

declare let $ :any;

/**
 * This component respresents the mapping page
 */
@Component({
    selector: "mapping",
    template,
    styles: [ style ]
})
export class MappingComponent implements OnInit{
    private mappings: Observable<Mapping[]>;
    private selectedMapping: Mapping;
    private editedMapping: Mapping;
    private id: string;
    private label: any;

    constructor(
        private mappingDS: MappingsDataService,
        private projectDS: ProjectsDataService,
        private route: ActivatedRoute,
        private router: Router,
        private confirm: ConfirmationModalService,
        private notification: NotificationService
    ) {
    }

    ngOnInit(): void {
        this.mappings = this.mappingDS.getData().zone();
        this.route.params.subscribe((params) => {
            this.id = params['id'];
            this.mappingDS.getMappingById(this.id).subscribe((foundMappings) => {
                this.selectedMapping = foundMappings[0];
            });
        });

        //init materialize css things
        $(document).ready(function () {
            $('#createFlag').modal();
            $('#editMapping').modal();
        });
    }

    /**
     * Select a mapping. Navigates to the child route
     * @param mapping
     */
    public selectMapping(mapping: any) {
        this.router.navigate(['/mapping', mapping._id]);
    }

    /**
     * Called when draging a param chip
     * @param event
     */
    public drag(event) {
        event.dataTransfer.setData("text", event.target.id);
        this.label = event.srcElement;
    }

    /**
     * Called when hovering over the element
     * @param event
     */
    public allowDrop(event) {
        event.preventDefault();
    }

    /**
     * called when trying to drop something (param chip) on an element
     * @param event
     */
    public drop(event) {
        event.preventDefault();
        let needToUpdate : boolean = false;
        if (!this.label.innerHTML || this.label.innerHTML === '') return;

        // dropped on the alias column
        if (event.target.className.indexOf('aliases') != -1) {
            this.addToAliases(event);
            needToUpdate = true;
        }

        // comes from the alias column
        if (this.label.parentElement.className.indexOf('aliases') != -1) {
            this.removeFromAliases();
            needToUpdate = true;
        }

        //dropped on chipzone and comes from anywhere else
        if (event.target.className.indexOf('chip_dropzone') != -1 && event.target != this.label.parentElement) {
            this.selectedMapping.unrelatedParams.push(this.label.innerHTML);
            needToUpdate = true;
        }

        // dropped on add new key
        if (event.target.id === "addNewKey") {
            this.selectedMapping.params.push({key: this.label.innerHTML, aliases: []});
            if (this.label.parentElement.className.indexOf('chip_dropzone') != -1) {
                this.selectedMapping.unrelatedParams.splice(this.selectedMapping.unrelatedParams.indexOf(this.label.innerHTML), 1);
                needToUpdate = true;
            }
        }

        //if need to update -> update
        if (needToUpdate) {
            this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
        }
    }

    /**
     * Called if a flag file was dropped on the flags container
     * @param e
     */
    public dropFlagFile(e) {
        if (e.dataTransfer.files.length <= 0) return;
        let file = e.dataTransfer.files[0];
        e.preventDefault();

        /**
         * Read flag file and add flags
         * @type {FileReader}
         */
        let FR = new FileReader();
        FR.onload = (ev: FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            let flags = ParamExtractor.extractFlags(result);
            if (!this.selectedMapping.flags) {
                this.selectedMapping.flags = [];
            }
            this.selectedMapping.flags = this.selectedMapping.flags.concat(flags);
            this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
        };
        FR.readAsText(file);
    }

    /**
     * Adds the given chip to the alias. Both stored in 'event'. Its an HTML-DragEvent
     * @param event
     */
    private addToAliases(event: any) {
        this.selectedMapping.unrelatedParams.splice(this.selectedMapping.unrelatedParams.indexOf(this.label.innerHTML), 1);
        this.selectedMapping.params.forEach((paramAliases) => {
            if (paramAliases.key === event.target.id) {
                paramAliases.aliases.push(this.label.innerHTML);
            }
        });
    }

    /**
     * Removes the dragged chip from its current aliases list
     */
    private removeFromAliases() {
        this.selectedMapping.params.forEach((paramAliases) => {
            if (paramAliases.key === this.label.parentElement.id) {
                paramAliases.aliases.splice(paramAliases.aliases.indexOf(this.label.innerHTML), 1)
            }
        });
    }

    /**
     * Deletes all flags after confirmation.
     */
    public clearFlags() {
        this.confirm.openModal("Clear all Flags?").then((fulfilled) => {
            if (fulfilled) {
                this.selectedMapping.flags = [];
                this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
            }
        });
    }

    /**
     * deletes a single Flag
     * @param {Flag} flag
     */
    public deleteFlag(flag: Flag) {
        this.selectedMapping.flags.splice(this.selectedMapping.flags.indexOf(flag), 1);
        this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
    }

    /**
     * Creates a new flag with key and meaning
     * @param {string} key
     * @param {string} meaning
     */
    public createFlag(key: string, meaning: string) {
        this.selectedMapping.flags.push(new Flag(key, meaning));
        this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping).subscribe((changedEntries) => {
            if (changedEntries === 1) {
                this.notification.success("New Flag created");
                $('#createFlag').modal('close');
            } else {
                this.notification.error("Something went wrong");
            }
        });
    }

    /**
     * Deletes the mapping with the given id. Updates projects using this mapping.
     * @param ID
     */
    public deleteMapping(ID) {
        this.confirm.openModal("Delete Mapping?", "If you delete the mapping, all projects using this mapping will lose their filter options. Delete anyway?").then((fulfilled) => {
            if (fulfilled) {
                this.projectDS.getProjectsWithMapping(ID).subscribe((data) => {
                    data.forEach((project) => {
                        project.mappingID = "";
                        this.projectDS.updateProject(project._id, project);
                    })
                });
                this.mappingDS.deleteMapping(ID);
                this.selectedMapping = null;
            }
        });
    }

    /**
     * opens the edit mapping modal and sets the input field values
     */
    public openEditMapping() {
        this.editedMapping = this.selectedMapping;
        $('#editMapping').modal('open');
        $('#editMappingName').val(this.selectedMapping.name);
    }

    /**
     * Edits the mapping name
     * @param name
     */
    public editMapping(name) {
        this.editedMapping.name = name;
        this.mappingDS.updateMapping((<any>this.editedMapping)._id, this.editedMapping).subscribe((changedEntries) => {
            if (changedEntries === 1) {
                $('#editMapping').modal('close');
                this.notification.success("Mapping updated");
            }
        });
    }
}