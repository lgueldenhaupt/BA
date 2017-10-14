import { Component, OnInit } from "@angular/core";
import template from "./heroes.component.html";
import style from "./heroes.component.scss";
import { HeroDataService} from "./hero-data.service";
import {Hero} from "../../../../both/models/hero.model";
import {Observable} from "rxjs/Observable";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";

declare var $ :any;

@Component({
    selector: "heroes",
    template,
    styles: [ style ]
})
export class HeroesComponent implements OnInit{
    heroes: Observable<Hero[]>;
    photoString: any = '';
    age: number;
    name: string;

    dataInput(event) {
        var input = event.srcElement.files;
        if (input && input[0]) {
            let FR = new FileReader();
            FR.onload = (ev : FileReaderEvent) => {
                let result = ev.target.result ? ev.target.result : '';
                this.photoString = result;
            };
            FR.readAsDataURL(input[0]);
        }
    }

    addHeroToDB() {
        this.heroDataService.addData({name: this.name, age: this.age, photo: this.photoString});
        this.name = '';
        this.age = 0;
        this.photoString = '';
    }


    constructor(private heroDataService: HeroDataService) {
        $(document).ready(function(){
            $('.carousel').carousel();
        });
    }

    ngOnInit(): void {
        this.heroes = this.heroDataService.getData().zone();
    }

}
