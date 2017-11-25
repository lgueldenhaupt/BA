import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {NotificationService} from "../services/notification.service";

/**
 * This is the guard to check if a person is logged in
 */
@Injectable()
export class IsLoggedIn implements CanActivate {

    constructor(
        private router: Router,
        private notification: NotificationService
    ) {

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (Meteor.user() && Meteor.user()._id) {
            return true;
        } else {
            this.router.navigate(['/login']);
            this.notification.error("Please log in first");
            return false;
        }
    }
}