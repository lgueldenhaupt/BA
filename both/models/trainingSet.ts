export class TrainingSet {
    name: string;
    epochs: number[];

    constructor(name : string = '', epochs: number[] = []) {
        this.name = name;
        this.epochs = epochs;
    }

    addEpoch(value: number) {
        this.epochs.push(value);
    }
}