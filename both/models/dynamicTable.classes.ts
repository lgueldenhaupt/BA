import {Pipe, PipeTransform} from "@angular/core";

export class DynamicTableColumn {
    public name: string;
    public property: string;
    public fix : boolean;
    public columnActions : any[];
    public active;

    constructor(name: string, property: string, fix: boolean = false, columnActions : any[] = null) {
        this.name = name;
        this.property = property;
        this.fix = fix;
        this.columnActions = columnActions;
        this.active = false;
    }

    public toggle() {
        this.active = !this.active;
    }
}

export class DynamicTableOptions {
    public name: string;
    public classes: string;
    public containsConfigSets: boolean;
    public searchFilter: PipeTransform;
    public configurable: boolean;

    constructor(name: string, searchFilter : PipeTransform = null, classes : string = "", configurable : boolean = false, containsConfigSets: boolean = false) {
        this.name = name;
        this.classes = classes;
        this.containsConfigSets = containsConfigSets;
        this.searchFilter = searchFilter;
        this.configurable = configurable;
    }
}