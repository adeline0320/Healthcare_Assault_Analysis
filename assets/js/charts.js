import infographic from "./gender_info.js";
import {groupPerpetratorData,drawBubbleChart,clearBubbleChart} from "./bubble_chart.js";
import {drawBarChartWeapon,clearWeaponsChart} from "./weapon_bar_chart.js";
import barchartCountry from "./country_bar_chart.js";
import linechart from "./line_chart.js";


let data;
var selectedIncident = "all";
var selectedYear = "all";
var selectedCountry = "all";
var slider;
var data2;
var clickedCountryId = null;


d3.csv("dataset.csv").then((d) => {

    $(document).ready(function () {
        // _________ initial state ____________//
        data = d;
        slider = sliderInitial();
        data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
        getIncidentData(data);
        allChartUpdated(data, d, selectedIncident, selectedYear);
        yearUpdateChart(data);
        // ____________ change when user choose incident type ___________ //
        $(".form-radio-input").on("change", (event) => {
            selectedIncident = $(event.currentTarget).val();
            if ($(".form-check-input").prop("checked") === true) { // all year
                selectedYear = "all";
                data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
                data2 = getFilterData(selectedIncident, d, selectedYear, "all");

            } else { // selected year only
                selectedYear = slider.slider("value");
                data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
                data2 = getFilterData(selectedIncident, d, selectedYear, "all");

            }
            allChartUpdated(data, d, selectedIncident, selectedYear);
            yearUpdateChart(data2)
        });


        // if change check / uncheck year
        $(".form-check-input").on("change", function () {
            selectedIncident = $("input[name='optionsRadios']:checked").val();
            if ($(this).prop("checked")) {
                selectedYear = "all";
                data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
                data2 = getFilterData(selectedIncident, d, selectedYear, "all");
            } else {
                selectedYear = slider.slider("value");
                data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
                data2 = getFilterData(selectedIncident, d, selectedYear, "all");
            }
            allChartUpdated(data, d, selectedIncident, selectedYear);
            yearUpdateChart(data2)
        });

        // if all year not tick n change the year (slider)
        slider.on("slide", function (event, ui) {
            selectedIncident = $("input[name='optionsRadios']:checked").val();
            if ($(".form-check-input").prop("checked") != true) {
                selectedYear = ui.value;
                data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
                allChartUpdated(data, d, selectedIncident, selectedYear);
                // data = getFilterData(selectedIncident, d, selectedYear, 'all');
                yearUpdateChart(data)
            }
        });
    });
});

function allChartUpdated(data, d, selectedIncident, selectedYear) {
    getIncidentData(data);

    if (!d3.select("#bubble_chart").empty()) { clearBubbleChart(); }
    drawBubbleChart(groupPerpetratorData(data));

    if (!d3.select("#weaponsChart").empty()) { clearWeaponsChart(); }
    drawBarChartWeapon(data);

    infographic(data);

    drawMapChart(data, d, selectedIncident, selectedYear);

}

function yearUpdateChart(data) {
    barchartCountry(data)
    linechart(data)
}

function getFilterData(selectedIncident, data, year, country) {

    var mapping = {
        "conflict": "Conflict-Related Violence",
        "covid": "COVID-19-Related Violence",
        "ebola": "Ebola-Related Violence",
        "political": "Political-Related Violence",
        "vaccination": "Vaccination-Related Violence",
    };

    var columnName = mapping[selectedIncident];
    var tmp = [];

    if (selectedIncident === "all" && year === "all" && country == "all") {

        return data;
    } else if (selectedIncident === "all" && year === "all") {
        data.forEach((d) => {
            tmp.push(d);
        });
    } else if (selectedIncident != "all" && year === "all") {
        data.forEach((d) => {
            var columnValue = d[columnName];
            if (columnValue != "NotApplicable") {
                tmp.push(d);
            }
        });
    } else if (selectedIncident != "all" && year != "all") {
        data.forEach((d) => {
            var columnValue = d[columnName];
            var rowYear = new Date(d.Date).getFullYear();
            if (columnValue != "NotApplicable" && rowYear === year) {
                tmp.push(d);
            }
        });
    } else if (selectedIncident === "all" && year != "all") {
        data.forEach((d) => {
            var rowYear = new Date(d.Date).getFullYear();
            if (rowYear === year) {
                tmp.push(d);
            }
        });
    }

    if (country != "all") {
        tmp = tmp.filter((d) => d["Country"] === country);
    }
    return tmp;
}

