//initilize scrollmagic
    var controller = new ScrollMagic.Controller();


    //////////////////////////////////////////////////////////////////////
    /////////////////////////  GLOBAL VARIABLES  /////////////////////////
    //////////////////////////////////////////////////////////////////////

    // App holder for keeping global scope clean
    DS = {}

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 850 - margin.left - margin.right,
      height = 370 - margin.top - margin.bottom;

    // parse the date / time
    var parseTime = d3.timeParse("%y%m");
    var parseYear = d3.timeFormat("%Y"),
      parseMonth = d3.timeFormat("%b");
    var parseTimeMonth = d3.timeParse("%b");
    var parseMonthOnly = d3.timeParse("%m")


    // set the ranges
    var x = d3.scaleTime().domain([parseTimeMonth("jan"),parseTimeMonth("dec")]).range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);


    // define the line
    var valueLine = d3.line()
        .x(function(d) { return x(parseTimeMonth(d.month)); })
        .y(function(d) { return y(+d.Births); })
        ;

    // define the line
    var valueLineState = d3.line()
        .x(function(d) { return x(parseTimeMonth(d.month)); })
        .y(function(d) { return y(+d.stateBirths); })
        ;

    // define the line
    var valueLineA = d3.line()
        .x(function(d) { return x(parseTimeMonth(d.month)); })
        .y(function(d) { return y(+d.median); })
        ;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "svg");

    //////////////////////////////////////////////////////////////////////
    ////////////////////////////  RESPONSIVE  ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    // make chart responsive
    d3.select("#graph")
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append("svg")

      //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", function(d){
          "0 0 1280 640";
        })

      //class to make it responsive
        .classed("svg-content-responsive", true);




    //////////////////////////////////////////////////////////////////////
    ////////////////////////////  DATA IMPORT ////////////////////////////
    //////////////////////////////////////////////////////////////////////


    // Queue multiple files
    d3.queue()
      .defer(d3.csv, "stateCountyNames.csv")
      .defer(d3.csv, "CondensedBirth3.csv")
      .defer(d3.csv, "stateData.csv")
      .defer(d3.csv, "stateAverages.csv")
      .defer(d3.csv, "stateAveragesNormal.csv")
      .defer(d3.csv, "countyAverages.csv")
      .defer(d3.csv, "pBirthsCounty.csv")
      .await(ready);



    // Get the data
