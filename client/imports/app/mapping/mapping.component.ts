import { Component, OnInit } from "@angular/core";
import template from "./mapping.component.html";
import style from "./mapping.component.scss";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../../both/models/mapping.model";

declare let $ :any;

@Component({
    selector: "mapping",
    template,
    styles: [ style ]
})
export class MappingComponent implements OnInit{
    private mappings: Observable<Mapping[]>;
    private selectedMapping: Mapping;

    constructor(
        private mappingDS: MappingsDataService
    ) {
    }

    ngOnInit(): void {
        this.mappings = this.mappingDS.getData().zone();
    }

    public selectMapping(mapping: Mapping) {
        this.selectedMapping = mapping;
    }
}