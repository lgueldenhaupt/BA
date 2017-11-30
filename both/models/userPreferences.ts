import {Filter} from "./filter";
import {DynamicTableColumn, DynamicTableColumnInterface} from "./dynamicTable.classes";

export interface UserPreferencesInterface {
    lastConfigFilter: Filter[];
    lastConfigSetColumns: DynamicTableColumn[];
}

/**
 *
 */
export class UserPreferences implements UserPreferencesInterface{
    lastConfigFilter: Filter[];
    lastConfigSetColumns: DynamicTableColumn[];

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
        return this;
    }

    public setConfigSetTablePreferences(columns : DynamicTableColumn[]) {
        this.lastConfigSetColumns = columns;
    }

    public setLastConfigFilter(filters: Filter[]) : UserPreferences {
        if (!this.lastConfigFilter) this.lastConfigSetColumns = [];
        this.replaceOldFilters(filters);
        return this;
    }

    public replaceOldFilters(filters : Filter[]) {
        let mappingsIDs: string[] = [];
        filters.forEach((filter) => {
            mappingsIDs.push(filter.projectID);
        });
        let toDelete  = [];
        this.lastConfigFilter.forEach((filter) => {
            if (mappingsIDs.indexOf(filter.projectID) != -1) {
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