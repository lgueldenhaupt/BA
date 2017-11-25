import {Injectable} from "@angular/core";
import {UserPreferences} from "../../../both/models/userPreferences";

@Injectable()
export class UsersDataService  {

    public static updateUser(userID: string, preferences: UserPreferences) {
        Meteor.users.update(userID, {
            $set: {
                preferences: preferences
            }
        }, {}, (err) => {
            if (err) {
                console.log(err);
            }

        })
    }
}