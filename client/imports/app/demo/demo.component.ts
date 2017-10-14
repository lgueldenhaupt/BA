import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {DemoDataService} from "./demo-data.service";
import {Demo} from "../../../../both/models/demo.model";
import template from "./demo.component.html";
import style from "./demo.component.scss";
declare var jquery:any;
declare var $ :any;

@Component({
    selector: "demo",
    template,
    styles: [style]
})
export class DemoComponent implements OnInit {
    greeting: string;
    data: Observable<Demo[]>;

    constructor(private demoDataService: DemoDataService) {
        this.greeting = "Hello Demo Component!";
    }

    ngOnInit() {
        this.data = this.demoDataService.getData().zone();
    }

    addNewItem(name, age) {
        this.demoDataService.addData({
            name: name,
            age: age
        })
    }


    deleteItem(itemID) {
        this.demoDataService.delete(itemID);
    }

    openModal() {
        $(document).ready(function(){
            // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
            $('.modal').modal();
        });
    }
}
