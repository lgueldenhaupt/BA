import {Component, OnDestroy, OnInit} from "@angular/core";
import template from "./login.component.html";
import style from "./login.component.scss";
import {NotificationService} from "../../services/notification.service";
import {Router} from "@angular/router";

declare let $ :any;
declare let Meteor : any;

/**
 * This component represents the login page
 */
@Component({
    selector: "login",
    template,
    styles: [ style ]
})
export class LoginComponent implements OnInit, OnDestroy{

    constructor(
        private notification : NotificationService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
    }

    /**
     * Tries to log in the user with the username and password.
     * @param {string} username
     * @param {string} password
     */
    logIn(username: string, password: string) {
        // get LDAP information from settings.json
        if (!Meteor.settings.public.ldap.dn || !Meteor.settings.public.ldap.url) return;
        let dn = Meteor.settings.public.ldap.dn;
        let url = Meteor.settings.public.ldap.url;

        if (!Meteor.user()) {
            // try to log in if no user is logged in.
            // loginWithLDAP is a function of accounts-ldap package
            Meteor.loginWithLDAP(username, password, {dn: dn, url: url}, (err) => {
                if (err) {
                    if (err.reason === "Invalid Credentials") {
                        this.notification.error("Invalid Credentials");
                    } else {
                        this.notification.error("Login failed");
                    }
                } else {
                    this.notification.success("Logged in");
                }
            });
        } else {
            this.notification.error("Already logged in");
        }
        // setTimeout(() => {
        //     this.router.navigate(["/dashboard"]);
        // }, 3000);
    }

}