import {ConfigSet} from "./configSet.model";
import {ParamSet} from "./paramSet";

export class Config implements ConfigSet{
    _id: string;
    name: string;
    description: string;
    projectID: string;
    params: ParamSet[];

    constructor(name: string, description: string, projectID: string, params: ParamSet[]) {
        this.name = name;
        this.description = description;
        this.projectID = projectID;
        this.params = params;
        this._id = '';
    }
}