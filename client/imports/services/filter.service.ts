import {Filter} from "../../../both/models/filter";
import {Subject} from "rxjs/Subject";
import {ConfigSet} from "../../../both/models/configSet.model";
import {AliasFinder} from "../helpers/alias-finder";

export class FilterService {
    private static _obsSubject: Subject<Filter[]> = new Subject();
    private static filters: Filter[];

    public static setFilters(filters : Filter[]) {
        FilterService.filters = filters;
        FilterService._obsSubject.next(filters);
    }

    public static getFilters() : Subject<Filter[]> {
        return FilterService._obsSubject;
    }

    public static filterConfigs(configSets : ConfigSet[], mapping) : ConfigSet[] {
        let result = [];
        configSets.forEach(configSet => {
            let add = true;
            configSet.params.forEach((paramSet) => {
                FilterService.filters.forEach(filter => {
                    if (filter.isActive() && AliasFinder.areEqual(paramSet.param, filter.key, mapping)) {
                        if (!filter.isEnabledOption(paramSet.value)) {
                            console.log("do not add");
                            add = false;
                        }
                    }
                });
            });
            if (add) {
                result.push(configSet);
            }
        });
        return result;
    }
}