import {ParamAliases} from "./paramAliases";
import {Flag} from "./flag";

export interface Mapping {
    name: string;
    params: ParamAliases[];
    unrelatedParams: string[];
    flags: Flag[];
    creator: string;
}

export class ParamMapping implements Mapping {
    name: string;
    params: ParamAliases[];
    unrelatedParams: string[];
    _id: string;
    flags: Flag[];
    creator: string;

    constructor(name: string, creator: string, params: ParamAliases[], unrelatedParams: string[], flags: Flag[] = [], _id: string) {
        this.name = name;
        this.params = params;
        this.unrelatedParams = unrelatedParams;
        this.flags = flags;
        this._id = _id;
        this.creator = creator;
    }

    public static getFlagName(flags : Flag[], key : string) : string {
        let result = key;
        flags.forEach((flag : Flag) => {
            if (flag.key === key) {
                result = flag.meaning;
            }
        });
        return result;
    }
}
