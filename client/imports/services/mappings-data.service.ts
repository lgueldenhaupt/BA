import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../both/models/mapping.model";
import {MappingsCollection} from "../../../both/collections/mappings.collection";
import {ParamSet} from "../../../both/models/paramSet";
import {ParamAliases} from "../../../both/models/paramAliases";

@Injectable()
export class MappingsDataService {
    private data: ObservableCursor<Mapping>;

    constructor() {
        this.data = MappingsCollection.find({});
    }

    public getData(): ObservableCursor<Mapping> {
        return this.data;
    }

    public addMappingFromConfig(name, configParams) : Observable<string> {
        let mapping = {
            name: name,
            params: []
        };
        configParams.forEach((paramSet) => {
           mapping.params.push({key: paramSet.param, aliases: []});
        });
        return MappingsCollection.insert(mapping);
    }

    public addMapping(data) : Observable<string> {
        return MappingsCollection.insert(data);
    }

    public delete(ID) : Observable<number> {
        return MappingsCollection.remove(ID);
    }

    public getMappingById(ID): ObservableCursor<Mapping> {
        return MappingsCollection.find({_id: ID});
    }

    public updateMapping(ID, mapping : Mapping) : Observable<number> {
        return MappingsCollection.update({_id: ID}, mapping);
    }
}
