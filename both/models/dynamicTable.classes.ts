import {PipeTransform} from "@angular/core";

export interface DynamicTableColumnInterface {
    name: string;
    property: string;
    fix : boolean;
    columnActions : any[];
    active : boolean;
    projectID: string;
}

export class DynamicTableColumn implements DynamicTableColumnInterface {
    public name: string;
    public property: string;
    public fix : boolean;
    public columnActions : any[];
    public active : boolean;
    public projectID: string;

    constructor(name: string = "", property: string = "", fix: boolean = false, projectID: string = "", columnActions : any[] = null) {
        this.name = name;
        this.property = property;
        this.fix = fix;
        this.columnActions = columnActions;
        this.active = false;
        this.projectID = projectID;
    }

    public copyData(column : DynamicTableColumnInterface) : DynamicTableColumn {
        this.name = column.name;
        this.property = column.property;
        this.fix = column.fix;
        this.columnActions = column.columnActions;
        this.active = column.active;
        this.projectID = column.projectID;
        return this;
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