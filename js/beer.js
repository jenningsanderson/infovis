var col_breweries = [6,37,51,63,81,82,104,107,110,119,135,144,148,166,168,220,263,264,291,294,341,355,369,386,391,405,417,419,420,421,424,429,441,451,452,459,462,472,480,496,503,513,515,520,523,531,551]

var margin = {top: 20, right: 20, bottom: 50, left: 75},
    width  = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x1 = d3.scaleLinear().range([0, width]);
var y1 = d3.scaleLinear().range([height, 0]);

var color = d3.interpolateMagma;

var beer_svg_1 = d3.select("#beerChart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("data/beers.csv", function(error, input) {
  if (error) throw error;

  var data = []
  var val

  var beersPerBrewery = []
  input.forEach(function(d) {
    if(parseFloat(d.ibu) && col_breweries.indexOf(+d.brewery_id)>0){
      val = {
        ounces: parseInt(d.ounces),
        abv       : +d.abv*100,
        ibu       : +d.ibu,
        brewery_id: d.brewery_id
      }
      beersPerBrewery.push(d.brewery_id)

      data.push(val)
    }
  });

  var order_of_breweries = _.map(_.sortBy(_.groupBy(beersPerBrewery), function(x){return -x.length}),function(y){return y[0]})

  // Scale the range of the data
  x1.domain([-5, order_of_breweries.length]);
  y1.domain(d3.extent(data, function(d) { return d.abv; }));

  // Add the scatterplot
  beer_svg_1.selectAll("dot")
      .data(data)
    .enter().append("circle")
      .attr("r", function(d) { return d.ounces; })
      .attr("cx", function(d) { return x1( order_of_breweries.indexOf(d.brewery_id.toString())); })
      .attr("cy", function(d) { return y1(d.abv); })
      .attr("fill", function(d) { return color(d.ibu/100.0); })
      .attr("fill-opacity", 0.9);

  beer_svg_1.append("text")      // text label for the x axis
    .attr("x", (width/2) )
    .attr("y", (height+margin.top+(margin.bottom/2)) )
    .style("text-anchor", "middle")
    .text("Colorado Breweries");

  // Add the Y Axis
  beer_svg_1.append("g")
    .call(d3.axisLeft(y1));

  beer_svg_1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - (margin.left))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("% Alcohol By Volume");

});

/*
Part II
*/

height2=500

margin2 = {top: 50, right: 60, bottom: 100, left: 0}
// set the ranges
var x2 = d3.scaleLinear().range([0, width]);
var y2 = d3.scaleLinear().range([height2, 0]);

var beer_svg_2 = d3.select("#beerChart2")
    .attr("width", width + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin2.left + "," + margin2.top + ")");


d3.csv("data/beers.csv", function(error, input) {
  if (error) throw error;

  var raw_data = []
  var val

  var col_breweries = [6,37,51,63,81,82,104,107,110,119,135,144,148,166,168,220,263,264,291,294,341,355,369,386,391,405,417,419,420,421,424,429,441,451,452,459,462,472,480,496,503,513,515,520,523,531,551]

  var beersPerBrewery = []
  input.forEach(function(d) {
    var ibu = null
    if(d.ibu){
      ibu = +d.ibu
    }
    val = {
      ounces: parseInt(d.ounces),
      abv       : +d.abv*5,
      style     : d.style,
      brewery_id: d.brewery_id,
      ibu       : ibu
    }
    beersPerBrewery.push(d.brewery_id)
    raw_data.push(val)
  });

  var data = []
  var grouped = _.groupBy(raw_data,function(d){return d.style})
  Object.keys(grouped).forEach(function(key){
    if(grouped[key].length > 30){
      data.push({
        style: key,
        abv: _.max(_.map(grouped[key],function(d){return d.abv})),
        size: (grouped[key].length)/3,
        ibu: _.mean(_.map(grouped[key],function(d){return d.ibu}))
      })
    }
  })

  data = _.sortBy(data, function(d){return -d.ibu})

  var types = _.map(data,function(d){return d.style})

  // Add the scatterplot
  beer_svg_2.selectAll("dot")
    .data(data)
    .enter().append("circle")
      .attr("r", function(d) { return d.size; })
      .attr("cx", function(d) {
        var loc = 0
        for(var idx=0; idx<types.indexOf(d.style); idx++){
          loc += data[idx].size*2
        }
        loc += d.size
        return loc;
      })
      .attr("cy", (height2/2) )
      .attr("fill", "brown")
      .attr("fill-opacity", function(d){return d.abv*2})

  // Add the labels on the beers
  beer_svg_2.selectAll("dot")
    .data(data)
    .enter().append("text")
      .attr("y", function(d) {
        var loc = 0
        for(var idx=0; idx<types.indexOf(d.style); idx++){
          loc += data[idx].size*2
        }
        loc += d.size
        return loc+4;
      })
      .attr("x", -(height+margin2.top+margin2.bottom) )
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "start")
      .text(function(d){return d.style + " (" + (d.abv/5*100).toFixed(1) + "%)" });

  beer_svg_2.append("text")      // text label for the x axis
    .attr("x", (width/2) )
    .attr("y", margin.top*2 )
    .style("text-anchor", "middle")
    .text("Styles of beer produced by US microbreweries (with fleet average alcohol by volume), ranked left-to-right by bitterness");

});
