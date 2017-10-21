import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";
import {FromEventObservable} from "rxjs/observable/FromEventObservable";
import {Router} from "@angular/router";

declare let $ : any;
declare let Rx : any;

@Injectable()
export class SearchService {
    search : any;
    query$ : any;


    constructor(
        private router: Router
    ) {
        this.search = $('#main_search');
        this.query$ = Observable.fromEvent(this.search, 'keyup');
        this.router.events.subscribe(x => {
            this.search.val('');
        })
    }

    public getSearchQuery() : FromEventObservable<Event> {
        return this.query$;
    }



}