import {Component, OnInit} from "@angular/core";
import {ProjectsDataService} from "../../services/projects-data.service";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {ActivatedRoute} from "@angular/router";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";
import {SearchService} from "../../services/search.service";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import undefined = Match.undefined;
import {ConfirmationModalService} from "../../services/confirmationModal.service";
import {MappingsDataService} from "../../services/mappings-data.service";
import {Mapping} from "../../../../both/models/mapping.model";
import {TrainingSet} from "../../../../both/models/trainingSet";
import {ParamSet} from "../../../../both/models/paramSet";
import * as d3 from "d3";

declare let $: any;
declare let _: any;

@Component({
    selector: "project",
    template,
    styles: [style]
})
export class ProjectComponent implements OnInit {
    private projectID: any;
    private project: Project;
    private mapping: Mapping;
    private configSets: ConfigSet[];
    private searchText: string;
    private chosenConfig: ConfigSet;
    private chosenConfigID: string;
    private view: number;
    private chart: any;

    constructor(private projectsDS: ProjectsDataService,
                private configSetsDS: ConfigSetsDataService,
                private mappingDS: MappingsDataService,
                private route: ActivatedRoute,
                private notification: NotificationService,
                private search: SearchService,
                private parser: ParamExtractor,
                private confirm: ConfirmationModalService) {
        this.project = {name: '', description: '', mappingID: ''};
        this.chosenConfig = null;
        this.view = 1;
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

        //parse route params to get the project
        this.route.params.subscribe(params => {
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                data => {
                    this.project = data[0];
                    this.getProjectMapping();
                }
            );
            this.chosenConfigID = params['configID'];
            this.configSetsDS.getConfigById(this.chosenConfigID).subscribe((data) => {
                this.chosenConfig = data[0];
                if (this.chosenConfig.results) {
                    this.initResultColors();
                    this.initResults(this.chart, this.getMaxVal(this.chosenConfig.results), this.getMinVal(this.chosenConfig.results));
                }
            })
        });
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
        this.configSetsDS.getProjectConfigs(this.projectID).subscribe((results) => {
            this.configSets = results;
        });

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('select').material_select();
        });
    }

    openAddConfigSetModal() {
        $(document).ready(function () {
            $('.modal').modal();
        });
    }

    createConfigSet(name, desc, params, results: TrainingSet[] = []) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addConfig({
            name: name,
            description: desc,
            projectID: this.projectID,
            params: params,
            results: results
        }).subscribe((newID) => {
            if (newID != '' || newID != undefined) {
                this.notification.success("ConfigSet added");
            }
            else {
                this.notification.error("Could not add Config Set");
            }
        });
        if ($('.modal').modal()) {
            $('.modal').modal('close');
        }

    }

    deleteConfigSet(id, name) {
        this.confirm.openModal('Delete ' + name, "Do you really want to delete that config?").then((fullfilled) => {
            if (fullfilled) {
                this.configSetsDS.delete(id).subscribe((changedEntries) => {
                    if (changedEntries === 1) {
                        this.notification.success("ConfigSet deleted");
                    } else {
                        this.notification.error("ConfigSet not deleted");
                    }
                });
            }
        });
    }

    createMapping() {
        if (!this.configSets || this.configSets.length <= 0) {
            this.notification.error("No configuration Sets");
            return;
        }
        this.mappingDS.addMappingFromConfig(this.project.name + ' mapping', this.configSets[0].params).subscribe((mappingID) => {
            if (mappingID && mappingID != '') {
                this.updateProjectWithMapping(mappingID);
                this.addAllConfigsToMapping(mappingID);
            }
        });
    }

    updateMapping() {
        this.addAllConfigsToMapping((<any>this.mapping)._id);
    }

    private addAllConfigsToMapping(mappingID) {
        if (this.configSets.length > 1) {
            let toAddParams = [];
            for (let i = 0; i < this.configSets.length; i++) {
                let configSet = this.configSets[i];
                this.mappingDS.assignConfigToMapping(configSet.params, mappingID).subscribe((unrelatedParams) => {
                    if (unrelatedParams.length > 0) {
                        toAddParams = toAddParams.concat(unrelatedParams);
                        toAddParams = _.uniq(toAddParams);
                    }
                }, () => {
                    this.notification.error("Something went wrong while adding Configs to mapping");
                }, () => {
                    if (i === this.configSets.length - 1) {
                        this.mappingDS.addUnrelatedParamsToMapping(mappingID, toAddParams).subscribe((changedMappings)=> {
                            if (changedMappings == 1) {
                                this.notification.warning("Mapping has " + toAddParams.length + " unrelated Params");
                            }
                        });
                    }
                });
            }
        }
    }

    private updateProjectWithMapping(mappingID: string) {
        this.project.mappingID = mappingID;
        this.notification.success("Mapping Created");
        this.projectsDS.updateProject(this.projectID, this.project).subscribe((changedEntries) => {
            if (changedEntries == 1) {
                this.notification.success("Project updated");
            }
        });
    }

    private getProjectMapping() {
        if (this.project.mappingID && this.project.mappingID != '') {
            this.mappingDS.getMappingById(this.project.mappingID).subscribe((mappings) => {
                if (mappings && mappings[0]) {
                    this.mapping = mappings[0];
                }
            });
        }
    }

    onDrop(e) {
        let file = e.dataTransfer.files[0];
        e.preventDefault();
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        let FR = new FileReader();
        FR.onload = (ev: FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            let splitted = result.split("\n");
            let params = [];
            let results = [];
            if (splitted[0]) {
                params = this.parser.searchForParams(splitted[0]);
                if (splitted.length > 1) {
                    splitted.splice(0, 1);
                    results = this.parser.searchForTrainingSets(splitted);
                }
            }
            this.createConfigSet(file.name, file.lastModifiedDate + '', params, results);

        };
        FR.readAsText(file);
    }

    onDragOver(e) {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-4 dropCard';
        e.preventDefault();
        return false;
    }

    onDragLeave() {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        return false;
    }

    changeView(value: number) {
        if (value >= 0 && value <= 1) {
            this.view = value;
        }
    }

    deleteParamSet(paramSet: ParamSet) {
        this.confirm.openModal().then((yes) => {
            if (yes) {
                this.chosenConfig.params.splice(this.chosenConfig.params.indexOf(paramSet), 1);
                this.configSetsDS.updateConfig((<any>this.chosenConfig)._id, this.chosenConfig).subscribe((changedItems) => {
                    if (changedItems === 1) {
                        this.notification.success("Parameter deleted");
                    }
                });
            }
        })
    }

    private initResultColors() {
        let colorList = d3.select('#colorList');
        this.chosenConfig.results.forEach((result, index) => {
            let color = ProjectComponent.getRandomColor();
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
        if (this.chosenConfig.results.length <= 0) return;
        if (typeof chart.vis.remove === "function") {
            chart.vis.selectAll("*").remove();
        }
        let vis = d3.select("#visualisation"),
            WIDTH = chart.width,
            HEIGHT = chart.height,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },
            xScale = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, this.chosenConfig.results[0].epochs.length -1]),
            yScale = d3.scaleLinear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([minVal,maxVal]),
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
        let lineGen = d3.line()
            .x(function(d, i) {
                return xScale(i);
            })
            .y(function(d) {
                return yScale(d);
            }).curve(d3.curveCardinal);
        this.chosenConfig.results.forEach((trainingSet, index) => {
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
                .attr("r", 3)
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
                        .attr("r", 3);
                    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
                })
        });
        chart.vis = vis;
    }

    private static getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
        if (this.chosenConfig && this.chosenConfig.results) {
            this.initResults(this.chart, this.getMaxVal(this.chosenConfig.results), this.getMinVal(this.chosenConfig.results));
        }
    }
}