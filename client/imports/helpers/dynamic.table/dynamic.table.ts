import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import template from "./dynamic.table.html";
import style from "./dynamic.table.scss";
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable.classes";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {SearchService} from "../../services/search.service";

declare let $ :any;
declare let _ : any;

@Component({
    selector: "dynTable",
    template,
    styles: [ style ]
})
export class DynamicTable implements OnInit{
    @Input() input: any[];
    @Input() initialColumns: DynamicTableColumn[];
    @Input() onColumnClick: Function;
    @Input() options: DynamicTableOptions;
    @Output() called: EventEmitter<any> = new EventEmitter();

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
        this.initialColumns.forEach((column) => {
            if (column.fix) {
                this.fixColumns.push(column);
            } else {
                this.activeColumns.push(column);
            }
        });
        $(document).ready(function () {
            $('.modal').modal();
        });
        this.search.getSearchQuery().subscribe(x => {
            let searchText = (<HTMLInputElement>x.target).value;
            if (!this.trueInput) {
                this.trueInput = Object.assign([], this.input);
            }
            let filter = this.options.searchFilter;
            this.input = filter.transform(this.trueInput, searchText);
        });
    }

    public clickColumn(item : any) {
        if (this.onColumnClick) {
            this.onColumnClick(item);
        }
    }

    public orderBy(criteria : any) {
        if (!this.sortDescending) {
            this.input = _.sortBy(this.input, criteria);
            this.sortDescending = true;
        } else {
            this.input = _.sortBy(this.input,criteria).reverse();
            this.sortDescending = false;
        }
    }

    public callFunction(index : number, item: any) {
        this.called.emit({index, item});
    }

    public openSettings() {
        if (!this.possibleColumns) {
            this.initPossibleColumns();
        }
        $('#settingsModal').modal('open');
    }

    public toggleColumn(column: DynamicTableColumn) {
        if (column.fix) return;
        column.toggle();
        if (this.existsInColumns(this.activeColumns, column.name)) {
            this.activeColumns.splice(this.activeColumns.indexOf(column), 1);
        } else {
            this.activeColumns.push(column);
        }
    }

    private initPossibleColumns() {
        this.possibleColumns = Object.assign([], this.initialColumns);
        this.possibleColumns.forEach((column) => {
            column.toggle();
        });
        if (this.input && this.input.length > 0) {
            let item = this.input[0];
            for (let prop in item) {
                if (item.hasOwnProperty(prop)) {
                    let propName = prop.charAt(0).toUpperCase() + prop.slice(1);
                    if (!this.existsInColumns(this.possibleColumns, propName)) {
                        this.possibleColumns.push(new DynamicTableColumn(propName, prop));
                    }
                }
            }
        }
        // if (this.options.containsConfigSets) {
        //     this.initConfigSpecificColumns();
        // }
    }

    private initConfigSpecificColumns() {
    }

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