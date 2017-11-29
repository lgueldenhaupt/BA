import {Filter} from "./filter";

export class UserPreferences {
    lastConfigFilter: Filter[];

    constructor(lastConfigFilter: Filter[] = []) {
        this.lastConfigFilter = lastConfigFilter;
    }

    public setLastConfigFilter(filters: Filter[]) {
        this.lastConfigFilter = filters;
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