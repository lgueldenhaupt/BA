import { Component, OnInit } from "@angular/core";
import template from "./config.component.html";
import style from "./config.component.scss";
import {ActivatedRoute} from "@angular/router";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import {NotificationService} from "../../services/notification.service";
import {AliasFinder} from "../../helpers/alias-finder";
import {ConfirmationModalService} from "../../services/confirmationModal.service";
import {TrainingSet} from "../../../../both/models/trainingSet";
import * as d3 from "d3";
import {ParamSet} from "../../../../both/models/paramSet";
import {ProjectsDataService} from "../../services/projects-data.service";
import {SearchService} from "../../services/search.service";
import {DomSanitizer} from "@angular/platform-browser";
import {DynamicTableColumn, DynamicTableOptions} from "../../../../both/models/dynamicTable.classes";
import {ConfigsPipe} from "../../helpers/filter.pipe";
let domtoimage = require('dom-to-image');

declare let $ :any;
declare let Materialize : any;

@Component({
    selector: "config",
    template,
    styles: [ style ]
})
export class ConfigComponent implements OnInit{
    private configID: string;
    private config: ConfigSet;
    private mappingID: string;
    private canSafe: boolean;
    private hideText: boolean;
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
    private chart;

    constructor(
        private route: ActivatedRoute,
        private configDS: ConfigSetsDataService,
        private notification: NotificationService,
        private confirm: ConfirmationModalService,
        private aliasFinder: AliasFinder,
        private projectDS: ProjectsDataService,
        private search: SearchService,
        private sanitizer: DomSanitizer
    ) {
        this.config = {name: '', projectID: '', description: '', params: [], results: []};
        this.canSafe = false;
        this.hideText = true;
        this.initalParamColumns = [];
        this.initalParamColumns.push(new DynamicTableColumn('Param', 'param', true));
        this.initalParamColumns.push(new DynamicTableColumn('Value', 'value', true));
        this.initalParamColumns.push(new DynamicTableColumn('Actions', '', true, [
            '<i class="material-icons grey-text text-darken-2 pointer">delete</i>'
        ]));
        this.tableOptions = new DynamicTableOptions("Params", new ConfigsPipe(), "highlight");
    }

    ngOnInit(): void {
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
        this.route.params.subscribe(params =>{
            this.configID = params['id'];
            let config$ = this.configDS.getConfigById(this.configID);
            config$.subscribe(
                (data) => {
                    this.config = data[0];
                    this.projectDS.getProjectsMapping(this.config.projectID).subscribe(mappingID => {
                        this.mappingID = mappingID;
                        this.getFlags();
                    });
                    if (this.config.results) {
                        this.initResultColors();
                        this.initResults(this.chart, this.getMaxVal(this.config.results), this.getMinVal(this.config.results));
                    }
                }
            )
        });

        $(document).ready(function(){
            $('.collapsible').collapsible();
        });
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
    }

    public handleTableActions(event) {
        switch (event.index) {
            case 0:
                this.deleteParamSet(event.item);
                break;
            default:
                break;
        }
    }

    public sanitize(url :string) {
        return this.sanitizer.bypassSecurityTrustUrl(url);
    }

