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
        $(document).ready(function () {
            $('#createFlag').modal();
            $('#editMapping').modal();
        });
    }

    public selectMapping(mapping: any) {
        this.router.navigate(['/mapping', mapping._id]);
    }

    public drag(event) {
        event.dataTransfer.setData("text", event.target.id);
        this.label = event.srcElement;
    }

    public allowDrop(event) {
        event.preventDefault();
    }

    public drop(event) {
        event.preventDefault();
        let needToUpdate : boolean = false;
        if (!this.label.innerHTML || this.label.innerHTML === '') return;
        if (event.target.className.indexOf('aliases') != -1) {
            this.addToAliases(event);
            needToUpdate = true;
        }
        if (this.label.parentElement.className.indexOf('aliases') != -1) {
            this.removeFromAliases();
            needToUpdate = true;
        }
        if (event.target.className.indexOf('chip_dropzone') != -1 && event.target != this.label.parentElement) {
            this.selectedMapping.unrelatedParams.push(this.label.innerHTML);
            needToUpdate = true;
        }
        if (event.target.id === "addNewKey") {
            this.selectedMapping.params.push({key: this.label.innerHTML, aliases: []});
            if (this.label.parentElement.className.indexOf('chip_dropzone') != -1) {
                this.selectedMapping.unrelatedParams.splice(this.selectedMapping.unrelatedParams.indexOf(this.label.innerHTML), 1);
                needToUpdate = true;
            }
        }
        if (needToUpdate) {
            this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
        }
    }

    public dropFlagFile(e) {
        if (e.dataTransfer.files.length <= 0) return;
        let file = e.dataTransfer.files[0];
        e.preventDefault();
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

    private addToAliases(event: any) {
        this.selectedMapping.unrelatedParams.splice(this.selectedMapping.unrelatedParams.indexOf(this.label.innerHTML), 1);
        this.selectedMapping.params.forEach((paramAliases) => {
            if (paramAliases.key === event.target.id) {
                paramAliases.aliases.push(this.label.innerHTML);
            }
        });
    }

    private removeFromAliases() {
        this.selectedMapping.params.forEach((paramAliases) => {
            if (paramAliases.key === this.label.parentElement.id) {
                paramAliases.aliases.splice(paramAliases.aliases.indexOf(this.label.innerHTML), 1)
            }
        });
    }

    public clearFlags() {
        this.confirm.openModal("Clear all Flags?").then((fulfilled) => {
            if (fulfilled) {
                this.selectedMapping.flags = [];
                this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
            }
        });
    }

    public deleteFlag(flag: Flag) {
        this.selectedMapping.flags.splice(this.selectedMapping.flags.indexOf(flag), 1);
        this.mappingDS.updateMapping((<any>this.selectedMapping)._id, this.selectedMapping);
    }

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

    public openEditMapping() {
        this.editedMapping = this.selectedMapping;
        $('#editMapping').modal('open');
        $('#editMappingName').val(this.selectedMapping.name);
    }

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