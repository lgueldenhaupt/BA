import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Project} from "../../../../both/models/project.model";
import {ProjectsCollection} from "../../../../both/collections/projects.collection";

@Injectable()
export class ProjectsDataService  {
    private data: ObservableCursor<Project>;

    constructor() {
        this.data = ProjectsCollection.find({});
    }

    public getData(): ObservableCursor<Project> {
        return this.data;
    }

    public addData(data) {
        ProjectsCollection.insert(data);
    }

    public delete(ID) {
        ProjectsCollection.remove(ID);
    }

}