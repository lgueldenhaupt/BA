import {Component, OnInit} from "@angular/core";
import template from "./app.component.html";
import style from "./app.component.scss";
import {Router} from "@angular/router";
import {NotificationService} from "../services/notification.service";
import {el} from "@angular/platform-browser/testing/src/browser_util";

declare let $: any;

/**
 * This is the main component containing the main bar and main functions.
 */
@Component({
    selector: "app",
    template,
    styles: [style]
})

export class AppComponent implements OnInit {
    constructor(
        private router: Router,
        private notification: NotificationService
    ) {
    }

    ngOnInit() {
        this.initMaterializeJS();
    }

    private initMaterializeJS() {
        $(document).ready(function(){
            $('.carousel').carousel();
            $('.tooltipped').tooltip({delay: 50});
            $(".button-collapse").sideNav({
                closeOnClick: true
            });
        });
    }

    /**
     * Logs the current user out
     */
    public logOut() {
        Meteor.logout((err) => {
            if (!err) {
                this.notification.success("Logged out");
            }
        });
        this.router.navigate(["/login"]);
    }

    /**
     * Give a toast info about the current logged in user
     */
    public info() {
        if (Meteor.user()) {
            this.notification.warning(Meteor.user().username + " " + Meteor.user()._id);
        } else {
            this.notification.error("Not logged in");
        }

    }
}
