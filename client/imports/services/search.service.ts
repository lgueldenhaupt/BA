import {Observable} from "rxjs/Observable";
import {Injectable, Input} from "@angular/core";
import {ObservableCursor} from "meteor-rxjs";
import {FromEventObservable} from "rxjs/observable/FromEventObservable";

declare let $ : any;
declare let Rx : any;

@Injectable()
export class SearchService {
    search : any;
    query$ : any;


    constructor() {
        this.search = $('#main_search');
        this.query$ = Observable.fromEvent(this.search, 'keyup');
    }

    public getSearchQuery() : FromEventObservable<Event> {
        return this.query$;
    }



}