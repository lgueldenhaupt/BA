import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../both/models/mapping.model";
import {MappingsCollection} from "../../../both/collections/mappings.collection";

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

    /**
     * Adds the given configparams to the mapping with the given id.
     * @param configParams
     * @param mappingID
     * @returns {Observable<number>}
     */
    public assignConfigToMapping(configParams, mappingID) : Observable<string[]> {
        return Observable.create((observer) => {
            // find mapping
            MappingsCollection.find({_id: mappingID}).subscribe((foundMappings) => {
                if (foundMappings && foundMappings[0]) {
                    let mapping = foundMappings[0];
                    let unrelatedParams = [];
                    configParams.forEach((paramSet) => {
                        //check if param needs to be added
                        if (!this.existsInMapping(paramSet.param, mapping)) {
                            unrelatedParams.push(paramSet.param);
                        }
                    });
                    observer.next(unrelatedParams);
                    observer.complete();
                }
            });
        });
    }

    public addMapping(data) : Observable<string> {
        return MappingsCollection.insert(data);
    }

    public deleteMapping(ID) : Observable<number> {
        return MappingsCollection.remove(ID);
    }

    public getMappingById(ID): ObservableCursor<Mapping> {
        return MappingsCollection.find({_id: ID});
    }

    public updateMapping(ID, mapping : Mapping) : Observable<number> {
        return MappingsCollection.update({_id: ID}, mapping);
    }

    public addUnrelatedParamsToMapping(mappingID, unrelatedParams: string[]) : Observable<number> {
        if (unrelatedParams.length > 0) {
            return MappingsCollection.update({_id: mappingID}, {$push: {unrelatedParams: { $each: unrelatedParams}}});
        }
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
