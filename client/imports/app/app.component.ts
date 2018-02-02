import {Component, OnInit} from "@angular/core";
import template from "./app.component.html";
import styles from "./app.component.scss";
import {Router} from "@angular/router";
import {NotificationService} from "../services/notification.service";
import {animate, group, query, style, transition, trigger} from "@angular/animations";

declare let $: any;

/**
 * This is the main component containing the main bar and main functions.
 */
@Component({
    selector: "app",
    template,
    styles: [styles],
    animations : [
        trigger('routeAnimation', [
            transition('1 => 2, 2 => 3, 1 => 3', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [
                        animate('0.5s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)' })),
                    ]),
                    query(':enter', animate('0.5s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))),
                ]),
            ]),
            transition('3 => 2, 2 => 1, 3 => 1', [
                style({ height: '!' }),
                query(':enter', style({ transform: 'translateX(-100%)' })),
                query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
                group([
                    query(':leave', [
                        animate('0.5s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(100%)' })),
                    ]),
                    query(':enter', animate('0.5s cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)' }))),
                ]),
            ]),
        ])
    ]
})

export class AppComponent implements OnInit {
    constructor(
        private router: Router,
        private notification: NotificationService
    ) {
    }

    ngOnInit() {
        this.initMaterializeJS();
        Meteor.subscribe('projects-collection');
        Meteor.subscribe('configsets-collection');
        Meteor.subscribe('mappings-collection');
        Meteor.subscribe('users');
        Meteor.subscribe('files');
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

    public getDepth(outlet) {
        return outlet.activatedRouteData['depth'];
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

    public loggedOut() {
        return !Meteor.user();
    }
}
