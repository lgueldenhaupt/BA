import {ParamSet} from "../../../both/models/paramSet";

export class ParamExtractor {

    public searchForParams(input: string): ParamSet[] {
        let splitByMinus;
        splitByMinus = input.split('-');
        return this.separateParamFromValue(splitByMinus);
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