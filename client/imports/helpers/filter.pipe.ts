import { Pipe, PipeTransform } from '@angular/core';
import {ParamSet} from "../../../both/models/paramSet";
import {Filter} from "../../../both/models/filter";
import {ParamAliases} from "../../../both/models/paramAliases";
@Pipe({
    name: 'projects'
})
export class ProjectFilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if(!items) return [];
        if(!searchText) return items;
        searchText = searchText.toLowerCase();
        return items.filter( it => {
            return it.name.toLowerCase().includes(searchText) || it.description.toLowerCase().includes(searchText);
        });
    }
}

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], searchText: string): any[] {
        if(!items) return [];
        if(!searchText) return items;
        searchText = searchText.toLowerCase();
        return items.filter( it => {
            return it.toLowerCase().includes(searchText);
        });
    }
}

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

@Pipe({
    name: 'filterBubble'
})
export class FilterBubblePipe implements PipeTransform {
    transform(array: Array<any>, property: string): Array<any> {
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

