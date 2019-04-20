class Plot {
  constructor() {


    // this.data = [
    //   { Name: 'Mr A', Spent: 40, Year: 2011 },
    //   { Name: 'Mr B', Spent: 10, Year: 2011 },
    //   { Name: 'Mr C', Spent: 40, Year: 2011 },
    //   { Name: 'Mr A', Spent: 70, Year: 2012 },
    //   { Name: 'Mr B', Spent: 20, Year: 2012 },
    //   { Name: 'Mr B', Spent: 50, Year: 2013 },
    //   { Name: 'Mr C', Spent: 30, Year: 2013 }
    // ];

    this.data = [
      { aot: 9, brute_force: 2, date: new Date('2018-01-03T21:00:00.000Z'), fld: 1, stress: 5, swapped: 1, time_coins: 10 },
      { aot: 50, brute_force: 7, date: new Date('2018-01-03T23:00:00.000Z'), fld: 50, stress: 10, swapped: 5, time_coins: 20 },
      { aot: 66, brute_force: 9, date: new Date('2018-01-04T02:00:00.000Z'), fld: 20, stress: 15, swapped: 7, time_coins: 30 },
      { aot: 8, brute_force: 7, date: new Date('2018-01-04T04:00:00.000Z'), fld: 3, stress: 20, swapped: 3, time_coins: 40 },
      { aot: 84.1111111111111, brute_force: 0, date: new Date('2018-01-04T07:00:00.000Z'), fld: 98.33333333333333, stress: 0, swapped: 0, time_coins: 2.631578947368421 }
    ];
    this.date = {};
    // dc.config.defaultColors(newScheme);
    this.plot = dc.lineChart('#line-chart');

    this.ndx = crossfilter(this.data)
    // console.log(this.ndx)
    this.year_dim = this.ndx.dimension(function (d) {
      // console.log(d.date.getHours())
      return +d.date.getHours();
    })
    // let fld_dim = this.ndx.dimension(function (d) { return d.Name; })
    // let coin_dim = this.ndx.dimension(function (d) { return d.time_coins; })
    this.fld_year = this.year_dim.group().reduceSum(function (d) {
      // console.log(d.fld);
      return +d.fld;
    })
    // let spendPerName = coin_dim.group().reduceSum(function (d) { return +d.Spent; })
    // let fld_stress = fld_dim.group().reduceCount();
    // console.log(year_dim, fld_dim, coin_dim)

    this.plot.width(750)
      .height(400)
      .x(d3.scaleBand())
      .xUnits(dc.units.ordinal)
      .brushOn(false)
      .xAxisLabel('fld')
      .yAxisLabel('stress')
      .dimension(this.year_dim)
      .group(this.fld_year)
    this.plot.render();
    // console.log(this.plot)
    // this.data = [];
  }
  draw(data, date) {
    // this.data = [];
    this.date = this.parse_time(date);
    // console.log(data['curious']);
    // const arr = this.data['curious'].fld;
    const tmp_obj = {}
    Object.keys(data['curious']).forEach(key => {
      tmp_obj[key] = data['curious'][key][data['curious'][key].length - 1] || 0;
    })
    tmp_obj['date'] = this.date;
    this.data.push(tmp_obj)
    // console.log(this.data);
    this.reset_data(this.ndx);
    this.ndx.add(this.data);
    // console.log(this.plot.filters());
    // console.log(this.ndx)
    // this.ndx = crossfilter(this.data)
    // this.year_dim = this.ndx.dimension(function (d) {
    //   // console.log(d.date)
    //   return d.date;
    // })
    // this.fld_year = this.year_dim.group().reduceSum(function (d) { 
    //   // console.log(d.fld);
    //   return d.fld; 
    // })

    // this.plot
    //   .dimension(this.year_dim)
    //   .group(this.fld_year)
    this.plot.redraw();
    // noLoop();
    // this.plot.render();
    // dc.redrawAll();
    // this.line = d3.line()
    //     .x((d, i) => this.x_axis(i))
    //     .y((d, i) => this.y_axis(d));

    // this.plot.select('#d3')
    //     .datum(arr)
    //     .append("path")
    //     .attr("class", "line")
    //     .attr("d", this.line);
    // // .attr('fill', 'none')
    // console.log(this.plot)

  }

  // "Grab the filters from the charts, set the filters on the charts to null,
  // do your Crossfilter data removal, then add the filters back to the charts.
  // The exact filter format is kind of screwy, and the fact that you have to put
  // the output of .filters() in an array to make it work with .filter() is a bit strange."
  reset_data(ndx) {
    let plt_filters = this.plot.filters();
    // var spenderChartFilters = spenderRowChart.filters();
    this.plot.filter(null);
    // spenderRowChart.filter(null);
    ndx.remove();
    this.plot.filter([plt_filters]);
    // spenderRowChart.filter([spenderChartFilters]);
  }

  set_w_h(w, h) {
    this.plot
      .attr("width", w + this.margin.left + this.margin.right)
      .attr("height", h + this.margin.top + this.margin.bottom)
  }

  //allows to parse time. not used.
parse_time(date){
	//we need to modify the date slightly to get a proper string..
	const y = date["y"] + 2018;
	const m = date["m"] + 1;
	const d = date["d"]+1;
	const h = date["h"]
	const string = y+"-"+m+"-"+d+"-"+h;
	const parser = d3.timeParse("%Y-%m-%d-%H")

	return parser(string);

}
}


// const date = new Date('2018-01-04T04:00:00.000Z');
// console.log(date.getHours())