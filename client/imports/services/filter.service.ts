import {Filter} from "../../../both/models/filter";
import {Subject} from "rxjs/Subject";
import {ConfigSet} from "../../../both/models/configSet.model";
import {AliasFinder} from "../helpers/alias-finder";
import {UsersDataService} from "./users-data.service";
import {UserPreferences} from "../../../both/models/userPreferences";

export class FilterService {
    private static _obsSubject: Subject<Filter[]> = new Subject();
    private static filters: Filter[];

    public static setFilters(filters : Filter[]) {
        if (Meteor.user()) {
            if ((<any>Meteor.user()).preferences) {
                let preferences = (<any>Meteor.user()).preferences;
                if (!preferences) preferences = [];
                let newPreferences = new UserPreferences(preferences.lastConfigFilter);
                newPreferences.replaceOldFilters(filters);
                UsersDataService.updateUser(Meteor.userId(), newPreferences);
            } else {
                UsersDataService.updateUser(Meteor.userId(), new UserPreferences(filters));
            }
        }
        FilterService.filters = filters;
        FilterService._obsSubject.next(filters);
    }

    public static getFilters() : Subject<Filter[]> {
        return FilterService._obsSubject;
    }

    public static filterConfigs(configSets : ConfigSet[], mapping) : ConfigSet[] {
        let result = [];
        if (!configSets || configSets.length === 0) return result;
        configSets.forEach(configSet => {
            let add = true;
            if (configSet.params && FilterService.filters) {
                configSet.params.forEach((paramSet) => {
                    FilterService.filters.forEach(filter => {
                        if (filter.isActive() && AliasFinder.areEqual(paramSet.param, filter.key, mapping)) {
                            if (!filter.isEnabledOption(paramSet.value)) {
                                add = false;
                            }
                        }
                    });
                });
            }
            if (add) {
                result.push(configSet);
            }
        });
        return result;
    }
}