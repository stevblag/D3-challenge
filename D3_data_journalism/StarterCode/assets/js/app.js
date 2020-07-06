// Define SVG area dimensions
let svgWidth = 960;
let svgHeight = 630;

// Define scatterplot margins as object
let margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100,
};

// Define dimensions of chart area
let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Append div class to scatter element
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append SVG group & shift ('translate') right & down to adhere to margins
let chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters < x & y axis >
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// Function = update x-scale variable once label is clicked
function xScale(censusData, chosenXAxis) {
  // scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(censusData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}
// Function = update y-scale variable once label is clicked
function yScale(censusData, chosenYAxis) {
  //scales
  let yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(censusData, (d) => d[chosenYAxis]) * 0.8,
      d3.max(censusData, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([0, height]);

  return yLinearScale;
}
// Function = update XAxis upon click
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(2000).call(bottomAxis);

  return xAxis;
}

// Function = update YAxis upon click
function renderYAxis(newYScale, yAxis) {
  let leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(2000).call(leftAxis);

  return yAxis;
}

// Function = update circles w/ transition to new circles
function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(2000)
    .attr("cx", (data) => newXScale(data[chosenXAxis]))
    .attr("cy", (data) => newYScale(data[chosenYAxis]));

  return circlesGroup;
}

// Function = update STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  textGroup
    .transition()
    .duration(2000)
    .attr("x", (d) => newXScale(d[chosenXAxis]))
    .attr("y", (d) => newYScale(d[chosenYAxis]));

  return textGroup;
}
// Function = stylize x-axis values < tooltips >
function styleX(value, chosenXAxis) {
  // poverty
  if (chosenXAxis === "poverty") {
    return `${value}%`;
  }
  // age
  else if (chosenXAxis === "age") {
    return `${value}`;
  } else {
    return `${value}`;
  }
}

// Funtion = update circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  let xLabel, yLabel;
  // poverty
  if (chosenXAxis === "poverty") {
    xLabel = "Poverty:";
  }
  // age
  else {
    xLabel = "Age:";
  }
  // Y label
  // healthcare
  if (chosenYAxis === "healthcare") {
    yLabel = "No Healthcare:";
  }
  // smoking
  else {
    yLabel = "Smokers:";
  }

  // Step 1: Append tooltip div
  var toolTip = d3.select("body").append("div").classed("tooltip", true);

  // Step 2: Create "mouseover" event listener to display tooltip
  circlesGroup
    .on("mouseover", function(d) {
      toolTip
      .style("display", "d3Style")
      .html(function () {
        console.log("mouseover",d)
          return `${
            d
          }<strong>${xLabel} ${styleX([chosenXAxis])}<strong>${yLabel} ${[chosenYAxis]}`
        })
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    
    // Step 3: Create "mouseout" event listener to hide tooltip
    .on("mouseout", function () {
      toolTip.style("display", "d3Style");
    });

  return circlesGroup;
}
// Load CSV
d3.csv("./assets/data/data.csv").then(function (censusData) {
  //console.log(censusData);

  // Parse data
  censusData.forEach(function (data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.age = +data.age;
  });

  // Create linear scales
  let xLinearScale = xScale(censusData, chosenXAxis);
  let yLinearScale = yScale(censusData, chosenYAxis);

  // Create x & y axis
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  // Append X
  let xAxis = chartGroup
    .append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append Y
  let yAxis = chartGroup
    .append("g")
    .classed("y-axis", true)
    //.attr
    .call(leftAxis);

  // Append Circles
  let circlesGroup = chartGroup
    .selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
    .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
    .attr("r", 14)
    .attr("opacity", ".5");

  // Append Initial Text
  let textGroup = chartGroup
    .selectAll(".stateText")
    .data(censusData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("x", (d) => xLinearScale(d[chosenXAxis]))
    .attr("y", (d) => yLinearScale(d[chosenYAxis]))
    .attr("dy", 3)
    .attr("font-size", "10px")
    .text(function (d) {
      return d.abbr;
    });

  // Create x-axis label group
  let xLabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height + 10 + margin.top})`);

  let povertyLabel = xLabelsGroup
    .append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .text("In Poverty (%)");

  let ageLabel = xLabelsGroup
    .append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .text("Age (Median)");

  // Create y-axis label group
  let yLabelsGroup = chartGroup
    .append("g")
    .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`);

  let healthcareLabel = yLabelsGroup
    .append("text")
    .classed("aText", true)
    .classed("active", true)
    .attr("x", 0)
    .attr("y", 0 - 20)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "healthcare")
    .text("Without Healthcare (%)");

  let smokesLabel = yLabelsGroup
    .append("text")
    .classed("aText", true)
    .classed("inactive", true)
    .attr("x", 0)
    .attr("y", 0 - 40)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .attr("value", "smokes")
    .text("Smoker (%)");

  // Update toolTip
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // Event listener (x-axis)
  xLabelsGroup.selectAll("text").on("click", function () {
    let value = d3.select(this).attr("value");

    if (value != chosenXAxis) {
      // Replace selection <x> w/ <value>
      chosenXAxis = value;

      // Update new data <x>
      xLinearScale = xScale(censusData, chosenXAxis);

      // Update x-axis
      xAxis = renderXAxis(xLinearScale, xAxis);

      // Upate circles w/ new <x><value>
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Update text
      textGroup = renderText(
        textGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Update toolTip
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change classes Changes text
      if (chosenXAxis === "poverty") {
        povertyLabel.classed("active", true).classed("inactive", false);
        ageLabel.classed("active", false).classed("inactive", true);
      } else if (chosenXAxis === "age") {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", true).classed("inactive", false);
      } else {
        povertyLabel.classed("active", false).classed("inactive", true);
        ageLabel.classed("active", false).classed("inactive", true);
      }
    }
  });
  // Event listener (y-axis)
  yLabelsGroup.selectAll("text").on("click", function () {
    var value = d3.select(this).attr("value");

    if (value != chosenYAxis) {
      // Replace selected <y> w/ <value>
      chosenYAxis = value;

      // Update <y> scale
      yLinearScale = yScale(censusData, chosenYAxis);

      // Update y-axis
      yAxis = renderYAxis(yLinearScale, yAxis);

      // Update circles w/ new <y><values>
      circlesGroup = renderCircles(
        circlesGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Update text w/ new <y><values>
      textGroup = renderText(
        textGroup,
        xLinearScale,
        chosenXAxis,
        yLinearScale,
        chosenYAxis
      );

      // Update toolTips
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // Change classes Changes text
      if (chosenYAxis === "healthcare") {
        healthcareLabel.classed("active", true).classed("inactive", false);
        smokesLabel.classed("active", false).classed("inactive", true);
      } else if (chosenYAxis === "smokes") {
        healthcareLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", true).classed("inactive", false);
      }
    }
  });
});
