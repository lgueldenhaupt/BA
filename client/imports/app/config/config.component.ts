import { Component, OnInit } from "@angular/core";
import template from "./config.component.html";
import style from "./config.component.scss";
import {ActivatedRoute} from "@angular/router";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";
import {AliasFinder} from "../../helpers/alias-finder";
import {ConfirmationModalService} from "../../services/confirmationModal.service";
import * as d3 from "d3";
import {ParamSet} from "../../../../both/models/paramSet";
import {ProjectsDataService} from "../../services/projects-data.service";
import {SearchService} from "../../services/search.service";
import {DomSanitizer} from "@angular/platform-browser";
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable.classes";
import {ConfigsPipe} from "../../helpers/filter.pipe";
import {ConfigresultParser} from "../../helpers/configresult-parser";
import {FilesDataService} from "../../services/files-data.service";
let domtoimage = require('dom-to-image');

declare let $ :any;
declare let Materialize : any;
declare let FS: any;

/**
 * This component represents the Config Page.
 * It diplays the params of a config and the results. An svg can be downloaded containing the results
 */
@Component({
    selector: "config",
    template,
    styles: [ style ]
})
export class ConfigComponent implements OnInit{
    private configID: string;
    private config: ConfigSet;
    private mappingID: string;
    private resultsValid : boolean = true;
    private searchText: string;
    private pdfLink : any;
    private initalParamColumns: DynamicTableColumn[];
    private tableOptions: DynamicTableOptions;
    private colors: string[] = [
        "#DC143C",
        "#228B22",
        "#4169E1",
        "#FFD700",
        "#778899"
    ];
    private trainingSetNames: string[] = [
        "Training",
        "Development"
    ];
    private chart;
    private files = [];

    constructor(
        private route: ActivatedRoute,
        private configDS: ConfigSetsDataService,
        private notification: NotificationService,
        private confirm: ConfirmationModalService,
        private aliasFinder: AliasFinder,
        private projectDS: ProjectsDataService,
        private filesDS: FilesDataService,
        private search: SearchService,
        private sanitizer: DomSanitizer
    ) {
        this.config = {name: '', projectID: '', description: '', creator: '', params: [], results: []};

        //get information for the dyn table
        this.initalParamColumns = [];
        this.initalParamColumns.push(new DynamicTableColumn('Param', 'param', true));
        this.initalParamColumns.push(new DynamicTableColumn('Value', 'value', true));
        this.initalParamColumns.push(new DynamicTableColumn('Actions', '', true, "", [
            '<i class="material-icons grey-text text-darken-2 pointer">delete</i>'
        ]));
        this.tableOptions = new DynamicTableOptions("Params", new ConfigsPipe(), "highlight");
    }

