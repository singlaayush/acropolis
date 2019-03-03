$(document).ready(function() {
    function stddev(array) {
        var STDEV = 0.0, sum = 0.0, n = array.length, i = 0, x = 0.0;

        while(i < n){
            sum += array[i];
            i++;
        }
        console.log("Sum: " + sum);
        var mean= sum/i;

        for (i = 0; i < n; i++){
            x += Math.pow((array[i] - mean), 2);
        }

        STDEV = Math.sqrt(x/n);
        return STDEV;
    }
    function math(gdpValues, inflationValues, unemploymentValues, debtValues, gdpCurrent) {
        console.log("RAW GDP: " + gdpValues);
        console.log("RAW INFLATION: " + inflationValues);
        console.log("RAW UNEM: " + unemploymentValues);
        console.log("RAW DEBT: " + debtValues);

        var stdev_gdpchange = stddev(gdpValues);
        console.log("Standard Dev GDPChange: " + stdev_gdpchange);
        var stdev_inflation = stddev(inflationValues);
        console.log("Standard Dev Inflation: " + stdev_inflation);

        var stdev_unemployment = stddev(unemploymentValues);
        console.log("Standard Dev Unemployment: " + stdev_unemployment);

        var stdev_defgdp = stddev(debtValues);
        console.log("Standard Dev DefGDP: " + stdev_defgdp);


        var infRate = inflationValues[0];
        console.log("Current Inflation: " + infRate);
        var unmRate = unemploymentValues[0];
        console.log("Current UNM Rate: " + unmRate);

        var gdpRate = gdpValues[0];
        console.log("Current GDP Rate: " + gdpRate);

        var deficit = debtValues[0] / 100;
        console.log("Current Debt: " + deficit);


        var avgstdev = (stdev_gdpchange + stdev_inflation + stdev_unemployment + stdev_defgdp)/4.0;
        console.log("Standard Dev AVG: " + avgstdev);


        //Part 1 calculates weights for each factor

        var wgdp= avgstdev / stdev_gdpchange;
        console.log("Standard Dev WGDP: " + wgdp);

        var winf= avgstdev / stdev_inflation;
        console.log("Standard Dev WINF: " + winf);

        var wunm= avgstdev / stdev_unemployment;
        console.log("Standard Dev WUNM: " + wunm);

        var wdef= avgstdev / stdev_defgdp;
        console.log("Standard Dev WDEF: " + wdef);


        //Part 2 calculates the Weighted EPI for the country

        const wEPI = 100.0 - (Math.abs(2 - infRate) * 1.5) - (Math.abs(2 - unmRate) ) * 1.5 - (-deficit) * 2
            + ((gdpRate - 4.75) * 2);
        console.log(winf + "%%%%%%%%" + infRate + "%%%%%%%%%%" + wunm + "%%%%%%%%%" + unmRate + "%%%%%%%%%%%" + wdef + "%%%%%%%" + deficit + "%%%%%%%%" + gdpCurrent + "%%%%%%%%%%%%%%" + wgdp + "%%%%%" + gdpRate);
        console.log(wEPI);


        //Part 3 calculates letter grades based on weighted EPI for the country
        if(wEPI>= 99.0){
            return "A+";
        }
        if (96.0<=wEPI && wEPI<99.0){
            return "A";
        }
        if (95.0<= wEPI && wEPI < 96.0){
            return "A-";
        }
        if (94.0<= wEPI && wEPI < 95.0){
            return "B+";
        }
        if (91.0<= wEPI && wEPI < 94.0){
            return "B";
        }
        if (90.0<= wEPI && wEPI < 91.0){
            return "B-";
        }
        if (87.0<= wEPI && wEPI < 90.0){
            return "C+";
        }
        if (83.0<= wEPI && wEPI < 87.0){
            return "C";
        }
        if (80.0<= wEPI && wEPI < 83.0){
            return "C-";
        }
        if (74.0<= wEPI && wEPI < 80.0){
            return "D+";
        }
        if (66.0<= wEPI && wEPI < 74.0){
            return "D";
        }
        if (60.0<= wEPI && wEPI < 66.0){
            return "D-";
        }
        if (wEPI < 60.0){
            return "Fail";
        }
    }

    $.get('/api/results', function(response) {
        var json = JSON.parse(response).bindings;
        var countryOptions = {};
        var gdpValues = [];
        var debtValues = [];
        var inflationValues = [];
        var unemploymentValues = [];
        var gdpCurrent = 0;

        var startTimes = {};
        for (var i = 0; i < json.length; i++) {
            startTimes[json[i].iso.value] = json[i].start_time.value;
        }

        for (var i = 0; i < json.length; i++) {
            countryOptions[json[i].countryLabel.value] = json[i].iso.value;
        }
        var countryOptionsHTML = "";
        for (var i = 0; i < json.length; i++) {
            countryOptionsHTML += "<option value='"+json[i].iso.value+"'>"+json[i].countryLabel.value+"</option>";
        }
        $("select").html(countryOptionsHTML);
        $("select").change(function() {
            var countryCode = $(this).val();
            var start = startTimes[countryCode];
            $.get("https://www.quandl.com/api/v3/datasets/ODA/" + countryCode + "_LUR/data.json?api_key=e7Fsxgoafnmxyr2yXxdu", function(response) {


                var dates = response.dataset_data.data;
                unemploymentValues[0] = dates[4][1];
                for (var d = 5; d < dates.length; d++) {
                    var currentDate = dates[d][0];
                    var currentGDP = dates[d][1];

                    if(currentDate.substr(0, 4) >= startTimes[countryCode].substr(0, 4) - 1) {
                        unemploymentValues[d - 4] = currentGDP;
                    }                }


                $.get("https://www.quandl.com/api/v3/datasets/ODA/" + countryCode + "_PPPGDP/data.json?api_key=e7Fsxgoafnmxyr2yXxdu", function(response) {


                    var dates = response.dataset_data.data;
                    var gdpRawValues = [];
                    var gdpTemp = [];
                    gdpTemp[0] = 0;
                    gdpRawValues[0] = dates[4][1];
                    for (var d = 5; d < dates.length; d++) {
                        var currentDate = dates[d][0];
                        var currentGDP = dates[d][1];

                        if(currentDate.substr(0, 4) >= startTimes[countryCode].substr(0, 4) - 1) {
                            gdpRawValues[d - 4] = currentGDP;
                        }
                    }

                    for (var i = 0; i < gdpRawValues.length - 1; i++) {
                        gdpTemp[i] = ((gdpRawValues[i] - gdpRawValues[i + 1]) / gdpRawValues[i + 1]) * 100;
                    }
                    gdpTemp[gdpRawValues.length - 1] = 0;
                    gdpCurrent = gdpRawValues[0];
                    gdpValues = gdpTemp;
                    console.log(gdpValues);

                    $.get("https://www.quandl.com/api/v3/datasets/ODA/" + countryCode + "_PCPIPCH/data.json?api_key=e7Fsxgoafnmxyr2yXxdu", function(response) {


                        var dates = response.dataset_data.data;
                        inflationValues[0] = dates[4][1];
                        for (var d = 5; d < dates.length; d++) {
                            var currentDate = dates[d][0];
                            var currentGDP = dates[d][1];

                            if(currentDate.substr(0, 4) >= startTimes[countryCode].substr(0, 4) - 1) {
                                inflationValues[d - 4] = currentGDP;
                            }

                            console.log("The Values We Need: " + inflationValues);
                        }


                        $.get("https://www.quandl.com/api/v3/datasets/ODA/" + countryCode + "_GGSB_NPGDP/data.json?api_key=e7Fsxgoafnmxyr2yXxdu", function(response) {


                            var dates = response.dataset_data.data;
                            debtValues[0] = dates[4][1];
                            for (var d = 5; d < dates.length; d++) {
                                var currentDate = dates[d][0];
                                var currentGDP = dates[d][1];

                                if(currentDate.substr(0, 4) >= startTimes[countryCode].substr(0, 4) - 1) {
                                    debtValues[d - 4] = currentGDP;
                                }
                            }

                            console.log("GDPPPPPPPPPPPPPPPPPPP:" + gdpValues);
                            var grade = math(gdpValues, inflationValues, unemploymentValues, debtValues, gdpCurrent);
                            var text_img = {'A+': "An ‘A+’ grade indicates historically exceptional economic performance. Leaders have crafted intricate and precise policymaking that emphatically inspires investor and consumer confidence, exponentially stimulates investment, and brings all macroeconomic indicators to a long-term desirable level while significantly accelerating growth.", "A" : "An ‘A’ grade indicates excellent economic performance. Leaders have utilized precise policymaking that inspires a fair level of confidence, stimulates investment, and brings most macroeconomic indicators close to a long-term desirable level while accelerating growth.", "A-": "An ‘A-’ grade indicates very good economic performance. Leaders have utilized mostly precise policymaking that inspires a fair level of confidence, stimulates certain investment, and brings some macroeconomic indicators close to a long-term desirable level while maintaining growth.", "B+": "A ‘B+’ grade indicates good economic performance. Leaders have utilized somewhat uneven policymaking that inspires some confidence, stimulates certain investment to a limited extent, and brings some macroeconomic indicators close to a long-term desirable level while mostly maintaining growth.", "B": "A ‘B’ grade indicates fair economic performance. Leaders have utilized somewhat uneven policymaking that inspires some confidence, stimulates certain investment to a limited extent, and brings some macroeconomic indicators close to a long-term desirable level while maintaining some growth.", "B-": "A ‘B-’ grade indicates satisfactory economic performance. Leaders have utilized somewhat uneven policymaking that inspires some confidence, maintains investment, and brings some macroeconomic indicators close to a long-term desirable level while maintaining some growth.","C+": "A ‘C+’ grade indicates sub-par economic performance. Leaders have attempted to employ unbalanced or ineffective policymaking that may maintain a base level of confidence, maintains some investment, but fails to bring most macroeconomic indicators to a long-term desirable level while mostly maintaining GDP.","C":"A ‘C’ grade indicates significantly sub-par economic performance. Leaders have mostly failed to employ policymaking that manages the economy effectively. Confidence is somewhat damaged and investment decreases, causing macroeconomic indicators to deviate significantly from long-term desirability.", "C-": "A ‘C-’ grade indicates worryingly unsound economic performance. Leaders have mostly failed to employ policymaking that manages the prior state of the economy. Confidence is significantly damaged and investment contracts greatly, causing macroeconomic indicators to enter major recessionary territory.", "D+": "A ‘D+’ grade indicates dangerously unsound economic performance. Leaders have failed to employ policymaking that manages the prior state of the economy to any extent. Investors and consumers begin to panic, potentially leading to nationwide defaults, credit instability, and the threat of nationwide financial crisis, causing macroeconomic indicators to imply a deep recession. The current state of the economy is deficient enough to adversely impact a long-term recovery.", "D": "A ‘D’ grade indicates a near-catastrophic economic performance. Leaders have failed to employ policymaking that manages the economy to any extent, to the effect that no significant interventionist tools exist to combat the state of deep recession and external help may be the only exit path. The trust deficit compounds to the extent that investment and consumer spending approach near zero, leading to nationwide defaults, credit failure, and the viable threat of systemic financial collapse. The current state of the economy is deficient enough to adversely impact a long-term recovery.", "D-": "A ‘D-’ grade indicates catastrophic economic performance. Leaders have failed in policymaking to the extent that their macroeconomic management efforts are irrelevant, and barring emergency aid or ‘shock therapy’, there is little chance of short-term or intermediate-term recovery. The trust deficit compounds to the extent that investment and consumer spending approach near zero, leading to nationwide defaults, credit failure, and an actual systemic financial collapse. ", 'Fail': "A ‘F’ grade indicates historically catastrophic economic performance. A ranking of ‘F’ has never been recorded in the United States- this typically occurs due to ongoing systemic financial collapse, successive sovereign defaults, massive hyperinflation, and/or civil war."};
                            for (var i = 0; i < json.length; i++) {
                                if (json[i].iso.value == countryCode) {
                                    $(".results").html("<img class='banda' src='"+json[i].image.value+"'>");
                                    $(".leaderName").html(json[i].hgovernmentLabel.value);
                                    $(".countryName").html(json[i].countryLabel.value);
                                    $(".gdp").html(gdpValues[0])
                                    $(".unemployment").html(unemploymentValues[0])
                                    $(".inflation").html(inflationValues[0])
                                    $(".deficit").html(debtValues[0])
                                    $(".grade_img").html("<img width='100' src='assets/grade"+ grade +".png'>")
                                    $(".text_img").html(text_img[grade])
                                }
                            }
                        });
                    });
                });
            });
        });
    });
});