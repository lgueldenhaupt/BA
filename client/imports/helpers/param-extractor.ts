
export class ParamExtractor {

    public searchForParams(input: string): Object[] {
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
                        result.push({param: param, value: value});
                    }
                }
            }
        });
        return result;
    }

}