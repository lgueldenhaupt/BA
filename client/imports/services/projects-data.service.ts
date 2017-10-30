import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Project} from "../../../both/models/project.model";
import {ProjectsCollection} from "../../../both/collections/projects.collection";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ProjectsDataService  {
    private data: ObservableCursor<Project>;

    constructor() {
        this.data = ProjectsCollection.find({});
    }

    public getData(): ObservableCursor<Project> {
        return this.data;
    }

    public addData(data) : Observable<string> {
        return ProjectsCollection.insert(data);
    }

    public delete(ID) : Observable<number> {
        return ProjectsCollection.remove(ID);
    }

    public getProject(ID): ObservableCursor<Project> {
        let proj = ProjectsCollection.find({_id: ID}, {});
        return proj;
    }

    public updateProject(id, name, desc) : Observable<number> {
        return ProjectsCollection.update({_id: id}, {name: name, description: desc});
    }

}
