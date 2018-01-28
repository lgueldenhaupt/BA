import {TrainingSet} from "../../../both/models/trainingSet";
import * as d3 from "d3";

export class ConfigresultParser {
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
     * Returns the max value of the results
     * @param results
     * @returns {number}
     */
    private static getMaxVal(results) {
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

    /**
     * Returns the min value of the results
     * @param results
     * @returns {number}
     */
    private static getMinVal(results) {
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

    /**
     * Creates a svg for the results using d3js.
     * @param chart The chart options
     * @param maxVal The max value of the results
     * @param minVal The min value of the results
     */
    public static initResults(chart, config, vis) : boolean {
        if (config.results.length <= 0) return true;
        let validResults = true;
        if (typeof chart.vis.remove === "function") {
            chart.vis.selectAll("*").remove();
        }
        let WIDTH = chart.width,
            HEIGHT = chart.height,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 33,
                left: 50
            },
            xScale = d3.scaleLinear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([1, config.results[0].epochs.length]),
            yScale = d3.scaleLinear().range([HEIGHT - MARGINS.top - (MARGINS.bottom - MARGINS.top), MARGINS.bottom - (MARGINS.bottom - MARGINS.top)]).domain([ConfigresultParser.getMinVal(config.results), ConfigresultParser.getMaxVal(config.results)]),
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
                return xScale(i +1);
            })
            .y(function(d) {
                if (isNaN(d)) {
                    d = 0;
                    validResults = false;
                }
                return yScale(d);
            }).curve(d3.curveCardinal);
        config.results.forEach((trainingSet, index) => {
            let color = chart.colors[index];
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
                    if (isNaN(d)) {
                        d = 0;
                        validResults = false;
                    }
                    return xScale(i +1);
                })
                .attr("cy", function (d) {
                    if (isNaN(d)) {
                        d = 0;
                        validResults = false;
                    }
                    return yScale(d);
                })
                .attr("r", 4)
                .attr("fill", color)
                .on("mouseover", function (d, i) {
                    if (isNaN(d)) {
                        d = 0;
                        validResults = false;
                    }
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
                    if (isNaN(d)) {
                        d = 0;
                        validResults = false;
                    }
                    d3.select(this).transition()
                        .ease(d3.easeElastic)
                        .duration("500")
                        .attr("r", 4);
                    d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();
                })
        });
        chart.vis = vis;
        return validResults;
    }
}