// ___________________________Weapon Bar Chart_______________________________
function drawBarChartWeapon(data) {
    console.log(data);
    // Count the occurrences of each weapon
    var weaponCounts = {};
    data.forEach(function (item) {
        var weapon = item["Weapon Carried/Used"];
        var inj = item["Health Workers Injured"];
        var kil = item["Health Workers Killed"];
        var kid = item["Health Workers Kidnapped"];
        if (inj != 0 || kil != 0 || kid != 0) {
            if (weapon !== null && weapon !== "") {
                weaponCounts[weapon] = (weaponCounts[weapon] || 0) + 1;
            }
        }
    });

    // Sort the weapons by count in descending order
    var sortedWeapons = Object.keys(weaponCounts).sort(function (a, b) {
        return weaponCounts[b] - weaponCounts[a];
    });

    // Take only the top 5 weapons
    var topWeapons = sortedWeapons.slice(0, 5);
    var counts = topWeapons.map(function (weapon) {
        return weaponCounts[weapon];
    }).reverse();

    // Create an array to hold the data for the chart
    var chartData = {
        labels: topWeapons,
        series: [counts]
    };

    var optionChart = {
        horizontalBars: true,
        plugins: [
            Chartist.plugins.ctBarLabels({
                position: {
                    x: function (data) {
                        return data.x2 + 40;
                    }
                },
                labelOffset: {
                    y: 7
                },
                labelInterpolationFnc: function (text) {
                    return text + '%';
                }
            }),
            Chartist.plugins.tooltip()
        ],
        axisX: {
            showGrid: false,
            onlyInteger: true,
            labelInterpolationFnc: function (value, index) {
                return index % 2 === 0 ? value : null; // Show every other label for better readability
            },
            labelOffset: {
                y: 20 // Adjust the offset to position the x-axis title
            }
        },
        axisY: {
            showGrid: false,
            labelOffset: {
                x: -15, // Adjust the offset to position the y-axis title
                y: 0
            },
            labelInterpolationFnc: function (value) {
                return value;
            }
        },
        height: "380px",
        chartPadding: {
            top: 20, // Adjust the padding to accommodate the x-axis title
            right: 50,
            left: 80
        },
        animation: {
            enabled: true, // Enable animation
            duration: 10000, // Animation duration in milliseconds
            easing: 'easeOutQuart' // Animation easing function
        },
    };

    var responsiveChart = [
        ['screen and (max-width: 550px)', {
            seriesBarDistance: 15,
            axisY: {
                labelInterpolationFnc: function (value) {
                    return value[0];
                }
            }
        }]
    ];

    Chartist.Bar('#weaponsChart', chartData, optionChart, responsiveChart);
}


function clearWeaponsChart() {
    // Remove all child elements of the bubble chart
    d3.select("#weaponsChart").selectAll("*").remove();
}

export { drawBarChartWeapon, clearWeaponsChart };