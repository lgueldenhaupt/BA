import {ParamSet} from "../../../both/models/paramSet";
import {TrainingSet} from "../../../both/models/trainingSet";

export class ParamExtractor {

    public searchForParams(input: string): ParamSet[] {
        let splitByMinus;
        splitByMinus = input.split('-');
        return this.separateParamFromValue(splitByMinus);
    }

    public searchForTrainingSets(input: string[]): TrainingSet[] {
        if (input.length == 0) {
            return [];
        }
        if (input[input.length - 1] == "") {
            input.splice(input.length -1, 1);
        }
        let trainingSets = [];
        let splitToEpochs = input[0].split(',');
        let trainingSetCount = splitToEpochs.length;
        if ((splitToEpochs[trainingSetCount -1].length === 1 && splitToEpochs[trainingSetCount -1].match("[\\n\\r]+")) || splitToEpochs[trainingSetCount -1] === "") {
            trainingSetCount--;
        }
        for (let j = 0; j < trainingSetCount; j++) {
            trainingSets.push({
                name: '',
                epochs: []
            })
        }
        input.forEach((currentEpoch) => {
            let splitEpoch = currentEpoch.split(',');
            for (let i = 0; i < trainingSetCount; i++) {
                trainingSets[i].epochs.push(splitEpoch[i]);
            }
        });
        return trainingSets;
    }

    private separateParamFromValue(input: string[]) {
        let result = [];
        input.forEach(function (str) {
            if (str.length > 0) {
                let splitted = str.split(' ');
                if (splitted.length > 1) {
                    let param = splitted[0];
                    let value = splitted[1];
                    if (param.length > 0) {
                        result.push(new ParamSet(param, value));
                    }
                }
            }
        });
        return result;
    }

}