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
            params: [],
            unrelatedParams: []
        };
        configParams.forEach((paramSet) => {
           mapping.params.push({key: paramSet.param, aliases: []});
        });
        return MappingsCollection.insert(mapping);
    }

    public assignConfigToMapping(configParams, mappingID) : Observable<number> {
        let result = Observable.create((observer) => {
            MappingsCollection.find({_id: mappingID}).subscribe((foundMappings) => {
                if (foundMappings && foundMappings[0]) {
                    let mapping = foundMappings[0];
                    configParams.forEach((paramSet) => {
                        if (!this.existsInMapping(paramSet.param, mapping)) {
                            mapping.unrelatedParams.push(paramSet.param);
                        }
                    });
                    this.updateMapping(mappingID, mapping).subscribe((changedMappings) => {
                        if (changedMappings === 1) {
                            observer.next(mapping.unrelatedParams.length);
                        } else {
                            observer.next(-1);
                        }
                    });
                }
            });
        });
        return result;
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

    private existsInMapping(toSearch: string, mapping: Mapping): boolean {
        let found = false;
        mapping.params.forEach((param) => {
            if (param.key.toLowerCase() === toSearch.toLowerCase()) {
                found = true;
            }
            param.aliases.forEach((alias) => {
                if (alias.toLowerCase() === toSearch.toLowerCase()) {
                    found = true;
                }
            })
        });
        mapping.unrelatedParams.forEach((param) => {
            if (param.toLowerCase() === toSearch.toLowerCase()) {
                found = true;
            }
        });
        return found;
    }
}
