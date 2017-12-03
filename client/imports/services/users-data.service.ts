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

    public static getUserPreferences() : UserPreferences {
        if (!Meteor.userId()) return;
        let preferences = (<any>Meteor.user()).preferences;
        if (!preferences) {
            preferences = new UserPreferences();
        } else {
            preferences = new UserPreferences().copyData(preferences);
        }
        return preferences;
    }
}