import { Component, OnInit } from "@angular/core";
import template from "./mapping.component.html";
import style from "./mapping.component.scss";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../../both/models/mapping.model";
import {ActivatedRoute, Router} from "@angular/router";

declare let $ :any;

@Component({
    selector: "mapping",
    template,
    styles: [ style ]
})
export class MappingComponent implements OnInit{
    private mappings: Observable<Mapping[]>;
    private selectedMapping: Mapping;
    private id: string;
    private label: any;

    constructor(
        private mappingDS: MappingsDataService,
        private route: ActivatedRoute,
        private router: Router
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
}