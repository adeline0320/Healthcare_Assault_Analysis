var dd;

// __________________________Bubble Chart_______________________________
 function groupPerpetratorData(data) {
    var per = [];
    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    data.forEach((c) => {
        var perpetrator = c["Reported Perpetrator"];
        var perpetratorName = c["Reported Perpetrator Name"];

        // Find the corresponding perpetrator object in the per array
        var perpetratorObj = per.find((p) => p.Perpetrator === perpetrator);

        // If the perpetrator object doesn't exist, create a new one
        if (!perpetratorObj) {
            perpetratorObj = { Perpetrator: perpetrator, Count: 1, child: [] };
            per.push(perpetratorObj);
        } else {
            perpetratorObj.Count++; // Increment the count if the perpetrator already exists
        }

        // Find the corresponding name object in the children array
        var nameObj = perpetratorObj.child.find((n) => n.Name === perpetratorName);

        // If the name object doesn't exist, create a new one
        if (!nameObj) {
            nameObj = { Name: perpetratorName, Count: 1 };
            perpetratorObj.child.push(nameObj);
        } else {
            nameObj.Count++; // Increment the count if the name already exists
        }
    });
    return per;
}

function drawBubbleChart(data) {
    var svg = d3.select("#bubble_chart")
        .style("width", "500px")
        .style("height", "440px");
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    // Define the tooltip element
    var div = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var pack = d3
        .pack()
        .size([300, 450])
        .padding(2);

    var hierarchy = d3
        .hierarchy({ children: data })
        .sum((d) => {
            return d.Count;
        });

    var nodes = pack(hierarchy).descendants();

    // Exclude the largest bubble
    nodes = nodes.filter((d) => {
        return !d.children;
    });

    // Sort the nodes in descending order based on count
    nodes.sort((a, b) => {
        return b.value - a.value;
    });

    // Take only the top 5 nodes
    nodes = nodes.slice(0, 5);

    var bubbles = svg
        .selectAll(".bubble")
        .data(nodes)
        .enter()
        .append("g")
        .classed("svg-container", true)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 300 300")
        .attr("class", "bubble")
        .attr("transform", (d) => {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    bubbles
        .append("circle")
        .attr("r", (d) => {
            return d.r || 0;
        })
        .style("fill", (d, i) => {
            return color(i);
        });

    bubbles
        .append("text")
        .attr("dy", "0.4em")
        .style("text-anchor", "middle")
        .text((d) => d.data.Perpetrator)
        .style("fill", "white")
        .style("font-size", (d) => d.r >= 20 ? "10px" : "0")
        .each(positionText)
        .call(handleTextCollisions);

    function positionText(d) {
        var text = d3.select(this);
        var words = d.data.Perpetrator ? d.data.Perpetrator.split(/\s+/).reverse() : [];
        var lineHeight = 1.2;
        var dy = parseFloat(text.attr("dy"));

        var tspan = text.text(null).append("tspan").attr("x", 0).attr("y", 0).attr("dy", (dy - .5) + "em");

        var line = [];
        var lineNumber = 0;
        var tspanNode = tspan.node();

        while (words.length > 0) {
            var word = words.pop();
            line.push(word);
            tspan.text(line.join(" "));

            if (tspanNode.getComputedTextLength() > 2 * d.r) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", (++lineNumber * lineHeight + dy - .5) + "em")
                    .text(word);
                tspanNode = tspan.node();
            }
        }

        // Calculate the vertical center of the text
        var textHeight = lineNumber * lineHeight;
        var verticalCenter = -textHeight / 2;

        // Update the y-coordinate of the text to be the vertical center
        text.attr("y", verticalCenter);
    }

    function handleTextCollisions(selection) {
        selection.each(function () {
            var text = d3.select(this);
            var bbox = text.node().getBBox();

            var circles = svg.selectAll("circle");

            var hasCollision = true;
            var iteration = 0;
            var maxIterations = 100;

            while (hasCollision && iteration < maxIterations) {
                hasCollision = false;

                circles.each(function () {
                    var circle = d3.select(this);
                    var circleBBox = circle.node().getBBox();

                    if (checkCollision(bbox, circleBBox)) {
                        hasCollision = true;

                        // Calculate the vertical offset based on the circle's center and the text's height
                        var yOffset = bbox.height / 2;

                        // Move the text vertically based on the circle's position
                        var dy = (circleBBox.y + circleBBox.height / 2 - bbox.y - yOffset);
                        text.attr("y", parseFloat(text.attr("y")) + dy);
                    }
                });

                iteration++;
            }
        });
    }

    // Function to check for collision between two bounding boxes
    function checkCollision(bbox1, bbox2) {
        return (
            bbox1.x < bbox2.x + bbox2.width &&
            bbox1.x + bbox1.width > bbox2.x &&
            bbox1.y < bbox2.y + bbox2.height &&
            bbox1.y + bbox1.height > bbox2.y
        );
    }

    function handleMouseOver(d) {
        d3.select(this).style("opacity", 0.7);

        // Show the tooltip with transition
        div.transition().duration(200).style("opacity", 0.9);

        dd = d3.select(this).datum().data;
        // console.log(dd.Perpetrator);

        var topNames = dd.child
            .sort(function (a, b) {
                return b.Count - a.Count;
            })
            .slice(0, 5)
            .map(function (obj) {
                return { Name: obj.Name, Count: obj.Count };
            });

        // console.log(topNames);

        var tooltipContent = "<b><u><span style='font-size: 16px; display: block; margin: 0 auto;'>" + dd.Perpetrator + "</span></u></b><br/>";

        topNames.forEach(function (obj) {
            tooltipContent += "Name: <b>" + obj.Name + "</b><br/>Count: <b>" + obj.Count + "</b><br/><br/>";
        });

        // console.log(tooltipContent);

        div
            .html(tooltipContent)
            .style("left", event.pageX + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    function handleMouseOut() {
        d3.select(this).style("opacity", 1);

        // Hide the tooltip
        div.transition().duration(500).style("opacity", 0);
    }

    if (!data || data.length === 0) {
        svg.append("text")
            .attr("x", "50%")
            .attr("y", "50%")
            .attr("text-anchor", "middle")
            .text("No Value");
        return;
    }
 
}

function clearBubbleChart() {
    // Remove all child elements of the bubble chart
    d3.select("#bubble_chart").selectAll("*").remove();
}

export  {groupPerpetratorData,drawBubbleChart,clearBubbleChart};