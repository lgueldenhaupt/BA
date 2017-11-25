export class Project {
    name: string;
    description: string;
    mappingID: string;
    creator: string;
    _id: string;

    constructor(name: string = '', description : string = '', creator: string = "", mappingID: string = '') {
        this.name = name;
        this.description = description;
        this.mappingID = mappingID;
        this.creator = creator;
    }
}
