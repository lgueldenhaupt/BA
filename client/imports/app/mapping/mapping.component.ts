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
        event.target.appendChild(this.label);
    }
}