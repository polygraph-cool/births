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
    var parseMonthNum = d3.timeFormat("%m")



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

    // define the area
    var areaFill = d3.area()
      // Same x axis (could use .x0 and .x1 to set different ones)
      .x(function(d) { return x(parseTimeMonth(d.month)); })
      .y0(function(d, i) { return y(+d.low); })
      .y1(function(d, i) { return y(+d.high); })
      .curve(d3.curveCardinal);

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

    // Gradient (for event styling later)
    // Idea and code from Nadieh Bremer (https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html)
    //Append a defs (for definition) element to your SVG
    var defs = svg.append("defs");

    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    var gradientUpdate = function(months){

        svg.selectAll(".left").remove();
        svg.selectAll(".right").remove();

        var percent = d3.format(",%")

        var p1 = months[0]
        var p1N = parseMonthNum(parseTimeMonth(p1))
        var p1P = percent((p1N-1)/11)

        var p2 = months[1]
        var p2N = parseMonthNum(parseTimeMonth(p2))
        var p2P = percent((p2N-1)/11)

        linearGradient.append("stop")
            .attr("class", "left")
            .attr("offset", p1P)
            .attr("stop-color", "#7D93CA")

        linearGradient.append("stop")
            .attr("class", "left")
            .attr("offset", p1P)
            .attr("stop-color", "#EF445B")

        linearGradient.append("stop")
            .attr("class", "right")
            .attr("offset", p2P)
            .attr("stop-color", "#EF445B")

        linearGradient.append("stop")
            .attr("class", "right")
            .attr("offset", p2P)
            .attr("stop-color", "#7D93CA")
        }


    ///////////////////// VARIABLES FOR TRANSITIONS //////////////////////

            var areaFill = d3.area()
                // Same x axis (could use .x0 and .x1 to set different ones)
                .x(function(d) { return x(parseTimeMonth(d.month)); })
                .y0(function(d, i) { return y(+d.low); })
                .y1(function(d, i) { return y(+d.high); })
                .curve(d3.curveCardinal);



    //////////////////////////////////////////////////////////////////////
    ////////////////////////////  RESPONSIVE  ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    /*// make chart responsive
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
        .classed("svg-content-responsive", true);*/


    //////////////////////////////////////////////////////////////////////
    ////////////////////////////  TRANSITIONS ////////////////////////////
    //////////////////////////////////////////////////////////////////////

    var eachMulti = d3.transition()
        .delay(function(d, i) { return i * 500; })
        .duration(750)


    //////////////////////////////////////////////////////////////////////
    ////////////////////////////  DATA IMPORT ////////////////////////////
    //////////////////////////////////////////////////////////////////////


    // Queue multiple files
    d3.queue()
      .defer(d3.csv, "stateCountyNames.csv")
      .defer(d3.csv, "CondensedBirth3.csv")
      .defer(d3.csv, "stateData.csv")
      .defer(d3.csv, "stateAverages.csv")
      .defer(d3.csv, "countyAverages.csv")
      .await(ready);



    // Get the data
