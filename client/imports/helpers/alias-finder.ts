import {Injectable} from "@angular/core";
import {MappingsDataService} from "../services/mappings-data.service";
import {ParamAliases} from "../../../both/models/paramAliases";
import {Observable} from "rxjs/Observable";
import {Mapping} from "../../../both/models/mapping.model";

@Injectable()
export class AliasFinder{
    private mappings;

    constructor(
        private mappingDS: MappingsDataService
    ) {
        this.mappingDS.getData().subscribe(data => {
            this.mappings = data;
        });
    }

    public getAliases(mappingID, value: string, getOnlyKey : boolean = false) : Observable<string[]> {
        return Observable.create((observer) => {
            this.mappingDS.getMappingById(mappingID).subscribe((mapping) => {
                mapping[0].params.forEach((paramWithAliases : ParamAliases) => {
                    if (paramWithAliases.key === value || paramWithAliases.aliases.indexOf(value) != -1) {
                        observer.next(paramWithAliases.key);
                        if (getOnlyKey) {
                            observer.complete();
                        } else {
                            paramWithAliases.aliases.forEach((alias) => {
                                observer.next(alias);
                            });
                            observer.complete();
                        }
                    }
                })
            })
        });
    }

    public getAliasesStraight(mappingID, value: string, getOnlyKey: boolean = false) : string[] {
        let result = [];
        this.mappings.forEach((mapping : Mapping) => {
            if ((<any>mapping)._id === mappingID) {
                mapping.params.forEach((paramWithAliases : ParamAliases) => {
                    if (paramWithAliases.key === value || paramWithAliases.aliases.indexOf(value) != -1) {
                        if (getOnlyKey) {
                            result.push(paramWithAliases.key);
                        } else {
                            result = result.concat(paramWithAliases.aliases).concat([paramWithAliases.key]);
                        }
                    }
                })
            }
        });
        return result;
    }
}