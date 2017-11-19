import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {ConfigSet} from "../../../both/models/configSet.model";
import {ConfigSetsCollection} from "../../../both/collections/configsets.collection";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ConfigSetsDataService {
    private data: ObservableCursor<ConfigSet>;

    constructor() {
        this.data = ConfigSetsCollection.find({});
    }

    public getData(): ObservableCursor<ConfigSet> {
        return this.data;
    }

    public addConfig(data) : Observable<string> {
        return ConfigSetsCollection.insert(data);
    }

    public delete(ID) : Observable<number> {
        return ConfigSetsCollection.remove(ID);
    }

    public getProjectConfigs(projectID): ObservableCursor<ConfigSet> {
        return ConfigSetsCollection.find({projectID: projectID});
    }

    public getConfigById(ID): ObservableCursor<ConfigSet> {
        return ConfigSetsCollection.find({_id: ID});
    }

    public updateConfig(ID, config : ConfigSet) : Observable<number> {
        return ConfigSetsCollection.update({_id: ID}, config);
    }

    public deleteProjectsConfigs(projectID : string) {
        let configs = this.data.fetch();
        configs.forEach((config) => {
            if (config.projectID === projectID) {
                ConfigSetsCollection.remove((<any>config)._id);
            }
        });
    }
}