function ready(error,
    stateCounty,
    data,
    stateData,
    stateAverages,
    countyAverages) {

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

        // format state average data
        countyAverages.forEach(function(d){
          d.County = d.County;
          d.month = parseMonth(parseMonthOnly(d.M));
          d.median = +d.median;
          d.low = +d.low;
          d.high = +d.high;
          d.values = +d.median;
        })




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



    //////////////////////////////////////////////////////////////////////
    ////////////////////////  DEFINING EVENTS  ///////////////////////////
    //////////////////////////////////////////////////////////////////////

    var events = [
      {
        type: "sports",
        year: 2005,
        months: ["Jul", "Aug"],
        title: "Red Sox World Series Win",
        state: "Massachusetts",
        county: 25025,
        causeTitle: "Red Sox World Series Win",
        causelabel: "In October 2004, the Boston Red Sox won the World Series for the first time since 1918. Did fans' celebrations result in an increase in babies 9 months later?",
        causeX: 50,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Red Sox Babies?",
        resultlabel: "It doesn't look like it. The late summer of 2005 actually welcomed the fewest Boston babies.",
        resultdX: 0,
        resultdY: 50,
      },
      {
        type: "storms",
        year: 2013,
        months: ["Jul", "Aug"],
        title: "Hurricane Sandy",
        state: "New York",
        county: 36103,
        causeTitle: "Hurricane",
        causelabel: "When Hurricane Sandy hit the northeast US, around 8 million homes reportedly lost power. Did this cause a mini baby-boom 9 months later?",
        causeX: 50,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Hurricane Babies?",
        resultlabel: "Probably not. The number of babies born in the affected areas 9 months later was just a little low for early summer.",
        resultdX: 0,
        resultdY: -50,
      },
      {
        type: "storms",
        year: 2006,
        months: ["May", "Jun"],
        title: "Hurricane Katrina",
        state: "Louisiana",
        county: 22071,
        causeTitle: "Hurricane",
        causelabel: "When Hurricane Katrina hit New Orleans, ...",
        causeX: 50,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Hurricane Babies?",
        resultlabel: "It's hard to tell. This minor increase could be a result of increased conception during the storm or people slowly returning to the city.",
        resultdX: 0,
        resultdY: -100,
      },
      {
        type: "sports",
        year: 2014,
        months: ["Oct", "Nov"],
        title: "Seahawks Superbowl Win",
        state: "Washington",
        county: 53033,
        causeTitle: "Seahawks Superbowl Win",
        causelabel: "In 2013, the Seattle Seahawks won the Superbowl for the first time ever. Did celebrations cause more babies?",
        causeX: 20,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Superbowl Babies?",
        resultlabel: "Probably not. The number of babies in Seattle 9 months later was just about average for the mid-fall.",
        resultdX: -.005,
        resultdY: 150,
      },
      {
        type: "storms",
        year: 1996,
        months: ["Oct", "Nov"],
        title: "Blizzard of 1996",
        state: "Pennsylvania",
        county: 42101,
        causeTitle: "Blizzard of 1996",
        causelabel: "In 1996, Philadelphia was buried in nearly 30 inches of snow in less than 24 hours. Did they welcome an increase in children 9 months later?",
        causeX: 20,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Blizzard Babies?",
        resultlabel: "Probably not. The number of newborns seems to be about typical for early fall",
        resultdX: -.005,
        resultdY: 60,

      }

    ];

   /* var eventNest = d3.nest()
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
*/
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

              var selectedCounties = selectedStateG.map(function(d){
                return d.value.Counties;
              })

              var selectedCounties2 = selectedCounties[0].map(function(d){
                return d.key;
              })

              // Add an "All" option
              selectedCounties2.push("001")

              selectedCounties2.sort()
              console.log(selectedCounties2)


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
                    if (d == "001"){"All"} else {return countyMap.get(d).County;}
                  })
                  .text(function(d){
                    if (d != "001"){return countyMap.get(d).County_Name;} else {return "All Counties"}
                  })
                  .property("selected", function(d){
                    return d ===  selectCounty; 
                  })
                  .property("disabled", function(d){
                    return d == "NaN";
                  })

                  /*.property("selected", function(d){
                  return +d === selectCounty; })*/


                console.log(selection)


              ClistG = Clist; 
              
          }
    //////////////////////////////////////////////////////////////////////
    /////////////////////////  DATA VIEW TOGGLE  /////////////////////////
    //////////////////////////////////////////////////////////////////////

    var dataviewAvg = d3.select("#toggle.toggle")
      dataviewAvg.append("button")
      .text("Average")
      .attr("class", "toggle average")

    var dataviewYear = d3.select("#toggle.toggle")
      dataviewYear.append("button")
      .text("Annual")
      .attr("class", "toggle year")



    //////////////////////////////////////////////////////////////////////
    //////////////////////////  YEAR DROPDOWN  ///////////////////////////
    //////////////////////////////////////////////////////////////////////

        // Create dropdown (year)
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

            // By default, this list is hidden, and appears when "Annual" Data view is clicked
            d3.select("#dropdown-c").classed("hiddendd", true)


  
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
                    .ticks(5, "s")
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0, 0));

    //////////////////////////////////////////////////////////////////////
    ////////////////////////// EVENT ANNOTATIONS /////////////////////////
    //////////////////////////////////////////////////////////////////////

    var eventAnnotationCause = function(title, label, x, y, dy, dx){  
      const type = d3.annotationCustomType(
        d3.annotationCallout, 
        {"className":"custom",
          "note":{"lineType":"vertical"}})
      

      const annotations = [
        {
          note: {
            label: label,
            title: title,
          },
          x: x,
          y: y,
          dy: dy,
          dx: dx
        }]

        const makeAnnotations = d3.annotation()
          .textWrap(250)
          .notePadding(15)
          .type(type)
          .annotations(annotations)

        svg.append("g")
          .attr("class", "annotation-group")
          .call(makeAnnotations)

    }
          

    var eventAnnotationResult = function(title, label, month, births, dx, dy){

        var type = d3.annotationCustomType(
          d3.annotationCallout,
          {"className":"custom",
          "note":{"lineType":"vertical"}})

        var annotations = [
        {
          note:{
            label: label,
            title: title
          },
          data: { month: month, Births: births},
          dy: dy,
          dx: dx
        }]

        var makeAnnotations = d3.annotation()
          //.editMode(true)
          .textWrap(225)
          .notePadding(15)
          .type(type)
          .accessors({
            x: d => x(parseTimeMonth(d.month)),
            y: d => y(d.Births)
          })
          .accessorsInverse({
            month: d => parseMonth(x.invert(d.x)),
            Births: d => y.invert(d.y)
          })
          .annotations(annotations)

          svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)

  }

      //////////////////////////////////////////////////////////////////////
      ///////////////////////////// INITIAL GRAPH //////////////////////////
      //////////////////////////////////////////////////////////////////////

      
      // function creates all line and area elements
      // The rest of the figure, these elements will just be transitioned


      var initialGraph = function(stateName){

          //////////////   AREA GRAPH    ///////////////

            // Filter data to only include selected State
            var state = nestAStates.filter(function(d){
              return d.key === stateName;
            });

            // Group the State-level data
           var aState = svg.selectAll(".areas")
                .data(state, function(d){
                  return d ? d.key : this.key;
                });

            var aStateEnter = aState.enter()
                .append("g")
                .attr("class", "areas")


            y.domain([d3.min(state[0].values, function(d) {
              return +d.low
            }), 
            d3.max(state[0].values, function(d){ 
              return +d.high
            })]);

            ////////////  DATA JOIN FOR AREA  ///////////

              aStateEnter.append("path")
                //.datum(selectAvState)
                .attr("d", function(d){
                  return areaFill(d.values); })
                .attr("fill", "#E3C0DB")
                .attr("opacity", 0.8)
                .attr("class", "area");

              // Add Median Line (later so on top of area)
              var StatePathsEnter = aStateEnter
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


          /////////// LINE GRAPH /////////////

         var state = nestMStates.filter(function(d){
                return d.key == stateName;
              })


          var pickedstate = svg.selectAll(".counties")
                  .data(state, function(d){
                    return d ? d.key : this.key;
                  })

          var pickedstateEnter = pickedstate.enter()
                      .append("g")
                      .attr("class", "counties")
                      /*.each(function(d){
                        y.domain(d.value.extent)
                      });*/

          var Paths = pickedstateEnter.selectAll("path")
                      .data(function(d) {
                        return (d.value.years);
                      })

          // Initially plot annual lines on top of median line (to be moved later)

          AvgPath = valueLineA(StatePathsEnter._groups[0][0].__data__.values)

          console.log(valueLineA(StatePathsEnter._groups[0][0].__data__.values))

          var PathsEnter = Paths.enter()
                      .append("path")
                      .attr("class", "line")
                      .attr("d", AvgPath)
                      .attr("opacity", 0)

          d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

          // Set the "average" toggle to active
          d3.selectAll(".toggle.average").classed("active", true)

      }


      //////////////////////////////////////////////////////////////////////
      ////////////////////// STATE UPDATE AVG FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

      var stateUpdateAvg = function(stateName){

          var state = nestAStates.filter(function(d){
              return d.key === stateName;
            });

          // Print which county has been selected (for updating county dropdown)
          selectedCounty = stateMap.get(state[0].key).County;

          // Update county dropdown
          updateCountyDrop(selectedCounty);

            y.domain([d3.min(state[0].values, function(d) {
              return +d.low
            }), 
            d3.max(state[0].values, function(d){ 
              return +d.high
            })]);

            // Update paths
            svg.selectAll("path.area")
                .data(state)  
                .transition()  
                .delay(400)
                .duration(1200) 
                .attr("d", function(d){
                    return areaFill(d.values); })
                .attr("opacity", 0.8)

            var medPath = svg.selectAll(".line2")
                .data(state)
                .transition()
                .delay(400)
                .duration(1200)
                .attr("d", function(d){
                    return valueLineA(d.values);
                  })
                .attr("opacity", 0.8)

            // Accessing path information from median line
            var medPathD = medPath._groups[0][0].__data__.values

            // Currently have other lines follow the median line
            svg.selectAll("path.line")
                .transition()
                  .delay(function(d, i){ return i * 25; })
                  .duration(800)
                  .attr("d", function(d){
                      return valueLineA(medPathD);
                    })
                  .attr("opacity", 0)

            // Update Y Axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

      }

      //////////////////////////////////////////////////////////////////////
      ///////////////////// STATE UPDATE YEAR FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

      var stateUpdateYear = function(selectedState){

          // Find the selected state
          var selectedState = Slist.select("select").property("value")

          // Find the selected year
          var selectedYear = yList.select("select").property("value")

          var state = nestMStates.filter(function(d){
              return d.key === selectedState;
            });


          // Print which county has been selected (for updating county dropdown)
          selectedCounty = stateMap.get(state[0].key).County;

          // Update county dropdown
          updateCountyDrop(selectedCounty);

            // Update paths
            svg.selectAll("path.area")  
                .transition()  
                .duration(1000) 
                .attr("opacity", 0)

            svg.selectAll(".line2")
              .attr("opacity", 1)
              .transition()
                .duration(1000)
                .attr("opacity", 0)

            // update domain
           var gData = svg.selectAll(".counties")
              .data(state)
              .each(function(d){
                  y.domain(d.value.extent)
                });


            // Move paths from the median line to proper locations
              gData.selectAll("path.line")
                .data(function(d){
                  return (d.value.years);
                })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLineState(d.values)
                  })
                  .attr("opacity", 1)


            // Update Y Axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

      }



      //////////////////////////////////////////////////////////////////////
      ////////////////////// COUNTY UPDATE AVG FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

      var countyUpdateAvg = function(countyCode){

        var county = nestACounties.filter(function(d){
              return +d.key === +countyCode;
            });


            y.domain([d3.min(county[0].values, function(d) {
              return +d.low
            }), 
            d3.max(county[0].values, function(d){ 
              return +d.high
            })]);

            // Update paths
            svg.selectAll("path.area")
                .data(county)  
                .transition()  
                .delay(400)
                .duration(1200) 
                .attr("d", function(d){
                    return areaFill(d.values); })
                .attr("opacity", 0.8)

            var medPath = svg.selectAll(".line2")
                .data(county)
                .transition()
                .delay(400)
                .duration(1200)
                .attr("d", function(d){
                    return valueLineA(d.values);
                  })
                .attr("opacity", 0.8)

            // Accessing path information from median line
            var medPathD = medPath._groups[0][0].__data__.values

            // Currently have other lines follow the median line
            svg.selectAll("path.line")
                .transition()
                  .delay(function(d, i){ return i * 25; })
                  .duration(800)
                  .attr("d", function(d){
                      return valueLineA(medPathD);
                    })
                  .attr("opacity", 0)

            // Update Y Axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

      }

      //////////////////////////////////////////////////////////////////////
      ///////////////////// COUNTY UPDATE YEAR FUNCTION ////////////////////
      //////////////////////////////////////////////////////////////////////

      var countyUpdateYear = function(countyCode){

          // Find the selected state
          var selectedState = Slist.select("select").property("value")

          // Find the selected year
          var selectedYear = yList.select("select").property("value")

          var county = nested.filter(function(d){
              return +d.key === +countyCode;
            });


            // Update paths
            svg.selectAll("path.area")  
                .transition()  
                .duration(1000) 
                .attr("opacity", 0)

            svg.selectAll(".line2")
              .attr("opacity", 1)
              .transition()
                .duration(1000)
                .attr("opacity", 0)

            // update domain
           var gData = svg.selectAll(".counties")
              .data(county)
              .each(function(d){
                  y.domain(d.value.extent)
                });

            // Move paths from the median line to proper locations
              gData.selectAll("path.line")
                .data(function(d){
                  return (d.value.years);
                })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLine(d.values)
                  })
                  .attr("opacity", 1)

            // Update Y Axis
            d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

      }











      //////////////////////////////////////////////////////////////////////
      /////////////////////// BANDED COUNTY FUNCTION ///////////////////////
      //////////////////////////////////////////////////////////////////////

            AvgLine = null;

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

            /*y.domain([d3.min(selectACounty[0].values, function(d) {
              return +d.low
            }), 
            d3.max(selectACounty[0].values, function(d){ 
              return +d.high
            })]);*/

            ////////////  DATA JOIN FOR AREA  ///////////



                svg.selectAll(".area").remove();
                svg.selectAll(".line2").remove();

              var areaEnter = aCounty.enter().append("path")
                //.datum(selectAvState)
                .attr("d", function(d){
                  return areaFill(d.values); })
                .attr("fill", "#E3C0DB")
                .attr("opacity", 0)
                .attr("class", "area");


              // Add Median Line (later so on top of area)
              var countyPathsEnter = aCounty.enter()
                .append("path")
                .attr("class", "line2")
                .attr("d", function(d){
                  return valueLineA(d.values);
                })

               AvgLine = countyPathsEnter;

              // Reset the State dropdown based on the state of selected county
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === countyMap.get(selectACounty[0].key).stateName;
                })

                // Print which state has been selected (for updating county dropdown)
                selectedState = Slist.select("select").property("value")

                // Print which county has been selected (for updating county dropdown)
                selectedCounty = countyMap.get(selectACounty[0].key).County;

                // Update county dropdown
                updateCountyDrop(selectedCounty);


                  ////////////  UPDATE Y AXIS  /////////// 

                 /* d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));*/
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
                .curve(d3.curveCardinal);

                svg.selectAll(".area").remove();
                svg.selectAll(".line2").remove();

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
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));
            }


      //////////////////////////////////////////////////////////////////////
      ///////////////////// MULTI LINE COUNTY FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

        /* var yearLines = null;

          var multiCounty = function(data, countyCode, year, transition){


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

                      console.log(Paths)

        var average = d3.selectAll(".line2")

        AvgPath = valueLineA(average._groups[0][0].__data__.values)


              var PathsEnter = Paths.enter()
                      .append("path")
                      //.attr("d", AvgPath)
                      .transition()
                            .delay(function(d, i){ return i * 50; })
                            .duration(400)
                      .attr("d", function(d) { return valueLine(d.values)})
                      .attr("class", "line")

              yearLines = PathsEnter;


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
                  .duration(5000)
                  .call(xAxis)


                ////////////  UPDATE Y AXIS  ///////////

                var yAxis = d3.axisLeft(y)
                    .ticks(5, "s")
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0,0);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                // Update Y Axis
                svg.select(".y")
                  .transition()
                  .duration(1500)
                  .call(yAxis)

            };*/

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
                  .duration(1500)
                  .call(xAxis)


                ////////////  UPDATE Y AXIS  ///////////

                var yAxis = d3.axisLeft(y)
                    .ticks(5, "s")
                    .tickSizeInner(0)
                    .tickPadding(6)
                    .tickSize(0,0);

                svg.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

                // Update Y Axis
                svg.select(".y")
                  .transition()
                  .duration(1500)
                  .call(yAxis)

            };




      //////////////////////////////////////////////////////////////////////
      ///////////////////// TRANSITION TO AVG FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////


      var avgTransition = function(){
        console.log(AvgLine)

        AvgPath = valueLineA(AvgLine._groups[0][0].__data__.values)

          var t;
          d3.selectAll(".line")
          .transition()
            .delay(function(d, i) { return i * 50; })
              .duration(400)
              .attr("d", AvgPath)

          d3.selectAll(".area")
            .transition()
            .delay(800)
            .duration(1000)
            .attr("opacity", 0.8)

          d3.selectAll(".line2")
            .transition()
            .delay(800)
            .duration(1000)
            .attr("opacity", 1)

      }

      //////////////////////////////////////////////////////////////////////
      /////////////////// TRANSITION TO YEARLY FUNCTION ////////////////////
      //////////////////////////////////////////////////////////////////////

      var yearTransition = function(){
        
        d3.selectAll(".line")
          .transition()
          .delay(function(d, i){ return i * 50})
          .attr("d", function(d, i){ return valueLine(yearLines._groups[0][i].__data__.values )})

        d3.selectAll(".line2")
          .transition()
            .duration(500)
            .attr("opacity", 0)

        d3.selectAll(".area")
          .transition()
            .duration(500)
            .attr("opacity", 0)

      }



          ///////////////////////////  CALL TO INITIAL GRAPH  //////////////////////////

          // Call function to create initial figure
          // currently set to LA County
          //multiCounty(nested, 25025, 2005);
          //bandCounty(nestACounties, 6037)

         // multiState(nestMStates, "Maine")
          //bandState(nestAStates, "Maine")
          /*d3.selectAll(".line").classed("hidden", true)
          d3.select(".toggle.average").classed("active", true)
          d3.select(".toggle.year").classed("active", false)*/

          initialGraph("Maine")

          ///////////////////////////  STATE CHANGE  //////////////////////////

          Slist.on('change', function(){
            var selectedState = d3.select(this)
                .select("select")
                .property("value")


                if(d3.selectAll(".toggle.average").classed("active") == true){
                  // If Average is toggled, then run avg update function
                  stateUpdateAvg(selectedState);
                } else {
                  stateUpdateYear();
                }

              

                /*/////////// RUNNING UPDATE BAND FUNCTION /////////
                bandState(nestAStates, selectedState);

                ////////////  RUNNING UPDATE MULTI FUNCTION  ///////////  
                multiState(nestMStates, selectedState);

                if(d3.selectAll(".toggle.average").classed("active") == true){
                    d3.selectAll(".line").classed("hidden", true)
                    d3.selectAll(".area").classed("hidden", false)
                    d3.selectAll(".line2").classed("hidden", false)
                } else {
                    d3.selectAll(".area").classed("hidden", true);
                    d3.selectAll(".line2").classed("hidden", true);
                    d3.selectAll(".line").classed("hidden", false)
                }*/


          });


          ///////////////////////////  COUNTY CHANGE  //////////////////////////

          ClistG.on('change', function(){

            ////////////  DETECTING SELECTED YEAR  ///////////  

              // Detecting what year is present on the year dropdown menu
              selectedYear = yList.select("select").property("value")

              var selected = d3.select(this)
                  .select("select")
                  .property("value")


              // Determine which county was selected from dropdown

                if(d3.select(this).select("select").property("value") == "All Counties"){

                  // If "All Counties" is selected, draw state-level chart


                  if (d3.selectAll(".toggle.average").classed("active") == true) {

                    stateUpdateAvg(selectedState);

                  } else {

                    ////////////  RUNNING UPDATE MULTI FUNCTION  ///////////  
                    stateUpdateYear();

                  }

              } else {

                // if any county other than "All Counties" is selected, draw county-level

                if (d3.selectAll(".toggle.average").classed("active") == true){

                     countyUpdateAvg(selected);

                } else {

                    countyUpdateYear(selected);
              }

            }
                  
          });


        ///////////////////////  AVERAGE TOGGLE CHANGE  /////////////////////

        d3.selectAll(".toggle.average")
          .on('click', function(){

              var selectedState = Slist.select("select").property("value")

              var selectedCounty = ClistG.select("select").property("value")

              if(selectedCounty == "All Counties"){

                // if "All Counties" is selected then generate state average line
                  stateUpdateAvg(selectedState);

              } else {

                // if any other county selected then generate county average line
                  countyUpdateAvg(selectedCounty)

              }


            d3.select("#dropdown-c").classed("hiddendd", true)

          d3.selectAll(".toggle.average").classed("active", true)
          d3.selectAll(".toggle.year").classed("active", false)

          /*d3.selectAll(".line").classed("hidden", true)
          d3.selectAll(".area").classed("hidden", false)
          d3.selectAll(".line2").classed("hidden", false)*/

        })


        ///////////////////////  YEARLY TOGGLE CHANGE  /////////////////////

        d3.selectAll(".toggle.year")
          .on('click', function(){

              var selectedState = Slist.select("select").property("value")

              var selectedCounty = ClistG.select("select").property("value")


            if(selectedCounty == "All Counties"){

                // if "All Counties" is selected then generate state average line
                  stateUpdateYear(selectedState);
                  console.log("state update ran!")

              } else {

                // if any other county selected then generate county average line
                  countyUpdateYear(selectedCounty)
                  console.log("county update ran!")

              }

          d3.select("#dropdown-c").classed("hiddendd", false)

          d3.selectAll(".toggle.average").classed("active", false)
          d3.selectAll(".toggle.year").classed("active", true)

          /*d3.selectAll(".area").classed("hidden", true)
          d3.selectAll(".line2").classed("hidden", true)
          d3.selectAll(".line").classed("hidden", false)*/


        })




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
                  

            var eventDisplay = function(eventName){

              // Remove any banded graphics that may still be present
              svg.selectAll(".area").remove();
              svg.selectAll(".line2").remove();

              // Determine which event was selected from dropdown
              var selected = eventName

              console.log(selected)

              // Determine the county of the selected event
              var selectedEvent = eventMap.get(eventName).county

              console.log(selectedEvent)

              // Determine the year of the selected event's births
              var selectedYear = eventMap.get(selected).year

              // Determine the months of the selected event's births
              var selectedMonths = eventMap.get(selected).months

              // Unhide year list
              d3.select("#dropdown-c").classed("hiddendd", false)


              ////////////  RUNNING UPDATE BAND FUNCTION  /////////// 
              bandCounty(nestACounties, selectedEvent)
              // and hiding the new elements (in case people toggle the data view)
              d3.selectAll(".area").classed("hidden", true)
              d3.selectAll(".line2").classed("hidden", true)

              ////////////  RUNNING UPDATE MULTI FUNCTION  /////////// 
              multiCounty(nested, selectedEvent, selectedYear)

              var selectedLine = d3.selectAll(".selected")

              var selectedLineData = selectedLine._groups[0][0].__data__.values

              // Create a map based on selected line data
              var eventMonthMap = d3.map(selectedLineData, function(d){
                return d.month;
              })

              // Generate array of data for only the two months necessary
              var selectedMonthsArray = [eventMonthMap.get(selectedMonths[0]), eventMonthMap.get(selectedMonths[1])]

              // Add circles to lines
              var circle = svg.append("g").selectAll("circle")
                .data(selectedMonthsArray, function(d){ return d.values; })
                .enter()
                .append("circle")
                .attr("r", 8)
                .attr("cx", function(d){ return x(parseTimeMonth(d.month))})
                .attr("cy", function(d){ return y(d.Births)})
                .attr("fill", "#EF445B")
                .attr("stroke", "#FFFFFF")
                .attr("stroke-width", 3)

              circle.exit().remove();

              // update gradient for line
              gradientUpdate(selectedMonths);

              var selectedGradient = d3.selectAll(".selected")
                  .classed("selected-event", true)

              // pull variables needed for annotations

              var selectedCauseTitle = eventMap.get(selected).causeTitle

              var selectedCauseLabel = eventMap.get(selected).causelabel

              var selectedX = eventMap.get(selected).causeX

              var selectedY = eventMap.get(selected).causeY

              var selecteddX = eventMap.get(selected).causedX

              var selecteddY = eventMap.get(selected).causedY

              eventAnnotationCause(selectedCauseTitle, selectedCauseLabel, selectedX, selectedY, selecteddX, selecteddY)
                  
              var selectedResultitle = eventMap.get(selected).resultTitle

              var selectedResultLabel = eventMap.get(selected).resultlabel

              var selectedRdX = eventMap.get(selected).resultdX

              var selectedRdY = eventMap.get(selected).resultdY

              var selectedRMonth = eventMonthMap.get(selectedMonths[0]).month

              var selectedRBirths = eventMonthMap.get(selectedMonths[0]).Births

              eventAnnotationResult(selectedResultitle, selectedResultLabel, selectedRMonth, selectedRBirths, selectedRdX, selectedRdY)

              d3.select(".toggle.year").classed("active", true)
              d3.select(".toggle.average").classed("active", false)
        }


        d3.select("#icon-storms")
          .on("click", function(){
            eventDisplay("Hurricane Sandy");
            d3.selectAll("icons")
              .classed("selected", false)
            d3.select("#icon-a")
              .classed("selected", true)
          })

        d3.select("#icon-hurricane")
          .on("click", function(){
            eventDisplay("Hurricane Katrina")
          })

        d3.select("#icon-snow")
          .on("click", function(){
            eventDisplay("Blizzard of 1996")
          })

        d3.select("#icon-football")
          .on("click", function(){
            eventDisplay("Seahawks Superbowl Win")
          })

        d3.select("#icon-baseball")
          .on("click", function(){
            eventDisplay("Red Sox World Series Win")
          })



    //////////////////////////////////////////////////////////////////////
    //////////////////////////  SCROLLYTELLING  //////////////////////////
    //////////////////////////////////////////////////////////////////////

        var pinBubbleChart = new ScrollMagic.Scene({
      				// triggerElement: ".third-chart-wrapper",
      				triggerElement: "#container",
      				triggerHook:0,
      				offset: -100,
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
                multiState(nestMStates, "Florida")
                bandState(nestAStates, "Florida")
                d3.selectAll(".line").classed("hidden", true)
                d3.select(".toggle.average").classed("active", true)
                d3.select(".toggle.year").classed("active", false)

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
                multiState(nestMStates, "Maine")
                bandState(nestAStates, "Maine");
                d3.selectAll(".line").classed("hidden", true)
                d3.select(".toggle.average").classed("active", true)
                d3.select(".toggle.year").classed("active", false)
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