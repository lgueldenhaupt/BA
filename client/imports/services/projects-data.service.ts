import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Project} from "../../../both/models/project.model";
import {ProjectsCollection} from "../../../both/collections/projects.collection";
import {Observable} from "rxjs/Observable";
import {ConfigSetsDataService} from "./configsets-data.service";

@Injectable()
export class ProjectsDataService  {
    private data: ObservableCursor<Project>;

    constructor(
        private configDS : ConfigSetsDataService
    ) {
        this.data = ProjectsCollection.find({});
    }

    public getData(): ObservableCursor<Project> {
        return this.data;
    }

    public getSortedData(options): ObservableCursor<Project> {
        return ProjectsCollection.find({}, options);
    }

    public addData(data) : Observable<string> {
        return ProjectsCollection.insert(data);
    }

    public delete(ID) : Observable<number> {
        this.configDS.deleteProjectsConfigs(ID);
        return ProjectsCollection.remove(ID);
    }

    public getProject(ID): ObservableCursor<Project> {
        return ProjectsCollection.find({_id: ID}, {});
    }

    public updateProject(id, project: Project) : Observable<number> {
        return ProjectsCollection.update({_id: id}, project);
    }

    public getProjectsMapping(id) : Observable<string> {
        return Observable.create(observer => {
            ProjectsCollection.find({_id: id}).subscribe((found : Project[]) => {
                if (found[0]) {
                    observer.next(found[0].mappingID);
                    observer.complete();
                }
            })
        })
    }

}
