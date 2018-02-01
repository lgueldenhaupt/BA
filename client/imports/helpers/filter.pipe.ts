import { Pipe, PipeTransform } from '@angular/core';
import {ParamSet} from "../../../both/models/paramSet";
import {Filter} from "../../../both/models/filter";
import {ParamAliases} from "../../../both/models/paramAliases";
import {Project} from "../../../both/models/project.model";
import {Flag} from "../../../both/models/flag";

/**
 * This filter pipe is used to filter projects by name or description.
 * compares given searchText with name and description.
 */
@Pipe({
    name: 'search'
})
export class SearchFilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if(!items) return [];
        if(!searchText) return items;
        searchText = searchText.toLowerCase();
        return items.filter( it => {
            for (let prop in it) {
                if (it.hasOwnProperty(prop)) {
                    if (typeof it[prop] === "string" && it[prop].toLowerCase().includes(searchText)) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
}

/**
 * This filter pipe is used to filter strings by the given searchText
 */
@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: string[], searchText: string): string[] {
        if(!items) return [];
        if(!searchText) return items;
        searchText = searchText.toLowerCase();
        return items.filter( it => {
            return it.toLowerCase().includes(searchText);
        });
    }
}

/**
 * This filter pipe is used to filter configs by name or description.
 * compares given searchText with name and description.
 */
@Pipe({
    name: 'configs'
})
export class ConfigsPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if(!items) return [];
        if(!searchText) return items;
        searchText = searchText.toLowerCase();
        return items.filter( (it : ParamSet) => {
            return it.param.toLowerCase().includes(searchText) || it.value.toLowerCase().includes(searchText);
        });
    }
}

/**
 * This filter pipe sorts the given array by the given criteria
 */
@Pipe({
    name: 'sortByCriteria'
})
export class CriteriaSortPipe implements PipeTransform {
    transform(array: Array<any>, property: string): Array<any> {
        if (!array || array.length == 0) return [];
        array.sort((a: any, b: any) => {
            if (a[property] < b[property]) {
                return -1;
            } else if (a[property] > b[property]) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}

/**
 * This filter pipe sorts the array of strings
 */
@Pipe({
    name: 'stringSort'
})
export class StringSort implements PipeTransform {
    transform(array: Array<string>, args: string): Array<string> {
        array.sort((a: any, b: any) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}

@Pipe({
    name: 'userProjects'
})
export class UserProjects implements PipeTransform {
    transform(array: Array<Project>, showUsers: boolean): Array<Project> {
        if (!array || !(array.length > 0)) return [];
        if (showUsers) {
            return array.filter( (proj : Project) => {
                return proj.creator === Meteor.userId();
            });
        } else {
            return array;
        }
    }
}

@Pipe({
    name: 'flagTranslate'
})
export class FlagTranslate implements PipeTransform {
    transform(value: string, flags: Flag[]): string {
        let result = value;
        flags.forEach((flag) => {
            if (flag.key == value) {
                result = flag.meaning;
            }
        });
        return result;
    }
}