export class Project {
    name: string;
    description: string;
    mappingID: string;
    creator: string;
    privateProject: boolean;
    _id: string;

    constructor(name: string = '', description : string = '', creator: string = "", mappingID: string = '', privateProject: boolean = true) {
        this.name = name;
        this.description = description;
        this.mappingID = mappingID;
        this.creator = creator;
        this.privateProject = privateProject;
    }
}
