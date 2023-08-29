var top10Data;
// ___________________________Country Bar Chart_______________________________
export default function barchartCountry(data) {
    data.forEach(function (d) {
        d["Health Workers Killed"] = +d["Health Workers Killed"]
        d["Health Workers Injured"] = +d["Health Workers Injured"]
        d["Health Workers Kidnapped"] = +d["Health Workers Kidnapped"]
    });

    d3.select("#killedChart").selectAll("*").remove();
    d3.select("#injuredChart").selectAll("*").remove();
    d3.select("#kidnappedChart").selectAll("*").remove();

    // Define the dimensions and margins for the charts
    const chartWidth = 280;
    const chartHeight = 280;
    const margin = { top: 20, right: 3, bottom: 0, left: 140 };

    // Create the SVG container for each chart
    const killedSvg = d3.select("#killedChart")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 300")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom - 30)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const injuredSvg = d3.select("#injuredChart")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 300")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom - 30)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const kidnappedSvg = d3.select("#kidnappedChart")
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 300")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom - 30)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Function to create the bar chart
    function createBarChart(svg, incidentType) {

        // Calculate the total incidents for each country
        const nestedData = d3.group(data, d => d.Country);
        var countryData = Array.from(nestedData, function ([country, values]) {
            var totalKilled = d3.sum(values, function (d) { return d[incidentType]; });
            return { country: country, killed: totalKilled };
        });
        countryData = countryData.filter(d => d.killed > 0);
        countryData.sort((a, b) => b.killed - a.killed);
        top10Data = countryData.slice(0, 10);


        // Set the dimensions for the chart area
        const width = chartWidth - margin.left - margin.right;
        const height = chartHeight - margin.top - margin.bottom;

        // Set
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(top10Data, function (d) { return d.killed; })])
            .range([0, width]);


        const yScale = d3.scaleBand()
            .domain(top10Data.map(function (d) { return d.country; }))
            .range([0, height])
            .padding(0.1);


        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("class", "y-axis")
            
            .call(yAxis)
            .selectAll("text")
            .style("font-size", "15px");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -120)
            .attr("x", -110)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Country");

        // Create the bars
        svg.selectAll(".bar")
            .data(top10Data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function (d) {
                return yScale(d.country);
            })
            .attr("height", yScale.bandwidth())
            .attr("fill", "steelblue")
            .transition()
            .duration(500)
            .attr("width", function (d) {
                return xScale(d.killed);
            })


        // Append numbers to the bars
        svg.selectAll(".bar-label")
            .data(top10Data)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", function (d) {
                return xScale(d.killed) + 5;
            })
            // .style("font-size", measurements.yScale.bandwidth() + '%')
            .attr("y", function (d) {
                return yScale(d.country) + yScale.bandwidth() / 2 + 4;
            })
            .style("fill", "black")
            .text(function (d) {
                return d.killed;
            });
    }

    function updateCharts() {
        createBarChart(killedSvg, "Health Workers Killed");
        createBarChart(injuredSvg, "Health Workers Injured");
        createBarChart(kidnappedSvg, "Health Workers Kidnapped");
    }
    updateCharts();
}

