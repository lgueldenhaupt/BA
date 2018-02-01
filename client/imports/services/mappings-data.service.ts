import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../both/models/mapping.model";
import {MappingsCollection} from "../../../both/collections/mappings.collection";
import {ProjectsCollection} from "../../../both/collections/projects.collection";
import {ProjectsDataService} from "./projects-data.service";
import {ParamAliases} from "../../../both/models/paramAliases";
import {map} from "rxjs/operator/map";
import {ConfigSetsDataService} from "./configsets-data.service";
import {ConfigSet} from "../../../both/models/configSet.model";
import {ParamSet} from "../../../both/models/paramSet";
import {AliasFinder} from "../helpers/alias-finder";

@Injectable()
export class MappingsDataService {
    private data: ObservableCursor<Mapping>;

    constructor(
        private configDS : ConfigSetsDataService
    ) {
        this.data = MappingsCollection.find({});
    }

    public getData(): ObservableCursor<Mapping> {
        return this.data;
    }

    public addMappingFromConfig(name, configParams) : Observable<string> {
        let mapping = {
            name: name,
            creator: Meteor.userId(),
            params: [],
            unrelatedParams: [],
            flags: []
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
        } else {
            return Observable.create((obs)=> {
                obs.next([]);
            });
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

    /**
     * Gets those parameters that are relevant to the given project and related in a mapping
     * @returns {Observable<ParamAliases[]>}
     */
    public getProjectRelatedMappingParams(mapping: Mapping, projectID: string) : Observable<ParamAliases[]> {
        if (!mapping || !mapping.params) return;
        return Observable.create(observer => {
            let mappingParams : ParamAliases[] = Object.assign([], mapping.params);
            this.configDS.getProjectConfigs(projectID).subscribe((configSets: ConfigSet[]) => {
                let foundParams = [];
                let intersectionParams : ParamAliases[] = [];
                configSets.forEach((configSet : ConfigSet) => {
                    configSet.params.forEach((paramSet: ParamSet) => {
                        if (foundParams.indexOf(paramSet.param) == -1) {
                            foundParams.push(paramSet.param);
                        }
                    })
                });
                for (let i = mappingParams.length -1; i >= 0; i--) {
                    if (foundParams.indexOf(mappingParams[i].key) != -1) {
                        intersectionParams.push(mappingParams[i]);
                        continue;
                    }
                    mappingParams[i].aliases.forEach((alias : string) =>{
                        if (foundParams.indexOf(alias) != -1) {
                            intersectionParams.push(mappingParams[i]);
                        }
                    });
                }
                observer.next(intersectionParams);
            });
        });
    }
}
