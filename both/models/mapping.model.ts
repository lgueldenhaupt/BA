import {ParamAliases} from "./paramAliases";
import {Flag} from "./flag";

export interface Mapping {
    name: string;
    params: ParamAliases[];
    unrelatedParams: string[];
    flags: Flag[];
}

export class ParamMapping implements Mapping {
    name: string;
    params: ParamAliases[];
    unrelatedParams: string[];
    _id: string;
    flags: Flag[];

    constructor(name: string, params: ParamAliases[], unrelatedParams: string[], flags: Flag[] = [], _id: string) {
        this.name = name;
        this.params = params;
        this.unrelatedParams = unrelatedParams;
        this.flags = flags;
        this._id = _id;
    }
}
