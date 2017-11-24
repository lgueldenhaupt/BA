import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";

/**
 * This is the guard to check if a person is logged in
 */
@Injectable()
export class IsLoggedIn implements CanActivate {

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (Meteor.user() && Meteor.user()._id) {
            return true;
        } else {
            return false;
        }
    }
}