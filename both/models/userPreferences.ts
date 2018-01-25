import {Filter} from "./filter";
import {DynamicTableColumn, DynamicTableColumnInterface, TableSorting} from "./dynamicTable.classes";

export interface UserPreferencesInterface {
    lastConfigFilter: Filter[];
    lastConfigSetColumns: DynamicTableColumn[];
    configTableSort: TableSorting;
    maxItemsPerPage: number;
}

/**
 *
 */
export class UserPreferences implements UserPreferencesInterface{
    lastConfigFilter: Filter[];
    lastConfigSetColumns: DynamicTableColumn[];
    configTableSort: TableSorting;
    maxItemsPerPage: number;

    constructor(lastConfigFilter: Filter[] = []) {
        this.lastConfigFilter = lastConfigFilter;
    }

    public copyData(data: UserPreferencesInterface) : UserPreferences {
        let columns : DynamicTableColumn[] = [];
        if (data.lastConfigSetColumns) {
            data.lastConfigSetColumns.forEach((column : DynamicTableColumnInterface) => {
                let col = new DynamicTableColumn().copyData(column);
                columns.push(col);
            });
        }
        this.lastConfigSetColumns = columns;
        this.lastConfigFilter = data.lastConfigFilter;
        this.configTableSort = data.configTableSort;
        this.maxItemsPerPage = data.maxItemsPerPage;
        return this;
    }

    public setConfigSetTablePreferences(columns : DynamicTableColumn[]) {
        this.lastConfigSetColumns = columns;
    }

    public setMaxItemsPP(count: number) {
        this.maxItemsPerPage = count;
    }

    public getMaxItemsPP(): number {
        return this.maxItemsPerPage;
    }

    public updateConfigSetTablePreferences(columns : DynamicTableColumn[]) {
        let projectIDs: string[] = [];
        columns.forEach((column) => {
            projectIDs.push(column.projectID);
        });
        let toDelete = [];
        this.lastConfigSetColumns.forEach(column => {
            if (projectIDs.indexOf(column.projectID) != -1) {
                toDelete.push(column);
            }
        });
        toDelete.forEach(column => {
            this.lastConfigSetColumns.splice(this.lastConfigSetColumns.indexOf(column), 1);
        });
        this.lastConfigSetColumns = this.lastConfigSetColumns.concat(columns);
    }

    public setLastConfigFilter(filters: Filter[]) : UserPreferences {
        if (!this.lastConfigFilter) this.lastConfigSetColumns = [];
        this.replaceOldFilters(filters);
        return this;
    }

    public replaceOldFilters(filters : Filter[]) {
        let projectIDs: string[] = [];
        filters.forEach((filter) => {
            projectIDs.push(filter.projectID);
        });
        let toDelete  = [];
        this.lastConfigFilter.forEach((filter) => {
            if (projectIDs.indexOf(filter.projectID) != -1) {
                toDelete.push(filter);
            }
        });
        toDelete.forEach((filter) => {
            this.lastConfigFilter.splice(this.lastConfigFilter.indexOf(filter), 1);
        });
        this.lastConfigFilter = this.lastConfigFilter.concat(filters);
    }

    public getProjectsColumns(projectID: string) : DynamicTableColumn[] {
        let result = [];
        this.lastConfigSetColumns.forEach((column) => {
            if (column.projectID === projectID) {
                result.push(column);
            }
        });
        return result;
    }

    public removeMappingFilters(projectID: string) {
        let toDelete  = [];
        this.lastConfigFilter.forEach((filter) => {
            if (projectID === filter.projectID) {
                toDelete.push(filter);
            }
        });
        toDelete.forEach((filter) => {
            this.lastConfigFilter.splice(this.lastConfigFilter.indexOf(filter), 1);
        });
    }
}