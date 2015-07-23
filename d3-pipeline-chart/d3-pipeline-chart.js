/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Matt Hoskins, News-Press Gazette Company
 * All rights reserved.
 *
 * Pipeline Chart
 * Much inspiration from Curtis Bratton's Liquid Fill Gauge plugin @ http://bl.ocks.org/brattonc/5e5ce9beee483220e2f6#liquidFillGauge.js
 */

function pipelineChartDefaultSettings() {

	return {
		width: 1000, // Width of the entire pipeline
		height: 75, // Height of the entire pipeline
		arrowStrength: 20, // The 'pointedness' of the arrow
		padding: 10, // Number of pixels between each stage
		stageCompleteOutline: "#50AA38", // Color of stage outline when count >= goal
		stageIncompleteOutline: "#ececec", // Color of stage outline when count < goal
		stageFillColor: "#ff00ff" // default stage fill color
	}

}

function pipelineChart(svgElement, config) {
	if(config == null) this.config = pipelineChartDefaultSettings();

    this.pipeline = d3.select("#" + svgElement);
	this.stages = new Array();
	this.stageWidth = this.config.width / this.config.stageCount;
	this.locationX = 0;
	this.locationY = 0;

}

pipelineChart.prototype.push = function( stage ) {

	if(stage instanceof pipelineChartStage != true) {
	 	return false;
	}

	this.stages.push(stage);
	this.stages[0].style = "start";
	if (this.stages.length > 1) {
		this.stages[ this.stages.length -1].style = "end";
	}

	return this;
}

pipelineChart.prototype.render = function() {

	this.pipeline.selectAll("*").remove();

	this.pipeline.attr("width", this.config.width);
	this.pipeline.attr("height", this.config.height);

	this.stageWidth = this.config.width / this.stages.length;
	this.stageHeight = this.config.height;
	this.stageArrowWidthOffset = (this.stageWidth - this.config.arrowStrength);
	this.stageArrowHeightOffset = (this.stageHeight / 2);

	defs = this.pipeline.append("defs");
	defs.append("clipPath")
		.attr("id", "clip-stage-start")
		.append("path")
			.attr("id", "path-stage-start")
			.attr("d", "M " +
				"0,0 " +
				"0,"+this.stageArrowHeightOffset+" "+
				"0,"+this.stageHeight+" " +
				this.stageArrowWidthOffset+","+this.stageHeight+" " +
				this.stageWidth+","+this.stageArrowHeightOffset+" " +
				this.stageArrowWidthOffset+",0 z");

	defs.append("clipPath")
		.attr("id", "clip-stage-mid")
		.append("path")
			.attr("id", "path-stage-mid")
			.style("border-radius", "20px")
			.attr("d", "M " +
				"0,0 " +
				this.config.arrowStrength+","+this.stageArrowHeightOffset+" "+
				"0,"+this.stageHeight+" " +
				this.stageArrowWidthOffset+","+this.stageHeight + " " +
				this.stageWidth+ ","+this.stageArrowHeightOffset+" " +
				this.stageArrowWidthOffset+",0 z");

	defs.append("clipPath")
		.attr("id", "clip-stage-end")
		.append("path")
			.attr("id", "path-stage-end")
			.attr("d", "M " +
				"0,0 " +
				this.config.arrowStrength+","+this.stageArrowHeightOffset+" "+
				"0,"+this.stageHeight+" " +
				this.stageWidth+","+this.stageHeight+" " +
				this.stageWidth+","+this.stageArrowHeightOffset+" " +
				this.stageWidth+",0 z");

	pipelineGroup = this.pipeline;

	for (var x=0; x< this.stages.length; x++) {
		stageNumber = (x+1);
		stageMask = "mid";
		stageX = x * this.stageWidth;
		stageY = 0;

		if (stageNumber == this.stages.length && this.stages.length > 1) {
			stageMask = "end";
			stageX -= (this.config.arrowStrength * x);
		} else if (stageNumber == 1) {
			stageMask = "start";
		} else {
			stageX -= (this.config.arrowStrength * x);
		}

		stageX += x * this.config.padding;

		this.stages[x].render( pipelineGroup, 
			{
				stageNumber: stageNumber,
				stageCount: this.stages.length,
				width: this.stageWidth, 
				height: this.stageHeight,
				stageData: this.stages[x].config,
				stageMask: stageMask,
				config: this.config,
				stageFillColor: this.config.stageFillColor
			}
		);
		stageGroup = d3.select("#"+pipelineGroup.attr("id")+"stage"+(x+1)+"group");
		stageGroup.attr("transform", "translate("+stageX+","+stageY+")");
	}

}

function pipelineChartStage(p) {
	this.config = p;
}

pipelineChartStage.prototype.render = function( pipelineGroup, p ) {


	stageGroup = pipelineGroup.append("g")
		.attr("id", pipelineGroup.attr("id")+"stage" + p.stageNumber + "group")
		.attr("clip-path", "url(#clip-stage-"+p.stageMask+")");

	stageGroup.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", p.width)
		.attr("height", p.height)
		.attr("class", "stage-background");

	stageGroup.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", ((p.stageData.value/p.stageData.goal) * p.width))
		.attr("height", p.height)
		.attr("class", "stage-fill")
		.style("fill", p.stageData.color ? p.stageData.color : p.stageFillColor);

	stagePath = stageGroup.append("use")
		.attr("xlink:href", "#path-stage-" + p.stageMask)
		.attr("class", "stage-mask")
		.style("stroke", (p.stageData.value >= p.stageData.goal) ? p.config.stageCompleteOutline : p.config.stageIncompleteOutline)

	stageGroup.append("text")
		.attr("x", (p.width / 2))
		.attr("y", (p.height / 2))
		.attr("class", "stage-text")
		.text(p.stageData.value + "/" + p.stageData.goal);

}
