import {ParamSet} from "./paramSet";

export interface ConfigSet {
    name: string;
    description: string;
    projectID: string;
    params: ParamSet[];
}
