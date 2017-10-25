import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {ConfigSet} from "../../../both/models/configSet.model";
import {ConfigSetsCollection} from "../../../both/collections/configsets.collection";

@Injectable()
export class ConfigSetsDataService {
    private data: ObservableCursor<ConfigSet>;

    constructor() {
        this.data = ConfigSetsCollection.find({});
    }

    public getData(): ObservableCursor<ConfigSet> {
        return this.data;
    }

    public addData(data) {
        ConfigSetsCollection.insert(data);
    }

    public delete(ID) {
        ConfigSetsCollection.remove(ID);
    }

    public getProjectConfigs(projectID): ObservableCursor<ConfigSet> {
        return ConfigSetsCollection.find({projectID: projectID});
    }

    public getConfigById(ID): ObservableCursor<ConfigSet> {
        return ConfigSetsCollection.find({_id: ID});
    }

    public updateConfig(ID, config : ConfigSet) {
        ConfigSetsCollection.update({_id: ID}, config);
    }

}
