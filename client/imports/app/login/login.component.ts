import { Component, OnInit } from "@angular/core";
import template from "./login.component.html";
import style from "./login.component.scss";

declare let $ :any;

@Component({
    selector: "project",
    template,
    styles: [ style ]
})
export class LoginComponent implements OnInit{

    constructor(
    ) {
    }

    ngOnInit(): void {

    }

    callServer() {
        console.log()
    }
}