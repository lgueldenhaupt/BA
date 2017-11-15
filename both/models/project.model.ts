export class Project {
    name: string;
    description: string;
    mappingID: string;
    _id: string;

    constructor(name: string = '', description : string = '', mappingID: string = '') {
        this.name = name;
        this.description = description;
        this.mappingID = mappingID;
    }
}
