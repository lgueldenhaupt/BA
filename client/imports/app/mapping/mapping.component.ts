import { Component, OnInit } from "@angular/core";
import template from "./mapping.component.html";
import style from "./mapping.component.scss";

declare let $ :any;

@Component({
    selector: "mapping",
    template,
    styles: [ style ]
})
export class MappingComponent implements OnInit{

    constructor(
    ) {
    }

    ngOnInit(): void {

    }
}