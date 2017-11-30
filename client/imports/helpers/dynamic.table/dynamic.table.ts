import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import template from "./dynamic.table.html";
import style from "./dynamic.table.scss";
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable.classes";
import {SearchService} from "../../services/search.service";
import {Observable} from "rxjs/Observable";

declare let $ :any;
declare let _ : any;

/**
 * This component is a dynamic table. It can be configured in many ways displaying any input array of objects.
 */
@Component({
    selector: "dynTable",
    template,
    styles: [ style ]
})
export class DynamicTable implements OnInit{
    /**
     * input: Any array of objects. One object represents one row
     * initialColumns: The columns that should be displayed by default. See 'DynamicTableColumn' for more information.
     * options: Several table options. See 'DynamicTableOptions' for info
     *
     * called: EventEmitter that gets called with index of the given function and referring object
     * clickedonColumn: EventEmitter that gets called when clicking on a row. Returns the clicked object
     */
    @Input() input: any[];
    @Input() initialColumns: DynamicTableColumn[];
    @Input() options: DynamicTableOptions;
    @Output() called: EventEmitter<any> = new EventEmitter();
    @Output() clickedOnColumn: EventEmitter<any> = new EventEmitter();
    @Output() columnsChanged: EventEmitter<DynamicTableColumn[]> = new EventEmitter();

    private activeColumns : DynamicTableColumn[];
    private fixColumns: DynamicTableColumn[];
    private possibleColumns : DynamicTableColumn[];
    private trueInput : any[];
    private sortDescending: boolean = false;

    constructor(
        private search : SearchService
    ) {
    }

    ngOnInit(): void {
        this.activeColumns = [];
        this.fixColumns = [];
        //init columns
        if (this.initialColumns) {
            this.initialColumns.forEach((column) => {
                if (column.fix) {
                    this.fixColumns.push(column);
                } else {
                    this.activeColumns.push(column);
                }
            });
        }
        $(document).ready(function () {
            $('#settingsModal').modal();
        });
        //apply options, e.g filter
        if (this.options && this.options.searchFilter) {
            this.search.getSearchQuery().subscribe(x => {
                let searchText = (<HTMLInputElement>x.target).value;
                if (!this.trueInput) {
                    this.trueInput = Object.assign([], this.input);
                }
                let filter = this.options.searchFilter;
                this.input = filter.transform(this.trueInput, searchText);
            });
        }

        //reload initalColumns, in case of late loading
        Observable.of(true)
            .delay(1000)
            .subscribe(success => {

                if(success){
                    if (this.initialColumns) {
                        this.fixColumns = [];
                        this.activeColumns = [];
                        this.initialColumns.forEach((column) => {
                            if (column.fix) {
                                this.fixColumns.push(column);
                            } else {
                                this.activeColumns.push(column);
                            }
                        });
                    }
                }

            });
    }

    /**
     * Emits clickedOnColumn with the given item
     * @param item
     */
    public clickColumn(item : any) {
        this.clickedOnColumn.emit(item);
    }

    /**
     * Sorts the table by the given criteria. Toggles ascending and descending
     * @param criteria
     */
    public orderBy(criteria : any) {
        if (!this.sortDescending) {
            this.input = _.sortBy(this.input, criteria);
            this.sortDescending = true;
        } else {
            this.input = _.sortBy(this.input,criteria).reverse();
            this.sortDescending = false;
        }
    }

    /**
     * Emits the function 'called' with index and item
     * @param {number} index
     * @param item
     */
    public callFunction(index : number, item: any) {
        this.called.emit({index, item});
    }

    /**
     * opens the configure table modal
     */
    public openSettings() {
        if (!this.possibleColumns) {
            this.initPossibleColumns();
        }
        $('#settingsModal').modal('open');
    }

    /**
     * Toggles the column visibility
     * @param {DynamicTableColumn} column The given column to toggle
     */
    public toggleColumn(column: DynamicTableColumn) {
        if (column.fix) return;
        column.toggle();
        if (this.existsInColumns(this.activeColumns, column.name)) {
            this.activeColumns.splice(this.activeColumns.indexOf(column), 1);
        } else {
            this.activeColumns.push(column);
        }
        this.columnsChanged.emit(this.activeColumns);
    }

    /**
     * Inits the first columns and looks for possible ones
     */
    private initPossibleColumns() {
        this.possibleColumns = Object.assign([], this.initialColumns);
        this.possibleColumns.forEach((column) => {
            if (!column.active) {
                column.toggle();
            }
        });
        this.deepSearchForColumns(this.input);
    }

    /**
     * Searches for the input object properties and converts them to possible columns
     * @param input
     */
    private deepSearchForColumns(input : any) {
        if (input && input.length > 0) {
            input.forEach((item) => {
                for (let prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        let propName = prop.charAt(0).toUpperCase() + prop.slice(1);
                        if (!this.existsInColumns(this.possibleColumns, propName)) {
                            this.possibleColumns.push(new DynamicTableColumn(propName, prop));
                        }
                    }
                }
            });
        }
    }

    /**
     * Checks if there is a possible column with the given name
     * @param {DynamicTableColumn[]} columns The columns to check
     * @param {string} name The name to seach for
     * @returns {boolean} Returns true if the name exists as a column name
     */
    public existsInColumns(columns : DynamicTableColumn[], name: string) : boolean {
        let result = false;
        columns.forEach((column) => {
            if (column.name.toLowerCase() === name.toLowerCase()) {
                result = true;
            }
        });
        return result;
    }
}