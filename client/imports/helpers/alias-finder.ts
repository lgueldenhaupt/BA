import {Injectable} from "@angular/core";
import {MappingsDataService} from "../services/mappings-data.service";
import {ParamAliases} from "../../../both/models/paramAliases";
import {Observable} from "rxjs/Observable";
import {Mapping, ParamMapping} from "../../../both/models/mapping.model";

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

    /**
     * Gets the aliases of a value. Returns an observable
     * @param mappingID
     * @param {string} value
     * @param {boolean} getOnlyKey
     * @returns {Observable<string[]>}
     */
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

    /**
     * Gets the aliases of a value for a mapping. Returns a string array without async operations.
     * @param mappingID
     * @param {string} value
     * @param {boolean} getOnlyKey
     * @returns {string[]}
     */
    public getAliasesStraight(mappingID, value: string, getOnlyKey: boolean = false) : string[] {
        let result = [];
        // goes through all mappings
        this.mappings.forEach((mapping : Mapping) => {
            if ((<any>mapping)._id === mappingID) {
                mapping.params.forEach((paramWithAliases : ParamAliases) => {
                    // add aliases to result array or only key if 'getOnlyKey'
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

    /**
     *  Checks if two strings are equal on mappings layer. key === key || key === alias
     * @param {string} first
     * @param {string} second
     * @param mapping
     * @returns {boolean}
     */
    public static areEqual(first: string, second: string, mapping) : boolean {
        let result = false;
        if (!mapping) return result;
        first = first.toLowerCase();
        second = second.toLowerCase();
        if (first === second){
            return true;
        }
        mapping.params.forEach((paramWithAliases : ParamAliases) => {
            if (paramWithAliases.key === first && paramWithAliases.aliases.indexOf(second) != -1) {
                result = true;
            } else if (paramWithAliases.key === second && paramWithAliases.aliases.indexOf(first) != -1) {
                result = true;
            }
        });
        return result;
    }

    /**
     * Gets the meaning of a flag
     * @param mappingID
     * @param {string} key
     * @returns {string}
     */
    public getFlagMeaning(mappingID, key: string) : string {
        if (!mappingID ||!key) return key;
        let result = key;
        if (this.mappings) {
            this.mappings.forEach((mapping: Mapping) => {
                if ((<ParamMapping>mapping)._id === mappingID) {
                    result = ParamMapping.getFlagName(mapping.flags, key);
                }
            });
        }
        return result;
    }
}