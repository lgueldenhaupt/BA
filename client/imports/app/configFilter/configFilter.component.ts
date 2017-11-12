import {Component, Input, OnInit} from "@angular/core";
import template from "./configFilter.component.html";
import style from "./configFilter.component.scss";
import {Mapping} from "../../../../both/models/mapping.model";
import {MappingsDataService} from "../../services/mappings-data.service";

declare let $ :any;

@Component({
    selector: "configFilter",
    template,
    styles: [ style ]
})
export class ConfigFilterComponent implements OnInit{
    @Input() mappingID: string;

    private mapping: Mapping;
    private filters: any[];

    constructor(
        private mappingDS: MappingsDataService
    ) {
        this.filters = [];
    }

    ngOnInit(): void {
        this.mappingDS.getMappingById(this.mappingID).subscribe(mappings => {
            this.mapping = mappings[0];
        });
        $(document).ready(function () {
            $('.modal').modal({
                complete: function () {
                    $('.collapsible').collapsible();
                }
            });
        });
    }

    addFilter(key: string) {
        if (this.canAddFilter(key)) {
            this.filters.push({
                key: key,
                options: []
            });
        }
    }

    canAddFilter(key :string) : boolean {
        let result = true;
        this.filters.forEach(filter => {
            if (filter.key === key) {
                result = false;
            }
        });
        return result;
    }
}