    ngOnInit(): void {
        //for the results svg
        this.chart = {
            width: $('#results').width(),
            height: 300,
            vis: {},
            colors: []
        };
        $('#visualisation').width(this.chart.width);
        $('#visualisation').height(this.chart.height);
        $(window).resize(() => {
            this.resize();
        });

        //get routing params
        this.route.params.subscribe(params =>{
            this.configID = params['id'];
            let config$ = this.configDS.getConfigById(this.configID);
            config$.subscribe(
                (data) => {
                    // get mapping and flags
                    this.config = data[0];
                    this.projectDS.getProjectsMapping(this.config.projectID).subscribe(mappingID => {
                        this.mappingID = mappingID;
                        this.getFlags();
                    });

                    // init the results svg
                    if (this.config.results) {
                        this.initResultColors();
                        this.resultsValid = ConfigresultParser.initResults(this.chart, this.config, d3.select("#visualisation"));
                    }
                }
            )
        });

        $(document).ready(function(){
            $('.collapsible').collapsible();
        });

        //subscribe to the top search
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });

        this.filesDS.getConfigFiles(this.configID).subscribe(data => {
            this.files = data;
        })
    }

    /**
     * Function that gets called if an action on the dyn table was activated. Even containing index and item (see dynTable)
     * @param event
     */
    public handleTableActions(event) {
        switch (event.index) {
            case 0:
                if (this.config.creator != Meteor.userId()) {
                    this.notification.notPermitted();
                    return;
                }
                this.deleteParamSet(event.item);
                break;
            default:
                break;
        }
    }

    public openEditModal() {
        $('#configSetEditModal').modal().modal('open');
        $('#editName').val(this.config.name);
        $('#editDesc').val(this.config.description);
        Materialize.updateTextFields();
    }

    public inputChanged(e) {
        e.preventDefault();
        if (e && e.target && e.target.files) {
            let files = e.target.files;
            this.fileUpload(files);
        }
    }

    public fileUpload(files) {
        for (let i = 0; i < files.length; i++) {
            this.filesDS.uploadFile(files[i], this.configID).then(()=> {
                this.notification.success('File uploaded')
            }).catch((err) => {
                this.notification.error('Something went wrong');
                console.log(err)
            });
        }
    }

    public deleteFile(file) {
        this.confirm.openModal("Delete attached File?").then(fulfilled => {
            if (fulfilled) {
                this.filesDS.removeFile(file).subscribe((changed: number) => {
                    if (changed === 1) {
                        this.notification.success("File deleted")
                    } else {
                        this.notification.error("Something went wrong")
                    }
                });
            }
        });
    }

    public editConfig() {
        let editedConf = Object.assign({}, this.config);
        editedConf.name = $('#editName').val();
        editedConf.description = $('#editDesc').val();
        this.configDS.updateConfig((<any>editedConf)._id, editedConf).subscribe((changedConfigs) => {
            if (changedConfigs == 1) {
                this.notification.success("ConfigSet udpdated");
                $('#configSetEditModal').modal('close');
            }
        });
    }

    /**
     * Sanitizes the given url to not be 'unsafe'
     * @param {string} url
     * @returns {SafeUrl}
     */
    public sanitize(url :string) {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    /**
     * Gets the aliases for the given param and shows them in a toast.
     * @param item The paramset to get the aliases of
     */
    public getAliases(item : ParamSet) {
        let value = item.param;
        let aliases = this.aliasFinder.getAliasesStraight(this.mappingID,value);
        let str = "";
        aliases.forEach((alias) => {
            str += " " + alias + ",";
        });
        str = str.substring(0, str.length -1);
        if (str.length === 0) {
            str = "No aliases";
        }
        Materialize.toast(str, 5000)
    }

    /**
     * Call function to delete a paramset. Opens a confirmModal and deletes the given Paramset if confirmed.
     * @param {ParamSet} paramSet The paramSet to delete
     */
    public deleteParamSet(paramSet: ParamSet) {
        this.confirm.openModal().then((yes) => {
            if (yes) {
                this.config.params.splice(this.config.params.indexOf(paramSet), 1);
                this.configDS.updateConfig((<any>this.config)._id, this.config).subscribe((changedItems) => {
                    if (changedItems === 1) {
                        this.notification.success("Parameter deleted");
                    }
                });
            }
        })
    }

    /**
     * Filter to convert to svg. Filters for <i> tags
     * @param node
     * @returns {boolean}
     */
    public filterNode(node) {
        return (node.tagName !== 'i');
    }

    /**
     * Converts the results svg to a downloadable svg and safes the link.
     */
    public convertToPdf() {
        domtoimage.toSvg(document.getElementById('toDownload'), {filter: this.filterNode}).then((dataUrl) => {
            this.pdfLink = dataUrl;
        });

    }

    /**
     * Gets the flags and applies them to the parmSet values.
     */
    private getFlags() {
        this.config.params.forEach((param: ParamSet) => {
            param.value = this.aliasFinder.getFlagMeaning(this.mappingID, param.value);
        });
    }

    /**
     * Inits the result colors and the legend on the right of the results svg
     */
    private initResultColors() {
        let colorList = d3.select('#colorList');
        this.config.results.forEach((result, index) => {
            let color;
            if (index > this.colors.length -1) {
                color = ConfigComponent.getRandomColor();
            } else {
                color = this.colors[index];
            }
            let testSetName = (this.trainingSetNames.length - index +1) + ". Test";
            let text = index >= this.trainingSetNames.length ? testSetName : this.trainingSetNames[index];
            this.chart.colors.push(color);
            colorList.append("div")
                .attr("class", "row")
                .append("div")
                .attr("class", "col s2")
                .attr("style", "background-color: " + color + "; height: 30px; margin: 3px; white-space: nowrap;")
                .append("div")
                .attr("class", "col s10")
                .html(text)
                .attr("style", "margin-left: 14px;");
        });
    }

    /**
     * Called on resize window. Scales the svg new.
     */
    public resize() {
        $('#visualisation').width($('#results').width());
        this.chart.width = $('#results').width();
        if (this.config && this.config.results) {
            ConfigresultParser.initResults(this.chart, this.config, d3.select("#visualisation"));
        }
    }

    /**
     * Returns a random hex color.
     * @returns {string}
     */
    private static getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    /**
     * Called when dropping a file on the 'drop config' card.
     * @param e
     */
    public onFileDrop(e) {
        e.preventDefault();
        let card = document.getElementById('uploadCard');
        card.className = 'card amber accent-2';
        let files = <FileList>e.dataTransfer.files;
        // read file and try to extract params and results
        this.fileUpload(files);
    }

    /**
     * Called on drag over config card. Change color and prevent default
     * @param e
     * @returns {boolean}
     */
    public onFileDragOver(e) {
        let card = document.getElementById('uploadCard');
        card.className = 'card amber accent-4';
        e.preventDefault();
        return false;
    }

    /**
     * Called on leaving uploAD card. Change color.
     * @returns {boolean}
     */
    public onFileDragLeave() {
        let card = document.getElementById('uploadCard');
        card.className = 'card amber accent-2';
        return false;
    }
}