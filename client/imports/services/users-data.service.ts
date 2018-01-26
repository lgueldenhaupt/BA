import {Injectable} from "@angular/core";
import {UserPreferences} from "../../../both/models/userPreferences";
import {Filter} from "../../../both/models/filter";

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
        if (!Meteor.userId() || !Meteor.user()) return;
        let preferences = (<any>Meteor.user()).preferences;
        if (!preferences) {
            preferences = new UserPreferences();
        } else {
            preferences = new UserPreferences().copyData(preferences);
        }
        return preferences;
    }

    public static removeProjectFilters(projectID: string) {
        let prefs = (<any>Meteor.user()).preferences;
        if (prefs && prefs.lastConfigFilter) {
            let toDelete = [];
            prefs.lastConfigFilter.forEach((filter: Filter, index) => {
                if (filter.projectID === projectID) {
                    toDelete.push(index);
                }
            });
            for (let i = toDelete.length -1; i >= 0; i--) {
                prefs.lastConfigFilter.splice(toDelete[i], 1);
            }
            Meteor.users.update(Meteor.userId(), {
                $set: {
                    preferences: prefs
                }
            }, {}, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
}