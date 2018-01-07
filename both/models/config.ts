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
    creator: string;
    image: any;

    constructor(name: string, description: string, projectID: string, creator: string, params: ParamSet[] = [], results: TrainingSet[] = [], id : string = '', image : any = null) {
        this.name = name;
        this.description = description;
        this.projectID = projectID;
        this.params = params;
        this._id = id;
        this.results = results;
        this.creator = creator;
        this.image = image;
    }

    public getValueOf(param : string) : string {
        let result = "";
        this.params.forEach(p => {
            if (p.param === param) {
                result = p.value;
            }
        });
        result = result.replace(/(\r\n|\n|\r)/gm,"");
        return result;
    }

}