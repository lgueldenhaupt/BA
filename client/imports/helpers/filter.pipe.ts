import { Pipe, PipeTransform } from '@angular/core';
import {ParamSet} from "../../../both/models/paramSet";
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