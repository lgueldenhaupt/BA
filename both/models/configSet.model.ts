import {ParamSet} from "./paramSet";
import {TrainingSet} from "./trainingSet";

export interface ConfigSet {
    name: string;
    description: string;
    projectID: string;
    params: ParamSet[];
    results: TrainingSet[];
    creator: string;
}
