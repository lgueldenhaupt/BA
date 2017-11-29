
import {Option} from "./option.interface";

export class Filter  {
    public key : string;
    public active: boolean;
    public options: Option[];
    public projectID: string;

    constructor(key : string, options: Option[] = [], projectID: string, active : boolean = true) {
        this.key = key;
        this.options = options;
        this.active = active;
        this.projectID = projectID;
    }

    toggle() {
        this.active = !this.active;
    }

    setActive(val : boolean = true) {
        this.active = val;
    }

    public isActive() {
        return this.active;
    }

    public isEnabledOption(value : string) : boolean {
        value = value.toLowerCase();
        let result = true;
        this.options.forEach(option => {
            if (option.name.toLowerCase() === value && !option.enabled) {
                result = false;
            }
        });
        return result;
    }
}