//initilize scrollmagic
    var controller = new ScrollMagic.Controller();


    //////////////////////////////////////////////////////////////////////
    /////////////////////////  GLOBAL VARIABLES  /////////////////////////
    //////////////////////////////////////////////////////////////////////

    // App holder for keeping global scope clean
    DS = {}

    // set the dimensions and margins of the graph
    var margin = {top: 60, right: 80, bottom: 20, left: 50},
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
              .curve(d3.curveStep);
        ;

    // define the line
    var valueLineState = d3.line()
        .x(function(d) { return x(parseTimeMonth(d.month)); })
        .y(function(d) { return y(+d.stateBirths); })
              .curve(d3.curveStep);
        ;

    // define the line
    var valueLineA = d3.line()
        .x(function(d) { return x(parseTimeMonth(d.month)); })
        .y(function(d) { return y(+d.median); })
              .curve(d3.curveStep);
        ;

    // define the area
    var areaFill = d3.area()
      // Same x axis (could use .x0 and .x1 to set different ones)
      .x(function(d) { return x(parseTimeMonth(d.month)); })
      .y0(function(d, i) { return y(+d.low); })
      .y1(function(d, i) { return y(+d.high); })
      .curve(d3.curveStep);

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
                .curve(d3.curveStep);




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
    ////////////////////////////  DATA IMPORT ////////////////////////////
    //////////////////////////////////////////////////////////////////////


    // Queue multiple files
    d3.queue()
      .defer(d3.csv, "stateCountyNames.csv")
      .defer(d3.csv, "CondensedBirth4.csv")
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
            d.Births = +d.Births;
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

      },
      {
        type: "terror",
        year: 1996,
        months: ["Jan", "Feb"],
        title: "Oklahoma City Bombing",
        state: "Oklahoma",
        county: 40109,
        causeTitle: "Oklahoma City Bombing",
        causelabel: "In 1995, Oklahoma City was home to a domestic terror attack. Did residents respond to the violence with a population increase?",
        causeX: 20,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Extra Babies?",
        resultlabel: "It doesn't look like it. While the early months tend to have low birth counts in this area, 9 months after the attack saw the lowest.",
        resultdX: 0,
        resultdY: -90,
      },
      {
        type: "other",
        year: 2014,
        months: ["Apr", "May"],
        title: "Detroit Bankruptcy",
        state: "Michigan",
        county: 26163,
        causeTitle: "Detroit Bankruptcy",
        causelabel: "In July 2013, the city of Detroit filed for bankruptcy. Did this impact the number of babies born in the city 9 months later?",
        causeX: 20,
        causeY: -20,
        causedX: 0,
        causedY: 0,
        resultTitle: "Bankruptcy Babies?",
        resultlabel: "It's hard to tell. 2013 was a low year for Detroit births in general.",
        resultdX: 0,
        resultdY: -90,
      }

    ];


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
              // Setting "All Counties" to default
                  if (selectCounty === undefined) {
                    console.log("selectCounty was undefined")
                      selectCounty == "All";
                  } else { console.log("selectCounty was defined")}

              // Figure out which state is displayed
              var selectedState = Slist.select("select").property("value")

              console.log(selectedState)

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

              var Clist = d3.select("#counties")

              var selection = Clist.selectAll("select");
                if (selection.empty()) {
                  selection = Clist.append("select");
                }

              selection = selection.selectAll("option")
                  .data(selectedCounties2, function(d){
                    return d;
                  })

              console.log(selection)

              selection.exit().remove();

              selection.enter().append("option")
                  .property("value", function(d){
                    if (d != "001"){return countyMap.get(d).County;} else { return 001}
                  })
                  .text(function(d){
                    if (d != "001"){return countyMap.get(d).County_Name;} else {return "All Counties"}
                  })
                  .property("disabled", function(d){
                    return d == "NaN";
                  })
                  
                  console.log(Clist.selectAll("option"))
                  console.log(selection)
                  console.log(Slist.selectAll("option"))

              // Setting selected property equal to the selected county
                Clist.selectAll("option")
                  .property("selected", function(d){
                    return +d == +selectCounty; 
                  })

                  var property = Clist.select("select").property("value")

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

            svg.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - margin.left)
                  .attr("x", 0 - (height / 2))
                  .attr("dy", "1em")
                  .style("text-anchor", "middle")
                  .text("Babies Born per Month")
                  .attr("class", "y axis label");      

    //////////////////////////////////////////////////////////////////////
    ////////////////////////// EVENT ANNOTATIONS /////////////////////////
    //////////////////////////////////////////////////////////////////////

    var eventAnnotationCause = function(title, label, x, y, dy, dx){  
      var type = d3.annotationCustomType(
        d3.annotationCallout, 
        {"className":"custom",
          "note":{"lineType":"vertical"}})
      

      var annotations = [
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

        var makeAnnotations = d3.annotation()
          .textWrap(250)
          .notePadding(15)
          .type(type)
          .annotations(annotations)

        svg.append("g")
          .attr("class", "annotation-group-cause")
          .call(makeAnnotations)

        svg.selectAll(".annotation-group-cause")
          .attr("opacity", 0)
          .transition()
            .duration(800)
            .attr("opacity", 1)
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
            .attr("class", "annotation-group-result")
            .call(makeAnnotations)

        svg.selectAll(".annotation-group-result g.annotation-note-content")
          .attr("opacity", 0)
          .transition()
            .delay(3000)
            .duration(3000)
            .attr("opacity", 1)

        var annotationPath = svg.selectAll(".annotation-group-result path.connector")

        var totalLength = annotationPath.node().getTotalLength()

        annotationPath
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .delay(3000)
            .duration(totalLength * 3)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        console.log(annotationPath.node().getTotalLength())

        console.log(y(births))


        var notePath = svg.selectAll(".annotation-group-result path.note-line")
        var totalLengthNote = notePath.node().getTotalLength()

       
       if (dy > 0){

        notePath
          .attr("stroke-dasharray", totalLengthNote + " " + totalLengthNote)
          .attr("stroke-dashoffset", totalLengthNote)
          .transition()
            .delay((totalLength * 3) + 3000)
            .duration(totalLengthNote * 3)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)

        } else {

        notePath
          .attr("stroke-dasharray", totalLengthNote + " " + totalLengthNote)
          .attr("stroke-dashoffset", -totalLengthNote)
          .transition()
            .delay((totalLength * 3) + 3000)
            .duration(totalLengthNote * 3)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
        }



  }


  //////////////////////////////////////////////////////////////////////
    ////////////////////////// AVERAGE ANNOTATIONS ///////////////////////
    //////////////////////////////////////////////////////////////////////

      var IQRAnnotation = function(high){  
      var type = d3.annotationCustomType(
          d3.annotationCallout,
          {"className":"custom",
          "connector":{"end":"dot"},
          "note":{"lineType":"vertical"}})
      

      var annotations = [
        {
          note: {
            label: "50% of the data falls within this pink area",
            title: "Inter-Quartile Range",
          },
          data: { month: "Feb", high: high},
          //x: 20,
          //y: -20,
          dy: -(y(high) + 5),
          dx: 0,
        }]

        console.log(x(parseTimeMonth("Dec")))

        var makeAnnotations = d3.annotation()
          //.editMode(true)
          .textWrap(250)
          .notePadding(10)
          .type(type)
          .accessors({
            x: d => x(parseTimeMonth(d.month)),
            y: d => y(d.high)
          })
          .accessorsInverse({
            month: d => parseMonth(x.invert(d.x)),
            Births: d => y.invert(d.y)
          })
          .annotations(annotations)

          console.log("Annotations made!")

        svg.append("g")
          .attr("class", "annotation-group-average")
          .call(makeAnnotations)



        svg.selectAll(".annotation-group-average")
          .attr("opacity", 0)
          .transition()
            .duration(2000)
            .attr("opacity", 1)

    }



      //////////////////////////////////////////////////////////////////////
      ///////////////////////////// INITIAL GRAPH //////////////////////////
      //////////////////////////////////////////////////////////////////////

      
      // function creates all line and area elements
      // The rest of the figure, these elements will just be transitioned


      var initialGraph = function(countyCode){

          /////////// LINE GRAPH /////////////

         var county = nested.filter(function(d){
                return +d.key == +countyCode;
              })


          var pickedCounty = svg.selectAll(".counties")
                  .data(county, function(d){
                    return d ? d.key : this.key;
                  })

          var pickedCountyEnter = pickedCounty.enter()
                      .append("g")
                      .attr("class", "counties")
                      .each(function(d){
                        y.domain(d.value.extent)
                      });

          var Paths = pickedCountyEnter.selectAll("path")
                      .data(function(d) {
                        return (d.value.years);
                      })


          // Plot all lines in appropriate places

          var PathsEnter = Paths.enter()
                      .append("path")
                      .attr("d", function(d){
                          d.line = this;
                          return valueLine(d.values)
                      })
                      .attr("opacity", 0.6)
                      // Setting individual classes for each line (for voronoi)
                      .attr("class", function(d,i) { return "line " + d.key; })



          //////////////   AREA GRAPH    ///////////////

            // Filter data to only include selected county
            var countyArea = nestACounties.filter(function(d){
              return +d.key === +countyCode;
            });


            // Group the county-level data
           var aCounty = svg.selectAll(".areas")
                .data(countyArea, function(d){
                  return d ? d.key : this.key;
                });

            var aCountyEnter = aCounty.enter()
                .append("g")
                .attr("class", "areas")

            ////////////  DATA JOIN FOR AREA  ///////////

            // Generate path and median line but set opacity to 0

              aCountyEnter.append("path")
                .attr("d", function(d){
                  return areaFill(d.values); })
                .attr("fill", "#E3C0DB")
                .attr("opacity", 0)
                .attr("class", "area");

              // Add Median Line (later so on top of area)
              var countyPathsEnter = aCountyEnter
                .append("path")
                .attr("class", "line2")
                .attr("d", function(d){
                  return valueLineA(d.values);
                })
                .attr("opacity", 0)


               // Reset the State dropdown based on the state of selected state
                var stateDrop = Slist.selectAll("option")
                  .property("selected", function(d){
                  return d.key === countyMap.get(county[0].key).stateName;
                })

            //////////// UPDATING CHART TITLE ///////////

            var sample = d3.select("#sample")
                .append("text")
                .text("Monthly")

            var sample = d3.select("#countyName")
                .append("text")
                .text(countyMap.get(county[0].key).County_Name + " County")

            var state = d3.select("#stateName")
                .append("text")
                .text(countyMap.get(county[0].key).stateName)



            //////////// ADDING LABEL TO END OF LINES ///////////
              var labelsEnter = pickedCounty.enter()
                      .append("g")
                      .attr("class", "labels")

              var PathText = labelsEnter.selectAll("text")
                .data(function(d) {
                        return (d.value.years);
                      }, function(d){
                        return d.key
                      })

                var LabelText = PathText.enter()
                .append("text") 
                .attr("transform", function(d) { return "translate(" + x(parseTimeMonth(d.values[11].month)) + "," + y(d.values[11].Births) + ")"; })
                .attr("x", 3)
                .attr("dy", "0.35em")
                .text(function(d) { return d.key; })
                .classed("text-labels", true)
                .attr("opacity", 0)

                var MedianLabel = aCounty.enter()
                  .append("g")
                  .attr("class", "areas")

                // Adding special label for median line
                var MedianText = MedianLabel
                .append("text")
                .attr("class", "medianLabel")
                .attr("transform", function(d) { return "translate(" + (width + 8) + "," + y(d.values[11].median) + ")"; })
                .text("Average")

                svg.selectAll("medianLabel-showing")
                  .classed("showing", false)
                //.lower();


            ////////////  ADDING VORONOI  ///////////


            // Adding Voronoi
            // Code examples from Nadieh Bremer (https://www.visualcinnamon.com/2015/07/voronoi.html)
            // and Mike Bostock (https://bl.ocks.org/mbostock/8033015)

            var voronoiData = county[0].value.years

            var voronoi = d3.voronoi()
              .x(function(d) { return x(parseTimeMonth(d.month)); })
              .y(function(d) { return y(+d.Births); })
              .extent([[0, 0], [width, height]]);

            var voronoiGroup = svg.append("g").attr("class", "voronoi");


            voronoiGroup.exit().remove();


            //Create the Voronoi grid
            voronoiGroup.selectAll("path")
              .data(voronoi.polygons(d3.merge(voronoiData.map(function(d) { return d.values; }))))
              .enter().append("path")
              .attr("class", "voronoi")
              .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
              //.style("stroke", "#2074A0") //If you want to look at the cells
              .style("fill", "none")
              .style("pointer-events", "all")
              .on("mouseover", function(d) {
                // determine the year of the polygon being hovered
                var yearSelected = d.data.year;

                // select annual lines
                d3.selectAll(".line").classed("hovered",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
                d3.selectAll(".text-labels").classed("showing",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
              })
              .on("click", function(d){

                // remove remnants from event annotations
                svg.selectAll(".annotation-group-result").remove();
                svg.selectAll(".annotation-group-cause").remove();
                svg.selectAll(".annotation-group-average").remove();
                svg.selectAll("circle").remove();
                d3.selectAll(".icons").classed("current", false)

                var yearSelected = d.data.year;
                // de-select other lines
                d3.selectAll(".line").classed("selected", false)
                d3.selectAll(".line").classed("selected-event", false)

                // de-select other labels
                d3.selectAll(".text-labels").classed("event-show", false)

                // select annual lines
                d3.selectAll(".line").classed("selected", function(d){
                  if(d.key == +yearSelected){
                    return true
                  }
                  return false;
                })

                // Bring selected line to top
                d3.selectAll(".selected").raise();

                // reset year dropdown to reflect clicked year
                var yearSel = yList.selectAll("option")
                  .property("selected", function(d){
                    return +d.key === +yearSelected;
                  })

                var year = yList.select("select").property("value")
                console.log(year)

                d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +year){
                    return true;
                  }
                  return false;
                })

              })
              .on("mouseout", function(d){
                  d3.selectAll(".line").classed("hovered", false)
                  d3.selectAll(".text-labels").classed("showing", false)
              })
            


          d3.select(".y")
                    .transition()
                    .duration(1500)
                    .call(d3.axisLeft(y)
                      .ticks(5, "s")
                      .tickSizeInner(0)
                      .tickPadding(6)
                      .tickSize(0, 0));

          // Set the "average" toggle to active
          d3.selectAll(".toggle.year").classed("active", true)

          updateCountyDrop(countyCode)





      }


      //////////////////////////////////////////////////////////////////////
      ////////////////////// STATE UPDATE AVG FUNCTION /////////////////////
      //////////////////////////////////////////////////////////////////////

      var stateUpdateAvg = function(stateName){

              // Remove any remnants from previous event
              svg.selectAll(".annotation-group-result").remove();
              svg.selectAll(".annotation-group-cause").remove();
              svg.selectAll(".annotation-group-average").remove();

              svg.selectAll("circle").remove();
              d3.selectAll(".icons").classed("current", false)
              d3.selectAll(".event-show").classed("event-show", false)
              d3.selectAll(".text-labels").classed("showing", false)
              d3.selectAll(".voronoi").remove();


          d3.selectAll(".selected-event").classed("selected-event", false)
          d3.selectAll(".selected")
            //.attr("opacity", 1)
            .transition()
              .duration(300)
              .attr("opacity", 0)

          /*var rect = svg.append("rect")
            .attr("x", 10)
            .attr("y", 0)
            .attr("width", 30)
            .attr("height", 15)
            .attr("fill", "#E3C0DB")
            .attr("opacity", 0.3)
            .attr("corner-radius", 5);

          var legendPath = svg.append("path")
            .attr("x", 10)
            .attr("y", 0)
            .attr("width", 30)
            .attr("height", 15)
            .attr("fill", "#E3C0DB")
            .attr("opacity", 0.3)
            .attr("corner-radius", 5);

          var IQR = svg.append("text")
            .attr("x", 50)
            .attr("y", 10)
            .text("= spread of data (IQR)*")
            .classed("legend", true)*/

            // Adding the annotation to the area




          var state = nestAStates.filter(function(d){
              return d.key === stateName;
            });

         // Reset the State dropdown based on the state of selected state
         // Useful for scrollytelling
          var stateDrop = Slist.selectAll("option")
            .property("selected", function(d){
            return d.key === state[0].key;
          })

          // Print which county has been selected (for updating county dropdown)
         // selectedCounty = stateMap.get(state[0].key).County;

          // Update county dropdown to default to "All Counties"
          updateCountyDrop();



          // For updating domain to match year lines

          /*var stateDomain = nestMStates.filter(function(d){
              return d.key === stateName;
            });

           // update domain
           var gData = svg.selectAll(".counties")
              .data(stateDomain)
              .each(function(d){
                  y.domain(d.value.extent)
                });*/


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
                .attr("opacity", 0.4)

            var medPath = svg.selectAll(".line2")
                .data(state)
                .transition()
                .delay(400)
                .duration(1200)
                .attr("d", function(d){
                    return valueLineA(d.values);
                  })
                .attr("opacity", 0.8)

            // IQR Labels

            var IQRHigh = (state[0].values[1].high)


            IQRAnnotation(IQRHigh);

          // Adding Median Label at end of line
          var stateMed = nestAStates.filter(function(d){
              return d.key === stateName;
                });
        
        console.log(stateMed)
                
          // Adding special label for median line
          var MedianText = svg.selectAll(".medianLabel")
          .data(stateMed)
            .transition()
            .delay(400)
            .duration(1200)
            .attr("transform", function(d) { return "translate(" + (width + 8) + "," + y(d.values[11].median) + ")"; })

            svg.selectAll(".medianLabel")
              .classed("medianLabel-showing", true)
      





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


            // Update Chart Title
            var sample = d3.selectAll("#sample")
                .text("Average")

            var sample = d3.select("#countyName")
                .text(stateMap.get(state[0].key).County_Name + " County")
                .classed("noCounty", true)

            var state = d3.select("#stateName")
                .text(stateMap.get(state[0].key).stateName)


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

              // Remove any remnants from previous event
              svg.selectAll(".annotation-group-result").remove();
              svg.selectAll(".annotation-group-cause").remove();
              svg.selectAll(".annotation-group-average").remove();
              d3.selectAll(".medianLabel-showing").classed("medianLabel-showing", false)
              svg.selectAll("circle").remove();
              d3.selectAll(".icons").classed("current", false)

          d3.selectAll(".selected-event").classed("selected-event", false)

          // Find the selected state
          var selectedState = Slist.select("select").property("value")


          var state = nestMStates.filter(function(d){
              return d.key === selectedState;
            });

       /* var stateDrop = Slist.selectAll("option")
            .property("selected", function(d){
            return d.key === selectedState[0].key;
          })
*/

          // Print which county has been selected (for updating county dropdown)
          selectedCounty = stateMap.get(state[0].key).County;


          // Update county dropdown
          updateCountyDrop();

            // Update paths
            svg.selectAll("path.area")  
                .transition()  
                .duration(1000) 
                .attr("opacity", 0)

            svg.selectAll("path.line2")
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
                }, function(d){
                  return d.key
                })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLineState(d.values)
                  })
                  .attr("opacity", 0.6);


            var selectedYear = yList.select("select").property("value")

            // select all paths and select one that the year matches
            var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedYear
              })
              // Set class to selected for matching line
              .classed("selected", true)
              .attr("opacity", 1)
              .raise();


            // Adding labels to end of lines
            //////////// ADDING LABEL TO END OF LINES ///////////

              var gText = svg.selectAll(".labels")
              .data(state)

              gText.selectAll(".text-labels")
                .data(function(d) {
                        return (d.value.years);
                      }, function(d){
                        return d.key
                      })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("transform", function(d) { return "translate(" + x(parseTimeMonth(d.values[11].month)) + "," + y(d.values[11].stateBirths) + ")"; })
                  .attr("x", 3)
                  .attr("dy", "0.35em")
                  .text(function(d) { return d.key; })
                  //.classed("text-labels", true)
                  .attr("opacity", 0)

              d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +selectedYear){
                    return true;
                  }
                  return false;
                })



            // New voronois

            // Remove old voronoi
            d3.selectAll(".voronoi").remove();
            var voronoiData = state[0].value.years

            var voronoi = d3.voronoi()
              .x(function(d) { return x(parseTimeMonth(d.month)); })
              .y(function(d) { return y(+d.stateBirths); })
              .extent([[0, 0], [width, height]]);

            var voronoiGroup = svg.append("g").attr("class", "voronoi");


            voronoiGroup.exit().remove();


            //Create the Voronoi grid
            voronoiGroup.selectAll("path")
              .data(voronoi.polygons(d3.merge(voronoiData.map(function(d) { return d.values; }))))
              .enter().append("path")
              .attr("class", "voronoi")
              .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
              //.style("stroke", "#2074A0") //If you want to look at the cells
              .style("fill", "none")
              .style("pointer-events", "all")
              .on("mouseover", function(d) {
                // determine the year of the polygon being hovered
                var yearSelected = d.data.year;

                // select annual lines
                d3.selectAll(".line").classed("hovered",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
                d3.selectAll(".text-labels").classed("showing",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
              })
              .on("click", function(d){

                // remove remnants from event annotations
                svg.selectAll(".annotation-group-result").remove();
                svg.selectAll(".annotation-group-cause").remove();
                svg.selectAll("circle").remove();
                d3.selectAll(".icons").classed("current", false)

                var yearSelected = d.data.year;
                // de-select other lines
                d3.selectAll(".line").classed("selected", false)
                d3.selectAll(".line").classed("selected-event", false)

                // de-select other labels
                d3.selectAll(".text-labels").classed("event-show", false)

                // select annual lines
                d3.selectAll(".line").classed("selected", function(d){
                  if(d.key == +yearSelected){
                    return true
                  }
                  return false;
                })

                // Bring selected line to top
                d3.selectAll(".selected").raise();

                // reset year dropdown to reflect clicked year
                var yearSel = yList.selectAll("option")
                  .property("selected", function(d){
                    return +d.key === +yearSelected;
                  })

                var year = yList.select("select").property("value")
                console.log(year)

                d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +year){
                    return true;
                  }
                  return false;
                })

              })
              .on("mouseout", function(d){
                  d3.selectAll(".line").classed("hovered", false)
                  d3.selectAll(".text-labels").classed("showing", false)
              })

            // Update Chart Title
            var sample = d3.selectAll("#sample")
                .text("Monthly")

            var selectCounty = ClistG.select("select").property("value")

            var sample = d3.select("#countyName")
                .text(stateMap.get(state[0].key).County_Name + " County")
                .classed("noCounty", function(d){
                  if (selectCounty == "1"){
                    return true
                  }
                  return false
                })
                
            var state = d3.select("#stateName")
                .text(stateMap.get(state[0].key).stateName)

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


              // Remove any remnants from previous event
              svg.selectAll(".annotation-group-result").remove();
              svg.selectAll(".annotation-group-cause").remove();
              svg.selectAll(".annotation-group-average").remove();

              svg.selectAll("circle").remove();
              d3.selectAll(".icons").classed("current", false)
              d3.selectAll(".event-show").classed("event-show", false)
              d3.selectAll(".text-labels").classed("showing", false)
              d3.selectAll(".voronoi").remove();

          d3.selectAll(".selected-event").classed("selected-event", false)
          d3.selectAll(".selected")
            //.attr("opacity", 1)
            .transition()
              .duration(300)
              .attr("opacity", 0)


        var county = nestACounties.filter(function(d){
              return +d.key === +countyCode;
            });


        // Set domain for area chart to same as for line chart
        var countyDomain = nested.filter(function(d){
              return +d.key === +countyCode;
            });

          // update domain
           var gData = svg.selectAll(".counties")
              .data(countyDomain)
              .each(function(d){
                  y.domain(d.value.extent)
                });

            // Update paths
            svg.selectAll("path.area")
                .data(county)  
                .transition()  
                .delay(400)
                .duration(1200) 
                .attr("d", function(d){
                    return areaFill(d.values); })
                .attr("opacity", 0.4)

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

                  console.log("County Avg Update Ran")

          var stateDrop = Slist.selectAll("option")
            .property("selected", function(d){
            return d.key === countyMap.get(county[0].key).stateName;
          })

          selectedCounty = countyMap.get(county[0].key).County;


          // Update county dropdown
          updateCountyDrop(countyCode);  


          // Adding IQR Labels
            var IQRHigh = (county[0].values[1].high)


            IQRAnnotation(IQRHigh);

          // Adding Median Label at end of line
          var countyMed = nestACounties.filter(function(d){
              return +d.key === +countyCode;
                });
        
                
          // Adding special label for median line
          var MedianText = svg.selectAll(".medianLabel")
          .data(countyMed)
            .transition()
            .delay(400)
            .duration(1200)
            .attr("transform", function(d) { return "translate(" + (width + 8) + "," + y(d.values[11].median) + ")"; })
            
            svg.selectAll(".medianLabel")
              .classed("medianLabel-showing", true)


          // Update Chart Title
            var sample = d3.selectAll("#sample")
                .text("Average")

            var selectCounty = ClistG.select("select").property("value")

            var sample = d3.select("#countyName")
                .text(countyMap.get(county[0].key).County_Name + " County,")
                .classed("noCounty", function(d){
                  if (selectCounty == "1"){
                    return true
                  }
                  return false
                })
                
            var state = d3.select("#stateName")
                .text(countyMap.get(county[0].key).stateName)

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


          // Remove any remnants from previous event
          svg.selectAll(".annotation-group-result").remove();
          svg.selectAll(".annotation-group-cause").remove();
          svg.selectAll(".annotation-group-average").remove();
          d3.selectAll(".medianLabel-showing").classed("medianLabel-showing", false)
          svg.selectAll("circle").remove();
          d3.selectAll(".icons").classed("current", false)

          d3.selectAll(".selected-event").classed("selected-event", false)

          // Find the selected state
          var selectedState = Slist.select("select").property("value")

          var county = nested.filter(function(d){
              return +d.key === +countyCode;
            });

          // Reset the State dropdown based on the state of selected county
          var stateDrop = Slist.selectAll("option")
            .property("selected", function(d){
            return d.key === countyMap.get(county[0].key).stateName;
          })

          // Print which county has been selected (for updating county dropdown)
          selectedCounty = countyMap.get(county[0].key).County;

          // Update county dropdown
          updateCountyDrop(countyCode);  

          console.log("County Year Update Ran")

            // Update paths
            svg.selectAll("path.area")  
                .transition()  
                .duration(1000) 
                .attr("opacity", 0)

            svg.selectAll(".line2")
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
                }, function(d){
                  return d.key
                })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("d", function(d){
                    return valueLine(d.values)
                  })
                  .attr("opacity", 0.6)

            var selectedYear = yList.select("select").property("value")

            // select all paths and select one that the year matches
            var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedYear
              })
              // Set class to selected for matching line
              .classed("selected", true)
              .attr("opacity", 1)
              .raise();

              d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +selectedYear){
                    return true;
                  }
                  return false;
                })

              //////////// ADDING LABEL TO END OF LINES ///////////

              var gText = svg.selectAll(".labels")
              .data(county)

              gText.selectAll(".text-labels")
                .data(function(d) {
                        return (d.value.years);
                      })
                .transition()
                  .delay(function(d, i){ return i * 50; })
                  .duration(1000)
                  .attr("transform", function(d) { return "translate(" + x(parseTimeMonth(d.values[11].month)) + "," + y(d.values[11].Births) + ")"; })
                  .attr("x", 3)
                  .attr("dy", "0.35em")
                  .text(function(d) { return d.key; })
                  //.classed("text-labels", true)
                  .attr("opacity", 0)



              // Fixing median line

           /*   var countyMed = nestACounties.filter(function(d){
              return +d.key === +countyCode;
            });


            // Set domain for area chart to same as for line chart


            var medPath = svg.selectAll(".line2")
                .data(countyMed)
                .transition()
                .delay(400)
                .duration(1200)
                .attr("d", function(d){
                    return valueLineA(d.values);
                  })
                .attr("opacity", 0)

            var countyMedD = nested.filter(function(d){
                  return +d.key === +countyCode;
                });

                var countyMed = nestACounties.filter(function(d){
              return +d.key === +countyCode;
                });
        
                
                // Adding special label for median line
                var MedianText = svg.selectAll(".medianLabel")
                .data(countyMed)
                  .transition()
                  .delay(400)
                  .duration(1200)
                  .attr("transform", function(d) { return "translate(" + (width + 8) + "," + y(d.values[11].median) + ")"; })
                  .text("Average")
                  //.lower();*/






            // New voronois

            // Remove old voronoi
            d3.selectAll(".voronoi").remove();
            var voronoiData = county[0].value.years

            var voronoi = d3.voronoi()
              .x(function(d) { return x(parseTimeMonth(d.month)); })
              .y(function(d) { return y(+d.Births); })
              .extent([[0, 0], [width, height]]);

            var voronoiGroup = svg.append("g").attr("class", "voronoi");


            voronoiGroup.exit().remove();


            //Create the Voronoi grid
            voronoiGroup.selectAll("path")
              .data(voronoi.polygons(d3.merge(voronoiData.map(function(d) { return d.values; }))))
              .enter().append("path")
              .attr("class", "voronoi")
              .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
              //.style("stroke", "#2074A0") //If you want to look at the cells
              .style("fill", "none")
              .style("pointer-events", "all")
              .on("mouseover", function(d) {
                // determine the year of the polygon being hovered
                var yearSelected = d.data.year;

                // select annual lines
                d3.selectAll(".line").classed("hovered",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
                d3.selectAll(".text-labels").classed("showing",function(d){
                  if(d.key == +yearSelected){
                    return true;
                  }
                  return false;
                })
              })
              .on("click", function(d){

                // remove remnants from event annotations
                svg.selectAll(".annotation-group-result").remove();
                svg.selectAll(".annotation-group-cause").remove();
                svg.selectAll("circle").remove();
                d3.selectAll(".icons").classed("current", false)

                var yearSelected = d.data.year;
                // de-select other lines
                d3.selectAll(".line").classed("selected", false)
                d3.selectAll(".line").classed("selected-event", false)

                // de-select other labels
                d3.selectAll(".text-labels").classed("event-show", false)

                // select annual lines
                d3.selectAll(".line").classed("selected", function(d){
                  if(d.key == +yearSelected){
                    return true
                  }
                  return false;
                })

                // Bring selected line to top
                // This currently causes a transition glitch
                d3.selectAll(".selected").raise();

                // reset year dropdown to reflect clicked year
                var yearSel = yList.selectAll("option")
                  .property("selected", function(d){
                    return +d.key === +yearSelected;
                  })

                var year = yList.select("select").property("value")
                console.log(year)

                d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +year){
                    return true;
                  }
                  return false;
                })

              })
              .on("mouseout", function(d){
                  d3.selectAll(".line").classed("hovered", false)
                  d3.selectAll(".text-labels").classed("showing", false)
              })


            var sample = d3.selectAll("#sample")
                .text("Monthly")

            var selectCounty = ClistG.select("select").property("value")

            var sample = d3.select("#countyName")
                .text(countyMap.get(county[0].key).County_Name + " County,")
                .classed("noCounty", function(d){
                  if (selectCounty == "1"){
                    return true
                  }
                  return false
                })
                
            var state = d3.select("#stateName")
                .text(countyMap.get(county[0].key).stateName)
            

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


          ///////////////////////////  CALL TO INITIAL GRAPH  //////////////////////////

          // Call function to create initial figure
          // currently set to the county of Suffolk, NY (Hurricane Sandy)
          initialGraph(36103)

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

                if(d3.select(this).select("select").property("value") == 1){

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



              if(selectedCounty == "1"){

                // if "All Counties" is selected then generate state average line
                  stateUpdateAvg(selectedState);

              } else {

                // if any other county selected then generate county average line
                  countyUpdateAvg(selectedCounty)

              }


            d3.select("#dropdown-c").classed("hiddendd", true)

          d3.selectAll(".toggle.average").classed("active", true)
          d3.selectAll(".toggle.year").classed("active", false)


        })


        ///////////////////////  YEARLY TOGGLE CHANGE  /////////////////////

        d3.selectAll(".toggle.year")
          .on('click', function(){

              var selectedState = Slist.select("select").property("value")

              var selectedCounty = ClistG.select("select").property("value")
              console.log(selectedCounty)


            if(selectedCounty == "1"){

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

            var selectedYear = yList.select("select").property("value")

            // select all paths and select one that the year matches
            var selLine = svg.selectAll(".line")
              // de-select all the lines
              .classed("selected", false)
              .filter(function(d) {
                  return +d.key === +selectedYear
              })
              // Set class to selected for matching line
              .classed("selected", true)
              .attr("opacity", 1)

        })




        ///////////////////////////  YEAR CHANGE  //////////////////////////

          // Select year from dropdown
          yList.on('change', function(){

          // Remove remnants of event annotations
          svg.selectAll(".annotation-group-result").remove();
          svg.selectAll(".annotation-group-cause").remove();
          svg.selectAll("circle").remove();

          d3.selectAll(".selected-event").classed("selected-event", false)
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
              .attr("opacity", 1)
              .raise()

              d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +selectedYear){
                    return true;
                  }
                  return false;
                })

          })


        ///////////////////////////  EVENT CHANGE  //////////////////////////
                  

            var eventDisplay = function(eventName){

              // Remove any remnants from previous event
              svg.selectAll(".annotation-group-result")
                .attr("opacity", 1)
                .transition()
                  .duration(500)
                  .attr("opacity", 0)
                  .remove();


              svg.selectAll(".annotation-group-cause")
                .attr("opacity", 1)
                .transition()
                  .duration(500)
                  .attr("opacity", 0)
                .remove();

              // Determine which event was clicked
              var selected = eventName

              // Determine the county of the selected event
              var selectedEvent = eventMap.get(eventName).county

              console.log(selectedEvent)

              // Determine the year of the selected event's births
              var selectedYear = eventMap.get(selected).year

              console.log(selectedYear)
              // Update lines for county/year/event
              countyUpdateYear(selectedEvent)

              //updateCountyDrop(selectedEvent)
/*
              ClistG.selectAll("option")
                  .property("selected", function(d){
                    return d.key === 
                  })*/

              // Updating the year list to match the year of event
              var yearSel = yList.selectAll("option")
                  .property("selected", function(d){
                    return +d.key === +selectedYear;
                  })

              svg.selectAll(".selected-event")
                .attr("opacity", 1)
                .transition()
                .duration(500)
                .attr("opacity", 0)
                .on("end", function(){
                  svg.selectAll(".selected-event").classed("selected-event", false)
                })

              var selLine = svg.selectAll(".line")
                  .classed("selected-event", false)
                  // de-select all the lines
                  .classed("selected", false)
                  .filter(function(d) {
                      return +d.key === +selectedYear
                  })
                  // Set class to selected for matching line
                  .classed("selected", true)
                  .attr("opacity", 1)

              


              // Determine the months of the selected event's births
              var selectedMonths = eventMap.get(selected).months

              // Unhide year list
              d3.select("#dropdown-c").classed("hiddendd", false)

              var selectedLine = d3.selectAll(".line.selected")

              var selectedLineData = selectedLine._groups[0][0].__data__.values

              // Create a map based on selected line data
              var eventMonthMap = d3.map(selectedLineData, function(d){
                return d.month;
              })

              // Generate array of data for only the two months necessary
              var selectedMonthsArray = [eventMonthMap.get(selectedMonths[0]), eventMonthMap.get(selectedMonths[1])]

              svg.selectAll("circle").remove();

              // Add circles to lines
              var circle = svg.append("g").selectAll("circle")
                .data(selectedMonthsArray, function(d){ return d.values; })
                .enter()
                .append("circle")
                .attr("cx", function(d){ return x(parseTimeMonth(d.month))})
                .attr("cy", function(d){ return y(d.Births)})
                .attr("fill", "#EF445B")
                .attr("stroke", "#FFFFFF")
                .attr("stroke-width", 3)
                .attr("r", 0)
                .transition()
                .delay(2000)
                .duration(800)
                .attr("r", 8)

            
                

              //circle.exit().remove();

              // update gradient for line
              gradientUpdate(selectedMonths);

              var selectedGradient = d3.selectAll(".selected")
                  .classed("selected-event", true)
                  .raise()

              d3.selectAll(".text-labels").classed("event-show",function(d){
                  if(d.key == +selectedYear){
                    return true;
                  }
                  return false;
                })

              // pull variables needed for annotations

              var selectedCauseTitle = eventMap.get(selected).causeTitle

              var selectedCauseLabel = eventMap.get(selected).causelabel

              var selectedX = eventMap.get(selected).causeX

              var selectedY = eventMap.get(selected).causeY

              var selecteddX = eventMap.get(selected).causedX

              var selecteddY = eventMap.get(selected).causedY

              // generate cause annotation

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


        d3.select("#icon-a")
          .on("click", function(){
            eventDisplay("Hurricane Sandy");
            d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-b")
          .on("click", function(){
            eventDisplay("Hurricane Katrina")
            d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-c")
          .on("click", function(){
            eventDisplay("Blizzard of 1996")
            d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-d")
          .on("click", function(){
            eventDisplay("Seahawks Superbowl Win")
            d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-e")
          .on("click", function(){
            eventDisplay("Red Sox World Series Win")
          d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-f")
          .on("click", function(){
            eventDisplay("Oklahoma City Bombing")
          d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

        d3.select("#icon-g")
          .on("click", function(){
            eventDisplay("Detroit Bankruptcy")
          d3.selectAll(".icons")
              .classed("current", false)
            d3.select(this)
              .classed("current", true)
          })

          ////////// STYLE INITIAL CHART /////////
          eventDisplay("Hurricane Sandy")
          d3.selectAll("g.annotation-group-cause").remove();
          d3.selectAll(".annotation-note-label").remove();
          d3.selectAll(".annotation-note-bg").remove();



    //////////////////////////////////////////////////////////////////////
    //////////////////////////  SCROLLYTELLING  //////////////////////////
    //////////////////////////////////////////////////////////////////////

        var pinBubbleChart = new ScrollMagic.Scene({
      				// triggerElement: ".third-chart-wrapper",
      				triggerElement: "#container",
      				triggerHook:0,
      				offset: -100,
      				duration:2500
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
            offset: 300,
            duration:500
          })
          .addIndicators({name: "first trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{
                
                eventDisplay("Red Sox World Series Win")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-e")
                    .classed("current", true)

                d3.selectAll("#Sports").classed("highlighted", true)
                d3.selectAll(".sports-prose").classed("prose-highlighted", true)

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){

                  d3.selectAll(".highlighted").classed("highlighted", false)
                  d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                  d3.selectAll(".selected-event").classed("selected-event", false)
                  d3.selectAll(".selected").classed("selected", false)

                  //initialGraph(36103)
                  eventDisplay("Hurricane Sandy")

                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-a")
                    .classed("current", true)

            }
            else{
            }
          })
          ;

          var secondTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 800,
            duration:300
          })
          .addIndicators({name: "second trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{
                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                d3.selectAll("#Terror").classed("highlighted", true)
                d3.selectAll(".terror-prose").classed("prose-highlighted", true)

                eventDisplay("Oklahoma City Bombing")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-f")
                    .classed("current", true)
               

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){

              d3.selectAll(".highlighted").classed("highlighted", false)
              d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                d3.selectAll("#Sports").classed("highlighted", true)
                d3.selectAll(".sports-prose").classed("prose-highlighted", true)
               
                eventDisplay("Red Sox World Series Win")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-e")
                    .classed("current", true)

              
            }
            else{
            }
          })
          ;

    var thirdTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 1100,
            duration:600
          })
          .addIndicators({name: "third trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{

                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                d3.selectAll("#Money").classed("highlighted", true)
                d3.selectAll(".money-prose").classed("prose-highlighted", true)


                eventDisplay("Detroit Bankruptcy")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-f")
                    .classed("current", true)

                  d3.selectAll(".toggle.year").classed("active", true)
                  d3.selectAll(".toggle.average").classed("active", false)


               

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){

                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                d3.selectAll("#Terror").classed("highlighted", true)
                d3.selectAll(".terror-prose").classed("prose-highlighted", true)

                eventDisplay("Oklahoma City Bombing")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-f")
                    .classed("current", true)

                  d3.selectAll(".toggle.year").classed("active", true)
                  d3.selectAll(".toggle.average").classed("active", false)
               
            }
            else{
            }
          })
          ;







          var fourthTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 1700,
            duration:400
          })
          .addIndicators({name: "fourth trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{

                  d3.selectAll(".highlighted").classed("highlighted", false)
                  d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)

                  countyUpdateAvg(26163)
                  d3.selectAll("#Season").classed("highlighted", true)
                  d3.selectAll(".season-prose").classed("prose-highlighted", true)
                  d3.selectAll(".toggle.year").classed("active", false)
                  d3.selectAll(".toggle.average").classed("active", true)

                  // Hide year dropdown
                  d3.select("#dropdown-c").classed("hiddendd", true)
               

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){

                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)
                d3.selectAll("#Money").classed("highlighted", true)
                d3.selectAll(".money-prose").classed("prose-highlighted", true)

                eventDisplay("Detroit Bankruptcy")
                  d3.selectAll("g.annotation-group-cause").remove();
                  d3.selectAll(".annotation-note-label").remove();
                  d3.selectAll(".annotation-note-bg").remove();
                  d3.selectAll(".icons")
                    .classed("current", false)
                  d3.selectAll(".icons#icon-f")
                    .classed("current", true)

                  d3.selectAll(".toggle.year").classed("active", true)
                  d3.selectAll(".toggle.average").classed("active", false)

                  d3.select("#dropdown-c").classed("hiddendd", false)
               
            }
            else{
            }
          })
          ;

          var fifthTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 2100,
            duration:200
          })
          .addIndicators({name: "fifth trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{

                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)

                d3.selectAll(".season-prose-Florida").classed("prose-highlighted", true)


                  stateUpdateAvg("Florida")

                  d3.selectAll("#Florida").classed("highlighted", true)

               

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){

                  d3.selectAll(".highlighted").classed("highlighted", false)
                  d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)

                  countyUpdateAvg(26163)
                  d3.selectAll("#Season").classed("highlighted", true)
                  d3.selectAll(".season-prose").classed("prose-highlighted", true)
                  d3.selectAll(".toggle.year").classed("active", false)
                  d3.selectAll(".toggle.average").classed("active", true)
               
            }
            else{
            }
          })
          ;

        var sixthTrigger = new ScrollMagic.Scene({
            // triggerElement: ".third-chart-wrapper",
            triggerElement: "#right-column",
            triggerHook:0,
            offset: 2200,
            duration:200
          })
          .addIndicators({name: "sixth trigger"}) // add indicators (requires plugin)
          .addTo(controller)
          .on("enter",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){
            }
            else{

                  d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)

                  stateUpdateAvg("Maine")
                  d3.selectAll("#Maine").classed("highlighted", true)
                  d3.selectAll(".season-prose-Maine").classed("prose-highlighted", true)
                  d3.selectAll("#Florida").classed("highlighted", false)
               

            }
          })
          .on("leave",function(e){
            if(e.target.controller().info("scrollDirection") == "REVERSE"){


                d3.selectAll(".highlighted").classed("highlighted", false)
                d3.selectAll(".prose-highlighted").classed("prose-highlighted", false)

                d3.selectAll(".season-prose-Florida").classed("prose-highlighted", true)


                  stateUpdateAvg("Florida")

                  d3.selectAll("#Florida").classed("highlighted", true)
               
            }
            else{
            }
          })
          ;

    };