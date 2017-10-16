import {Component, OnInit} from "@angular/core";
import template from "./app.component.html";
import style from "./app.component.scss";

declare let $: any;

@Component({
    selector: "app",
    template,
    styles: [style]
})

export class AppComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        this.initMaterializeJS();
    }

    private initMaterializeJS() {
        $(document).ready(function(){
            $('.carousel').carousel();
        });
        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
        });
    }
}