    public getAliases(item : any) {
        console.log(this.config.params)
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

    public dataInput(event) {
        var input = event.srcElement.files;
        let FR = new FileReader();
        FR.onload = (ev : FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            let splitted = result.split("\n");
            let params = [];
            let results = [];
            if (splitted[0]) {
                params = ParamExtractor.searchForParams(splitted[0]);
                if (splitted.length > 1) {
                    splitted.splice(0, 1);
                    results = ParamExtractor.searchForTrainingSets(splitted);
                }
            }
            this.config.params = params;
            this.config.results = results;
        };
        FR.readAsText(input[0]);
    }

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

    public filterNode(node) {
        return (node.tagName !== 'i');
    }

    public convertToPdf() {
        domtoimage.toSvg(document.getElementById('toDownload'), {filter: this.filterNode}).then((dataUrl) => {
            this.pdfLink = dataUrl;
        });

    }

    private getFlags() {
        this.config.params.forEach((param: ParamSet) => {
            param.value = this.aliasFinder.getFlagMeaning(this.mappingID, param.value);
        });
    }

    private initResultColors() {
        let colorList = d3.select('#colorList');
        this.config.results.forEach((result, index) => {
            let color;
            if (index > this.colors.length -1) {
                color = ConfigComponent.getRandomColor();
            } else {
                color = this.colors[index];
            }
            let text = result.name != '' ? result.name : index;
            this.chart.colors.push(color);
            colorList.append("div")
                .attr("class", "row")
                .append("div")
                .attr("class", "col s2")
                .attr("style", "background-color: " + color + "; height: 30px; margin: 3px;")
                .append("div")
                .attr("class", "col s10")
                .html(text)
                .attr("style", "margin-left: 14px;");
        });
    }

    private initResults(chart, maxVal, minVal) {
        if (this.config.results.length <= 0) return;
        if (typeof chart.vis.remove === "function") {
            chart.vis.selectAll("*").remove();
        }
        let vis = d3.select("#visualisation"),
            WIDTH = chart.width,
            HEIGHT = chart.height,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 33,
                left: 50
            },
            xScale = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, this.config.results[0].epochs.length -1]),
            yScale = d3.scaleLinear().range([HEIGHT - MARGINS.top - (MARGINS.bottom - MARGINS.top), MARGINS.bottom - (MARGINS.bottom - MARGINS.top)]).domain([minVal,maxVal]),
            xAxis = d3.axisBottom()
                .scale(xScale).ticks(10),
            yAxis = d3.axisLeft()
                .scale(yScale);
        vis.append("svg:g")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);
        vis.append("svg:g")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);
        vis.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (20/2) +","+(HEIGHT/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
            .text("Accuracy ");
        vis.append("text")
            .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
            .attr("transform", "translate("+ (WIDTH/2) +","+(HEIGHT -3)+")")  // centre below axis
            .text("Epoch");

        let lineGen = d3.line()
            .x(function(d, i) {
                return xScale(i);
            })
            .y(function(d) {
                return yScale(d);
            }).curve(d3.curveCardinal);
        this.config.results.forEach((trainingSet, index) => {
            let color = this.chart.colors[index];
            vis.append('svg:path')
                .attr('d', lineGen(trainingSet.epochs))
                .attr('stroke', color)
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            vis.append('g')
                .attr("id", "trainingSet" + index);
            vis.select('#trainingSet' + index).selectAll("circle").data(trainingSet.epochs)
                .enter()
                .append("svg:circle")
                .attr("cx", function (d, i) {
                    return xScale(i);
                })
                .attr("cy", function (d) {
                    return yScale(d);
                })
                .attr("r", 4)
                .attr("fill", color)
                .on("mouseover", function (d, i) {
                    d3.select(this).transition()
                        .ease(d3.easeElastic)
                        .duration("500")
                        .attr("r", 6);
                    vis.append("text")
                        .attr("x", xScale(i) - 30)
                        .attr("y", yScale(d) - 15)
                        .attr("id", "t" + d.x + "-" + d.y + "-" + i)
                        .text(function () {
                            return d
                        })
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).transition()
                        .ease(d3.easeElastic)
                        .duration("500")
                        .attr("r", 4);
                    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
                })
        });
        chart.vis = vis;
    }

    private getMaxVal(results) {
        let maxVal = 0;
        if (results.length > 0) {
            results.forEach((trainingSet : TrainingSet) => {
                trainingSet.epochs.forEach((epoch) => {
                    maxVal = epoch > maxVal ? epoch : maxVal;
                });
            });
        }
        return (+maxVal + 0.02);
    }

    private getMinVal(results) {
        let minVal = 1;
        if (results.length > 0) {
            results.forEach((trainingSet : TrainingSet) => {
                trainingSet.epochs.forEach((epoch) => {
                    minVal = epoch < minVal ? epoch : minVal;
                });
            });
        }
        return (+minVal - 0.02);
    }

    resize() {
        $('#visualisation').width($('#results').width());
        this.chart.width = $('#results').width();
        if (this.config && this.config.results) {
            this.initResults(this.chart, this.getMaxVal(this.config.results), this.getMinVal(this.config.results));
        }
    }

    private static getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}