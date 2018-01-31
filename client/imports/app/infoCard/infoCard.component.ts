import {Component, Input} from "@angular/core";
import template from "./infoCard.component.html";
import styles from "./infoCard.component.scss";

@Component({
    selector: 'infoCard',
    template,
    styles: [styles]
})
export class InfoCardComponent {
    @Input() title: string = "Info";
    @Input() text: string;

    public showInfo : boolean = false;

}

