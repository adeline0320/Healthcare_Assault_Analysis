let tooltip;
// ___________________________Line Chart_______________________________
export default function linechart(data) {
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"];

    // Parse the data
    data.forEach(function (d) {
        const parseDate = d3.timeParse("%d/%m/%Y");
        var date = parseDate(d.Date);
        if (date !== null) {
            d.month = new Date(date).getMonth();
            d.month = month[d.month];
        }
        d.killed = +d["Health Workers Killed"];
        d.injured = +d["Health Workers Injured"];
        d.kidnapped = +d["Health Workers Kidnapped"];
        d.threat = +d["Health Workers Threatened"];
    });

    // Function to update the line chart based on selected year and country
    function updateChart(data) {
        const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"];

        // Group the data by month and calculate the sum of each category
        const groupedData = d3.group(data, (d) => d.month);
        const summedData = Array.from(groupedData, ([month, values]) => {
            const killed = d3.sum(values, (d) => +d.killed);
            const injured = d3.sum(values, (d) => +d.injured);
            const threatened = d3.sum(values, (d) => +d.threat);
            const kidnapped = d3.sum(values, (d) => +d.kidnapped);
            return {
                month: month,
                Killed: killed,
                Injured: injured,
                Threatened: threatened,
                Kidnapped: kidnapped
            };
        });
        // Sort summedData based on month order
        summedData.sort(
            (a, b) => month.indexOf(a.month) - month.indexOf(b.month)
        );

        // Set the dimensions and margins of the char
        const margin = { top: 20, right: 20, bottom: 35, left: 50 };
        const containerWidth = document.getElementById("line_chart").offsetWidth;
        const width = containerWidth - margin.left - margin.right;
        const height = 325;

        // Clear previous chart
        d3.select("#line_chart svg").remove();
        d3.select("tooltip div").remove();

        // Create SVG element
        const svg = d3
            .select("#line_chart")
            .append("svg")
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Set the x scale and axis
        const xScale = d3
            .scaleBand()
            .domain(month)
            .range([0, width])

        svg
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale));
            
        // Add x-axis title
        svg.append("text")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top +15) + ")")
        .style("text-anchor", "middle")
        .text("Month");
      

        // Set the y scale and axis
        const yScale = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(
                    summedData,
                    (d) =>
                        Math.max(d.Killed, d.Injured, d.Threatened, d.Kidnapped)
                )
            ])
            .range([height, 0])

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale))

            // Add y-axis title
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Number of Incidents");

        // Create a line generator
        const line = d3
            .line()
            .x((d) => xScale(d.month) + xScale.bandwidth() / 2)
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Create line data for each category
        const categories = ["Killed", "Injured", "Threatened", "Kidnapped"];
        const lineData = categories.map((category) => {
            return {
                category: category,
                values: summedData.map((d) => {
                    return {
                        month: d.month,
                        value: d[category]
                    };
                })
            };
        });

        // Draw lines for each data category
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        lineData.forEach((lineDataItem, index) => {
            svg
                .append("path")
                .datum(lineDataItem.values)
                .attr("class", "line")
                .attr("d", line)
                .attr("fill", "none")
                .style("stroke", colorScale(index))
                .call(transition);
        });



        // Append a vertical line overlay
        const lineOverlay = svg
            .append("line")
            .attr("class", "line-overlay")
            .attr("y1", 0)
            .attr("y2", height)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("opacity", 0);

        // Append a circle to indicate the hovered month
        const circle = svg
            .append("circle")
            .attr("class", "circle-overlay")
            .attr("r", 4)
            .style("fill", "black")
            .style("opacity", 0);

        // Add event listeners to show vertical line and tooltip
        svg.on("mousemove", function (event) {
            showTooltip(event);
        });
        // Add event listener to hide tooltip when mouse is not on the line chart
        document.addEventListener("mousemove", function (event) {
            const chartContainer = document.getElementById("line_chart");
            const isMouseOnChart = chartContainer.contains(event.target);
            if (!isMouseOnChart) {
                hideTooltip();
            }
        });

        function showTooltip(event) {

            if (tooltip) {
                tooltip.remove()
            }

            // Calculate the corresponding month based on the mouse position
            const mouseX = d3.pointer(event)[0];
            const monthIndex = Math.floor((mouseX) / xScale.bandwidth());
            if (monthIndex < 0 || monthIndex > 12) {
                hideTooltip();
                return;
                
            }
            else if(monthIndex < 0 && mondthIndex > 12){
                hideTooltip();
                
            }

            const month_sel = month[monthIndex];

            // Find the data for the hovered month
            const hoveredData = summedData.find((d) => d.month === month_sel);

            if (!hoveredData) {
                hideTooltip();
                return;
              }

            // Show the vertical line and move it to the correct position
            lineOverlay
                .style("opacity", 1)
                .attr("x1", xScale(month_sel) + xScale.bandwidth() / 2)
                .attr("x2", xScale(month_sel) + xScale.bandwidth() / 2);

            // Show the circle at the corresponding x position
            circle
                .style("opacity", 1)
                .attr("cx", xScale(month_sel) + xScale.bandwidth() / 2);

            // Create a tooltip div
            tooltip = d3
                .select("#line_chart")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0)
                .style('background-color', 'lightblue')
                .style('width', "200px")
                .style("height", "100px")
                .style("text-align", "center")
                .style("color", "black")

            // Show the tooltip with incident details
            tooltip
                .style("opacity", 1)
                .style("left", event.offsetX -50 + "px")
                .style("top", event.offsetY - 150 + "px")
                .html(
                    "<strong>Month: " + month_sel + "</strong><br/>" +
                    "Killed: " + hoveredData.Killed + "<br/>" +
                    "Injured: " + hoveredData.Injured + "<br/>" +
                    "Threatened: " + hoveredData.Threatened + "<br/>" +
                    "Kidnapped: " + hoveredData.Kidnapped
                );
        }

        function transition(path) {
            const length = path.node().getTotalLength(); // Get line length
            path.attr("stroke-dasharray", length + " " + length)
                .attr("stroke-dashoffset", length)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
        }


        // Add legend
        const legend = svg.selectAll(".legend")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + (i * 20) + ")");

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d, i) => colorScale(i));

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 10)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);
    }

    updateChart(data);
}

function hideTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
      lineOverlay.style("opacity", 0);
      circle.style("opacity", 0);
    }
  }

