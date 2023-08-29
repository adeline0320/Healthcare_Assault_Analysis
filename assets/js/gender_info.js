// ___________________________Infographic______________________________

export default function infographic(data) {

    data.forEach(function (d) {
        d.male_killed = +d["Male Health Workers Killed"]
        d.female_killed = +d["Female Health Workers Killed"]
        d.male_injured = +d["Male Health Workers Injured "]
        d.female_injured = +d["Female Health Workers Injured"]
    });

    // Filter the dataset based on the selected year and month
    // Calculate the total number of males and females killed
    const totalMaleKill = d3.sum(data, d => d.male_killed);
    const totalFemaleKill = d3.sum(data, d => d.female_killed);
    const totalMaleInjured = d3.sum(data, d => d.male_injured);
    const totalFemaleInjured = d3.sum(data, d => d.female_injured);

    $("#male_killed_val").animate(
        { value: totalMaleKill },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#male_injured_val").animate(
        { value: totalMaleInjured },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#female_killed_val").animate(
        { value: totalFemaleKill },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
    $("#female_injured_val").animate(
        { value: totalFemaleInjured },
        {
            duration: 2000,
            step: function (now) {
                $(this).text(Math.floor(now));
            }
        }
    );
}

