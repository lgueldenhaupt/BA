export class Flag {
    public key : string;
    public meaning: string;

    constructor(key: string = "", meaning: string = "") {
        this.key = key;
        this.meaning = meaning;
    }
}