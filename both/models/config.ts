import {ConfigSet} from "./configSet.model";
import {ParamSet} from "./paramSet";
import {TrainingSet} from "./trainingSet";

export class Config implements ConfigSet {
    _id: string;
    name: string;
    description: string;
    projectID: string;
    params: ParamSet[];
    results: TrainingSet[];
    mappingID: string;

    constructor(name: string, description: string, projectID: string, params: ParamSet[] = [], results: TrainingSet[] = [], id : string = '', mappingID : string = '') {
        this.name = name;
        this.description = description;
        this.projectID = projectID;
        this.params = params;
        this._id = id;
        this.mappingID = mappingID;
        this.results = results;
    }

}