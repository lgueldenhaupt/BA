import {Injectable} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {Hero} from "../../../../both/models/hero.model";
import {HeroCollection} from "../../../../both/collections/heroes.collection";

@Injectable()
export class HeroDataService {
    private data: ObservableCursor<Hero>;

    constructor() {
        this.data = HeroCollection.find({});
    }

    public getData(): ObservableCursor<Hero> {
        return this.data;
    }

    public addData(data) {
        HeroCollection.insert(data);
    }

    public delete(ID) {
        HeroCollection.remove(ID);
    }

}