function ready(error,
    stateCounty,
    data,
    stateData,
    stateAverages,
    stateNormal,
    countyAverages,
    pBirthsCounty) {

        if (error) throw error;

        stateCounty.forEach(function(d){
          d.County_Name = d.County_Name
          d.County = +d.County
          d.stateName = d.stateName
        })


        // format the data
        data.forEach(function(d) {
            d.Date = parseTime(d.Date);
            d.month = parseMonth(d.Date);
            d.year = parseYear(d.Date);
            d.Births = +d.Births * 10;
            d.County = d.County;
        });


        // format the state level data
        stateData.forEach(function(d){
          d.Date = parseTime(d.Date);
          d.month = parseMonth(d.Date);
          d.year = parseYear(d.Date);
          d.stateBirths = +d.stateBirths;
          d.states = d.states;
          d.dayAvg = +d.dayAvg;
        })

        // format state average data
        stateAverages.forEach(function(d){
          d.states = d.states;
          d.month = parseMonth(parseMonthOnly(d.M));
          d.median = +d.median;
          d.low = +d.low;
          d.high = +d.high;
          d.values = +d.median;
        })

        stateNormal.forEach(function(d){
          d.states = d.states;
          d.month = parseMonth(parseMonthOnly(d.M));
          d.median = +d.median;
          d.low = +d.low;
          d.high = +d.high;
          d.values = +d.median;
          d.dayAvg = +d.dayAvg;
        })

        // format state average data
        countyAverages.forEach(function(d){
          d.County = d.County;
          d.month = parseMonth(parseMonthOnly(d.M));
          d.median = +d.median;
          d.low = +d.low;
          d.high = +d.high;
          d.values = +d.median;
        })

        // format the data
        pBirthsCounty.forEach(function(d) {
            d.Date = parseTime(d.Date);
            d.month = parseMonth(d.Date);
            d.year = parseYear(d.Date);
            d.pBirths = +d.pBirths / 10;
            d.Births = +d.pBirthsN / 100;
            d.County = d.County;
        });



        //////////////////////////////////////////////////////////////////////
        //////////////////////////// NESTING DATA ////////////////////////////
        //////////////////////////////////////////////////////////////////////


        ///////////////////////////  NEST COUNTIES  //////////////////////////

        // Nest the data to create a line for each county and each year
        var nested = d3.nest()
            .key(function(d) { return d.County; })
            .rollup(function(leaves){
              var extent = d3.extent(leaves, function(d){
                return d.Births
              })
              var nest = d3.nest().key(function(d){
                return d.year
              })
              .entries(leaves);
              return {extent:extent, years:nest};
            })
            .entries(data);


        ///////////////////////////  NEST COUNTIES  //////////////////////////

        // Nest the data to create a line for each county and each year
        var nestedPCounties = d3.nest()
            .key(function(d) { return d.County; })
            .rollup(function(leaves){
              var extent = d3.extent(leaves, function(d){
                return d.Births
              })
              var nest = d3.nest().key(function(d){
                return d.year
              })
              .entries(leaves);
              return {extent:extent, years:nest};
            })
            .entries(pBirthsCounty);

            console.log(pBirthsCounty)

        /////////////////////////// NEST COUNTY AVG  //////////////////////////

        var nestACounties = d3.nest()
          .key(function(d){
            return d.County;
          })
          .entries(countyAverages)

        ///////////////////////////  NEST YEARS  //////////////////////////

        // Nest data by year
        var nested2 = d3.nest()
            .key(function(d){ return d.year; })
            .entries(data);

        ///////////////////////////  NEST STATES  //////////////////////////

        var nestedStates = d3.nest()
            .key(function(d){ return d.stateName; })
            .rollup(function(leaves){
              var nest = d3.nest().key(function(d){
                return d.County
              })
              .entries(leaves);
              return { Counties:nest };
            })
            .entries(stateCounty)

        ///////////////////////////  NEST STATES2  //////////////////////////

        // Nest the data to create a line for each county and each year
        var nestMStates = d3.nest()
            .key(function(d) { return d.states; })
            .rollup(function(leaves){
              var extent = d3.extent(leaves, function(d){
                return d.stateBirths
              })
              var nest = d3.nest().key(function(d){
                return d.year
              })
              .entries(leaves);
              return {extent:extent, years:nest};
            })
            .entries(stateData);


        /////////////////////////// NEST STATE AVG  //////////////////////////

        var nestAStates = d3.nest()
          .key(function(d){
            return d.states;
          })
          .entries(stateAverages)

        ///////////////////////////  NEST STATE NORMAL  //////////////////////////

        var nestNStates = d3.nest()
          .key(function(d){
            return d.states;
          })
          .entries(stateNormal)


    //////////////////////////////////////////////////////////////////////
    ////////////////////////  DEFINING EVENTS  ///////////////////////////
    //////////////////////////////////////////////////////////////////////

    var events = [
      {
        type: "sports",
        year: 2005,
        months: ["July", "August"],
        title: "Red Sox World Series Win",
        state: "Massachusetts",
        county: "Suffolk"
      },
      {
        type: "storms",
        year: 2013,
        months: ["July", "August"],
        title: "Hurricane Sandy",
        state: "New York",
        county: "Suffolk"
      },
      {
        type: "storms",
        year: 2006,
        months: ["May", "June"],
        title: "Hurricane Katrina",
        state: "Louisiana",
        county: "Orleans"
      },
      {
        type: "sports",
        year: 2014,
        months: ["October", "November"],
        title: "Seahawks Superbowl Win",
        state: "Washington",
        county: "King",
      }

    ];

    var eventNest = d3.nest()
      .key(function(d){
        return d.type
      })
      .rollup(function(leaves){
        var nest = d3.nest().key(function(d){
          return d.title
        })
        .entries(leaves);
        return { Title:nest };
      })
      .entries(events)

    console.log(events)
    console.log(eventNest)

    //////////////////////////////////////////////////////////////////////
    //////////////////////////  COUNTY NAMES  ////////////////////////////
    //////////////////////////////////////////////////////////////////////

          var countyMap = d3.map(stateCounty, function(d){
            return d.County;
          })

          var countyNameMap = d3.map(stateCounty, function(d){
            return d.County_Name
          })

          var stateMap = d3.map(stateCounty, function(d){
            return d.stateName;
          })

          var eventMap = d3.map(events, function(d){
            return d.title;
          })


    //////////////////////////////////////////////////////////////////////
    /////////////////////////  STATE DROPDOWN  //////////////////////////
    //////////////////////////////////////////////////////////////////////

        // Create dropdown 1
        var Slist = d3.select("#states")
        Slist.append("select").selectAll("option")
            .data(nestedStates)
            .enter().append("option")
            .attr("value", function(d){
                return d.key;
            })
            .text(function(d){
                return d.key;
            })

    //////////////////////////////////////////////////////////////////////
    /////////////////////////  COUNTY DROPDOWN  //////////////////////////
    //////////////////////////////////////////////////////////////////////
 

          // define Clist (county list) as outer variable
          var ClistG = null;

          var updateCountyDrop = function(selectCounty){
              // Figure out which state is displayed
              var selectedState = Slist.select("select").property("value")

              // Filter for that state
              var selectedStateG = nestedStates.filter(function(d){
                  return d.key === selectedState;
              }); 

              console.log(selectedStateG)

              var selectedCounties = selectedStateG.map(function(d){
                return d.value.Counties;
              })

              var selectedCounties2 = selectedCounties[0].map(function(d){
                return d.key;
              })

              var Clist = d3.select("#counties")


              var selection = Clist.selectAll("select");
                if (selection.empty()) {
                  selection = Clist.append("select");
                }

              selection = selection.selectAll("option")
                  .data(selectedCounties2, function(d){
                    return d;
                  })

              selection.exit().remove();

              selection.enter().append("option")
                  .attr("value", function(d){
                    return countyMap.get(d).County;
                  })
                  .text(function(d){
                    return countyMap.get(d).County_Name;
                  })
                  .property("selected", function(d){
                  return +d === selectCounty; }) 

              ClistG = Clist; 
              
          }


    //////////////////////////////////////////////////////////////////////
    //////////////////////////  YEAR DROPDOWN  ///////////////////////////
    //////////////////////////////////////////////////////////////////////

        // Create dropdown 2 (year)
        var yList = d3.select("#year")
        yList.append("select").selectAll("option")
            .data(nested2)
            .enter().append("option")
            .attr("value", function(d){
              return d.key;
            })
            .text(function(d){
              return d.key;
            })
            .property("selected", function(d){ return d.key === "2015"; })

    //////////////////////////////////////////////////////////////////////
    //////////////////////////  EVENT DROPDOWN  //////////////////////////
    //////////////////////////////////////////////////////////////////////

                  var eListG = null;

                  // Defining an event selection function to be applied
                  // to all event icons
                  var eventSelection = function(eventType){
                      var eList = d3.select("#icon-dropdown")

                      var stormsOnly = eventNest.filter(function(d){
                        return d.key === eventType;
                      }) 

                      var selectedStorms = stormsOnly.map(function(d){
                        return d.value.Title;
                      })

                      var selectedStorms2 = selectedStorms[0].map(function(d){
                        return d.key;
                      })

                      var eSelection = eList.selectAll("select");
                        if (eSelection.empty()){
                          eSelection = eList.append("select")
                        }

                      eSelection = eSelection.selectAll("option")
                          .data(selectedStorms2, function(d){
                            return d;
                          })

                      eSelection.exit().remove();

                      eSelection.enter().append("option")
                          .attr("value", function(d){
                            return d;
                          })
                          .text(function(d){
                            return d;
                          })

                      eListG = eList;
                    }

                var stormsIcon = d3.select("#icon-storms")
                  .on('click', function(){
                     eventSelection("storms");
                  });

                var sportsIcon = d3.select("#icon-sports")
                  .on('click', function(){
                    eventSelection("sports");
                  });
  
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////  AXES  ////////////////////////////////
    //////////////////////////////////////////////////////////////////////

          var xaxis = svg.append("g")
                 .attr("transform", "translate(0," + height + ")")
                 .attr("class", "x axis")
                 .call(d3.axisBottom(x)
                    .ticks(d3.timeMonth)
                    .tickSize(0, 0)
                    .tickFormat(d3.timeFormat("%b"))
                    .tickSizeInner(0)
                    .tickPadding(10));

            // Add the Y Axis
             var yaxis = svg.append("g")
                 .attr("class", "y axis")
                 .call(d3.axisLeft(y)
                    .ticks(5)
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0, 0));


      //////////////////////////////////////////////////////////////////////
      ///////////////////// MULTI LINE COUNTY FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

          var multiCounty = function(data, countyCode, year){


              var county = data.filter(function(d){
                return +d.key == +countyCode;
              })

              var pickedCounty = svg.selectAll("g")
                      .data(county, function(d){
                        return d ? d.key : this.key;
                      })

              pickedCounty.exit().remove();

              var pickedCountyEnter = pickedCounty.enter()
                      .append("g")
                      .attr("class", "counties")
                      .each(function(d){
                        y.domain(d.value.extent)
                      });

                      console.log(pickedCountyEnter)
              var Paths = pickedCountyEnter.selectAll("path")
                      .data(function(d) {
                        return (d.value.years);
                      })


              var PathsEnter = Paths.enter()
                      .append("path")
                      .attr("d",function(d){
                        return valueLine(d.values);
                      })
                      .attr("class", "line");

                var initialLine = svg.selectAll(".line")
                    .filter(function(d){
                      return +d.key === +year;
                    })
                    .classed("selected", true)

                // Reset the State dropdown based on the state of selected county
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === countyMap.get(county[0].key).stateName;
                })

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")

                // Print which county has been selected (for updating county dropdown)
                selectedCounty = countyMap.get(county[0].key).County;

                // Update county dropdown
                updateCountyDrop(selectedCounty);

                pickedCounty = pickedCountyEnter
                  .merge(pickedCounty);

                 // Reset the State dropdown based on the state of selected county
                var yearSel = yList.selectAll("option")
                  .property("selected", function(d){
                    return +d.key === +year;
                  })

                  console.log(yearSel)


               ////////////  UPDATE X AXIS  ///////////

                var xAxis = d3.axisBottom(x)
                  .ticks(d3.timeMonth)
                  .ticks(d3.timeMonth)
                  .tickSize(0, 0)
                  .tickFormat(d3.timeFormat("%b"))
                  .tickSizeInner(0)
                  .tickPadding(10);

                svg.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .attr("class", "x axis")
                  .call(xAxis);

                // Update X Axis
                svg.select(".x")
                  .transition()
                  .duration(750)
                  .call(xAxis)


                ////////////  UPDATE Y AXIS  ///////////

                var yAxis = d3.axisLeft(y)
                    .ticks(5)
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0,0);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                // Update Y Axis
                svg.select(".y")
                  .transition()
                  .duration(5000)
                  .call(yAxis)

            };

      //////////////////////////////////////////////////////////////////////
      ////////////////////// MULTI LINE STATE FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

          var multiState = function(data, stateName, year){


              var state = data.filter(function(d){
                return d.key == stateName;
              })



              var pickedstate = svg.selectAll("g")
                      .data(state, function(d){
                        return d ? d.key : this.key;
                      })


              pickedstate.exit().remove();

              var pickedstateEnter = pickedstate.enter()
                      .append("g")
                      .attr("class", "counties")
                      .each(function(d){
                        y.domain(d.value.extent)
                      });

              var Paths = pickedstateEnter.selectAll("path")
                      .data(function(d) {
                        return (d.value.years);
                      })

              var PathsEnter = Paths.enter()
                      .append("path")
                      .attr("d",function(d){
                        return valueLineState(d.values);
                      })
                      .attr("class", "line");

                var initialLine = svg.selectAll(".line")
                    .filter(function(d){
                      return +d.key === +year;
                    })
                    .classed("selected", true)

                // Reset the State dropdown based on the state of selected state
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === state[0].key;
                })

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")


                // Print which county has been selected (for updating county dropdown)
                selectedCounty = stateMap.get(state[0].key).County;

                // Update county dropdown
                updateCountyDrop(selectedCounty);


                pickedstate = pickedstateEnter
                  .merge(pickedstate);


               ////////////  UPDATE X AXIS  ///////////

                var xAxis = d3.axisBottom(x)
                  .ticks(d3.timeMonth)
                  .ticks(d3.timeMonth)
                  .tickSize(0, 0)
                  .tickFormat(d3.timeFormat("%b"))
                  .tickSizeInner(0)
                  .tickPadding(10);

                svg.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .attr("class", "x axis")
                  .call(xAxis);

                // Update X Axis
                svg.select(".x")
                  .transition()
                  .duration(750)
                  .call(xAxis)


                ////////////  UPDATE Y AXIS  ///////////

                var yAxis = d3.axisLeft(y)
                    .ticks(5)
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0,0);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                // Update Y Axis
                svg.select(".y")
                  .transition()
                  .duration(5000)
                  .call(yAxis)

            };



      //////////////////////////////////////////////////////////////////////
      /////////////////////// BANDED COUNTY FUNCTION ///////////////////////
      //////////////////////////////////////////////////////////////////////

            var bandCounty = function(data, countyCode){

            ////////////  DATA JOIN FOR MEDIAN  ///////////
    
            // Filter data to only include selected county
            var selectACounty = data.filter(function(d){
              return +d.key === +countyCode;
            });

            // Group the county-level data
           var aCounty = svg.selectAll(".aCounty")
                .data(selectACounty, function(d){
                  return d ? d.key : this.key;
                });

            // Remove any lines that don't carry over between counties
            aCounty.exit().remove();

            y.domain([d3.min(selectACounty[0].values, function(d) {
              return +d.low
            }), 
            d3.max(selectACounty[0].values, function(d){ 
              return +d.high
            })]);

            ////////////  DATA JOIN FOR AREA  ///////////

              var areaFill = d3.area()
                // Same x axis (could use .x0 and .x1 to set different ones)
                .x(function(d) { return x(parseTimeMonth(d.month)); })
                .y0(function(d, i) { return y(+d.low); })
                .y1(function(d, i) { return y(+d.high); })
                .curve(d3.curveBasis);

                svg.selectAll(".area").remove();

              var areaEnter = aCounty.enter().append("path")
                //.datum(selectAvState)
                .attr("d", function(d){
                  return areaFill(d.values); })
                .attr("fill", "#B2C1E3")
                .attr("opacity", 0.8)
                .attr("class", "area");


              // Add Median Line (later so on top of area)
              var countyPathsEnter = aCounty.enter()
                .append("path")
                .attr("class", "line2")
                .attr("d", function(d){
                  return valueLineA(d.values);
                })

              // Reset the State dropdown based on the state of selected county
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === countyMap.get(selectACounty[0].key).stateName;
                })

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")

                console.log(selectedState)

                // Print which county has been selected (for updating county dropdown)
                selectedCounty = countyMap.get(selectACounty[0].key).County;
                console.log(selectedCounty)

                // Update county dropdown
                updateCountyDrop(selectedCounty);

                  ////////////  UPDATE Y AXIS  /////////// 

                  d3.select(".y")
                    .transition()
                    .duration(750)
                    .call(d3.axisLeft(y)
                      .ticks(5)
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));
            }


      //////////////////////////////////////////////////////////////////////
      /////////////////////// BANDED STATE FUNCTION ///////////////////////
      //////////////////////////////////////////////////////////////////////

            var bandState = function(data, stateName){

            ////////////  DATA JOIN FOR MEDIAN  ///////////
    
            // Filter data to only include selected State
            var state = data.filter(function(d){
              return d.key === stateName;
            });

            // Group the State-level data
           var aState = svg.selectAll(".aState")
                .data(state, function(d){
                  return d ? d.key : this.key;
                });

            // Remove any lines that don't carry over between counties
            aState.exit().remove();

            y.domain([d3.min(state[0].values, function(d) {
              return +d.low
            }), 
            d3.max(state[0].values, function(d){ 
              return +d.high
            })]);

            ////////////  DATA JOIN FOR AREA  ///////////

              var areaFill = d3.area()
                // Same x axis (could use .x0 and .x1 to set different ones)
                .x(function(d) { return x(parseTimeMonth(d.month)); })
                .y0(function(d, i) { return y(+d.low); })
                .y1(function(d, i) { return y(+d.high); })
                .curve(d3.curveBasis);

                svg.selectAll(".area").remove();

              var areaEnter = aState.enter().append("path")
                //.datum(selectAvState)
                .attr("d", function(d){
                  return areaFill(d.values); })
                .attr("fill", "#B2C1E3")
                .attr("opacity", 0.8)
                .attr("class", "area");


              // Add Median Line (later so on top of area)
              var StatePathsEnter = aState.enter()
                .append("path")
                .attr("class", "line2")
                .attr("d", function(d){
                  return valueLineA(d.values);
                })


               // Reset the State dropdown based on the state of selected state
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === state[0].key;
                })

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")

                // Print which county has been selected (for updating county dropdown)
                selectedCounty = stateMap.get(state[0].key).County;


                // Update county dropdown
                updateCountyDrop(selectedCounty);


                  ////////////  UPDATE Y AXIS  /////////// 

                  d3.select(".y")
                    .transition()
                    .duration(750)
                    .call(d3.axisLeft(y)
                      .ticks(5)
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));
            }

          ///////////////////////////  CALL TO INITIAL GRAPH  //////////////////////////

          // Call function to create initial figure
          // currently set to LA County
          //multiCounty(nested, 25025, 2005);
          //bandCounty(nestACounties, 6037)

          multiState(nestMStates, "Maine")
          bandState(nestAStates, "Maine")

          ///////////////////////////  STATE CHANGE  //////////////////////////

          Slist.on('change', function(){
            var selectedState = d3.select(this)
                .select("select")
                .property("value")

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")

                console.log(selectedState)

                svg.selectAll(".area").remove();


                ////////////  RUNNING UPDATE MULTI FUNCTION  ///////////  
                multiState(nestMStates, selectedState);

                /////////// RUNNING UPDATE BAND FUNCTION /////////
                bandState(nestAStates, selectedState);

                // Update county dropdown
                updateCountyDrop();

          });


          ///////////////////////////  COUNTY CHANGE  //////////////////////////

          ClistG.on('change', function(){

            ////////////  DETECTING SELECTED YEAR  ///////////  

              // Detecting what year is present on the year dropdown menu
              selectedYear = yList.select("select").property("value")


              svg.selectAll(".line2").remove()
              svg.selectAll(".area").remove()


              // Determine which county was selected from dropdown
              var selected = d3.select(this)
                  .select("select")
                  .property("value")

              ////////////  RUNNING UPDATE MULTI FUNCTION  /////////// 
              multiCounty(nested, selected, selectedYear)

              /////////// RUNNING UPDATE BAND FUNCTION /////////
              bandCounty(nestACounties, selected)
                  
          });


        ///////////////////////////  YEAR CHANGE  //////////////////////////

          // Select year from dropdown
          yList.on('change', function(){
            var selectedYear = d3.select(this)
                .select("select")
                .property("value")


            // select all paths and select one that the year matches
            var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedYear
              })
              // Set class to selected for matching line
              .classed("selected", true)
          })


        ///////////////////////////  EVENT CHANGE  //////////////////////////
                  
          d3.selectAll("#icon-dropdown")
            .on('change', function(){

              // Remove any banded graphics that may still be present
              svg.selectAll(".area").remove();

              // Determine which event was selected from dropdown
              var selected = d3.select(this)
                  .select("select")
                  .property("value")

              var selectedEvent = eventMap.get(selected).county

              var selectedCode = countyNameMap.get(selectedEvent).County

              var selectedYear = eventMap.get(selected).year



              ////////////  RUNNING UPDATE MULTI FUNCTION  /////////// 
              multiCounty(nested, selectedCode, selectedYear)

                  
          });


    //////////////////////////////////////////////////////////////////////
    //////////////////////////  SCROLLYTELLING  //////////////////////////
    //////////////////////////////////////////////////////////////////////

        var pinBubbleChart = new ScrollMagic.Scene({
      				// triggerElement: ".third-chart-wrapper",
      				triggerElement: "#container",
      				triggerHook:0,
      				offset: -300,
      				duration:600
      			})
      			.addIndicators({name: "pin chart"}) // add indicators (requires plugin)
      			.setPin("#graph", {pushFollowers: true})
      			.addTo(controller)
      			.on("enter",function(e){
      				if(e.target.controller().info("scrollDirection") == "REVERSE"){
      				};
      			})
      			.on("leave",function(e){
      				if(e.target.controller().info("scrollDirection") == "FORWARD"){
      				};
      			})
      			.on("progress", function (e) {
      				var progress = e.progress.toFixed(1);
      				if(e.target.controller().info("scrollDirection") == "REVERSE"){
      				}
      				else{
      				}
      			})
      			;



        var firstTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 0,
            duration:400
          })
          .addIndicators({name: "first trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{
                bandState(nestAStates, "Florida")

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
                bandState(nestAStates, "Maine");
            }
            else{
            }
          })
          ;

          var secondTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 400,
            duration:800
          })
          .addIndicators({name: "second trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{
                bandState(nestAStates, "Arizona")

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
                bandState(nestAStates, "Florida");
            }
            else{
            }
          })
          ;


    };