function getIncidentData(data) {
    var totalSum_killed = 0;
    var totalSum_injured = 0;
    var totalSum_kidnapped = 0;
    var totalSum_damaged = 0;
    data.forEach((d) => {
        Object.keys(d).forEach((columnName) => {
            var value = parseInt(d[columnName]);

            if (!isNaN(value)) {
                if (columnName == 'Health Workers Killed') {
                    totalSum_killed += value;
                } else if (columnName == 'Health Workers Injured') {
                    totalSum_injured += value;
                } else if (columnName == "Health Workers Kidnapped") {
                    totalSum_kidnapped += value;
                } else if (columnName == "Number of Attacks on Health Facilities Reporting Damaged") {
                    totalSum_damaged += value;
                }
            }
        });
    });

    $("#killed_val").animate(
        { value: totalSum_killed },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#injured_val").animate(
        { value: totalSum_injured },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#kidnapped_val").animate(
        { value: totalSum_kidnapped },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#damaged_val").animate(
        { value: totalSum_damaged },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
}

function getDateRange(data) {
    var minYear = Infinity;
    var maxYear = -Infinity;

    data.forEach(function (d) {
        var date = new Date(d.Date);
        var year = date.getFullYear();

        if (year < minYear) {
            minYear = year;
        }
        if (year > maxYear) {
            maxYear = year;
        }
    });

    return [minYear, maxYear];
}

function sliderInitial() {
    var slider = $("#slider").slider({
        range: "min",
        min: getDateRange(data)[0],
        max: getDateRange(data)[1],
        value: getDateRange(data)[0],
        slide: function (event, ui) {
            $("#year-label").text(ui.value);
        }
    });

    return slider;
}

// __________________________Map Chart_______________________________
function drawMapChart(data, d, selectedIncident, selectedYear) {
    var areasData = {};

    var { incidentsByCountry, minIncident, maxIncident } = calculateTotalIncidents(data);
    var incidentsByCountry = calculateTotalIncidents(data)["incidentsByCountry"];
    var mapData = Object.keys(incidentsByCountry).map((countryISO) => {
        var totalIncidents = incidentsByCountry[countryISO];
        return {
            "Country ISO": countryISO,
            "Country": data.find((d) => d["Country ISO"].startsWith(countryISO))["Country"],
            "Total Incidents": totalIncidents,
        };
    });

    let selectedCountry ;
    mapData.forEach((d) => {
   
        var countryISO = d["Country ISO"];
        var countryName = d["Country"];
        var incidents = d["Total Incidents"];
       

        areasData[countryISO] = {
            tooltip: { content: "<b>Country : " + countryName + "</b><br><b>Total incidents: " + incidents + "</b>" },
            attrs: {
                fill: getColorByIncident(incidents, minIncident, maxIncident),
            },
            attrsHover: {
                fill: "#59d05d", // green (chosen country)
            },
            eventHandlers: {
                click: function (event, id, mapElem, textElem) {
                  // Deselect the previously selected country if any
                  if (selectedCountry) {
                    areasData[selectedCountry].attrs.fill = getColorByIncident(
                      incidentsByCountry[selectedCountry],
                      minIncident,
                      maxIncident
                    );
                  }
        
                  // Select the clicked country
                  selectedCountry = id;
                  areasData[selectedCountry].attrs.fill = "#59d05d";
                  areasData[selectedCountry].attrsHover.fill = "#59d05d";

                  // Update the map with the updated area data
                  $(".mapcontainer").trigger("update", [
                    {
                      mapOptions: {
                        areas: areasData,
                      },
                    },
                  ]);
                   // Call your custom function to handle the click event
                   handleMapClick(countryName);
                },
              },
            };
    });

     // Custom function to handle the map click event
     function handleMapClick(countryName) {
        
        data = getFilterData(selectedIncident, d, selectedYear, countryName);
        console.log("data",data)
        getIncidentData(data);

        if (!d3.select("#bubble_chart").empty()) { clearBubbleChart(); }
        drawBubbleChart(groupPerpetratorData(data));
    
        if (!d3.select("#weaponsChart").empty()) { clearWeaponsChart(); }
        drawBarChartWeapon(data);
    
        infographic(data);
        linechart(data)
    }


        // Calculate the color range
        var colorRange = getColorRange(minIncident, maxIncident, [173, 216, 230], [255, 0, 0]);

        $(".mapcontainer").mapael({
            map: {
                name: "world_countries",
                zoom: {
                    enabled: true,
                    maxLevel: 10,
                },
                defaultPlot: {
                    attrs: {
                        fill: "#004a9b",
                        opacity: 0.6,
                    },
                },
                defaultArea: {
                    attrs: {
                        fill: "#e4e4e4",
                        stroke: "#fafafa",
                    },
                    attrsHover: {
                        fill: "#59d05d",
                    },
                    text: {
                        attrs: {
                            fill: "#505444",
                        },
                        attrsHover: {
                            fill: "#000",
                        },
                },
            },
        },
        legend: {
            legendArea: {
                display: true,
                title: "Total Incidents",
                slices: colorRange,
            },
        },
        areas: areasData,
    });

    // Create legend HTML element
    var legend = $("<div>").addClass("legendContainer").css("background-color", "#FAFAFA");

    // Create title element
    var legendTitle = $("<div>").addClass("legendTitle").text("Incident Count");

    // Append title to the legend
    legend.append(legendTitle);

    // Iterate over the color range to create legend items
    colorRange.forEach((slice) => {
        // Create a legend item element
        var legendItem = $("<div>").addClass("legendItem");

        // Create a color box element
        var colorBox = $("<div>").addClass("colorBox").css("background-color", slice.attrs.fill);

        // Create a label element
        var legendLabel = $("<div>").addClass("legendLabel").text("≥ " + slice.label);

        // Append color box and label to the legend item
        legendItem.append(colorBox, legendLabel);

        // Append legend item to the legend
        legend.append(legendItem);
    });

    // Append legend to the map container
    $(".mapcontainer").append(legend);


    // Reset button click event handler
    $("#reset_btn_map").on("click", function () {
        // Reset the clickedCountryId and areasData to their initial values
        clickedCountryId = null;
        for (var countryISO in areasData) {
            areasData[countryISO].attrs.fill = getColorByIncident(
                incidentsByCountry[countryISO],
                minIncident,
                maxIncident
            );
            areasData[countryISO].attrs.stroke = "#fafafa";
            areasData[countryISO].attrsHover.fill = "#59d05d";
        }

        selectedCountry = "all";
        // Call the getFilterData function with reset values
        data = getFilterData(selectedIncident, d, selectedYear, selectedCountry);
        allChartUpdated(data, d, selectedIncident, selectedYear);
        yearUpdateChart(data);

        // Update the area with the reset country data
        $(".mapcontainer").trigger("update", [
            {
                mapOptions: {
                    areas: areasData,
                },
            },
        ]);
        var updatedColorRange = getColorRange(minIncident, maxIncident, [173, 216, 230], [255, 0, 0]);
        $(".mapcontainer").trigger("updateLegend", [updatedColorRange]);
    });
}
function calculateTotalIncidents(data) {
    var incidentsByCountry = {};

    data.forEach((d) => {
        var countryISO = d["Country ISO"].substring(0, 2);
        var incidents = getTotalIncidents(d);

        if (countryISO !== "") {
            if (!incidentsByCountry[countryISO]) {
                incidentsByCountry[countryISO] = 0;
            }
        }

        incidentsByCountry[countryISO] += incidents;
    });

    // Get the maximum and minimum incidents
    var incidentsArray = Object.values(incidentsByCountry);

    var maxIncident = Math.max(...incidentsArray.filter((incident) => !isNaN(incident)));
    var minIncident = Math.min(...incidentsArray.filter((incident) => !isNaN(incident)));

    return { incidentsByCountry, minIncident, maxIncident };
}
// Function to calculate the total incidents for a country
function getTotalIncidents(data) {
    var healthWorkersKilled = Number(data["Health Workers Killed"]) || 0;
    var healthWorkersInjured = Number(data["Health Workers Injured"]) || 0;
    var healthWorkersKidnapped = Number(data["Health Workers Kidnapped"]) || 0;

    var totalIncidents = healthWorkersKilled + healthWorkersInjured + healthWorkersKidnapped;

    return totalIncidents;
}
// Function to calculate the color based on incident value within the range
function getColorByIncident(incident, minIncident, maxIncident) {
    var startColor = [173, 216, 230]; // Light Blue
    var endColor = [255, 0, 0]; // Light coral

    var incidentRange = maxIncident - minIncident;
    var normalizedValue = (incident - minIncident) / incidentRange;

    var r = Math.round(startColor[0] + normalizedValue * (endColor[0] - startColor[0]));
    var g = Math.round(startColor[1] + normalizedValue * (endColor[1] - startColor[1]));
    var b = Math.round(startColor[2] + normalizedValue * (endColor[2] - startColor[2]));

    var color = "rgb(" + r + "," + g + "," + b + ")";
    return color;
}

// Function to calculate the color range based on min and max incidents
function getColorRange(min, max, startColor, endColor) {
    var colorRange = [];
    var colorInterpolator = d3.interpolateRgb(
        `rgb(${startColor[0]}, ${startColor[1]}, ${startColor[2]})`,
        `rgb(${endColor[0]}, ${endColor[1]}, ${endColor[2]})`
    );

    var step = (max - min) / 5; // Divide the range into 5 steps

    for (var i = 0; i < 5; i++) {
        var value = Math.round(min + i * step);
        var color = colorInterpolator(i / 4); // Interpolate color based on step index

        var slice = {
            label: value.toString(),
            min: value,
            max: value + step,
            attrs: {
                fill: color,
            },
        };

        colorRange.push(slice);
    }

    return colorRange;
}
