class Plot {
  constructor(datapoint) {
    console.log(datapoint);
    /**
     * because of how the data is structured in the model we need here a way to 
     * transform in dtatpoints that are better readable for d3js
     * therefore we extract all the attributes of the object and we transform
     * it into an dummy object with arrays that can be used within d3js
     */
    this.global_median = {};//{...this.empty_object}
    this.init();
    this.data = [];
  }

  init() {
    console.log('init!');
    this.margin = { top: 40, right: 20, bottom: 50, left: 100 }
    this.graph_w = this.canvas_w() - this.margin.right - this.margin.left;
    this.graph_h = this.canvas_h() - this.margin.top - this.margin.bottom;

    this.svg = this.create_d3_obj('.line-chart', this.graph_w + this.margin.right + this.margin.left, this.graph_h + this.margin.top + this.margin.bottom);

    this.graph = this.svg.append('g')
      .attr('width', this.graph_w)
      .attr('height', this.graph_h)
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // scales

    this.x = d3.scaleTime().range([0, this.graph_w]);
    this.y = d3.scaleLinear().range([this.graph_h, 0]);

    // axis groups

    this.x_axis_group = this.graph.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0, ' + this.graph_h + ')');

    this.y_axis_group = this.graph.append('g')
      .attr('class', 'y-axis');

    // d3 line path generator
    this.line = d3.line()
      .x((d, i, n) => {
        // console.log(d);
        return this.x(d.date)
      })
      .y(d => {
        // console.log(d);
        return this.y(d.value);
      });


    // set color scheme
    this.color = d3.scaleOrdinal(d3['schemeSet3']);

    // legend setup

    this.legend_group = this.svg.append('g')
      .attr('transform', `translate(0, ${this.graph_h})`);

    this.legend = d3.legendColor()
      .shape('circle')
      .shapePadding(10)
      .scale(this.color)

    // tooltip setup
    this.tip = d3.tip()
      .attr('class', 'tip card')
      .html((d, i, n) => {
        let content = `<div class="name">${d.data_name}: ${d.value}</div>`
        content += `<div class="cost">${d.date.toString()}</div>`
        return content;
      })
    // add it to the graph
    this.graph.call(this.tip);
  }

  update(data) {
    // this.data = data;
    console.log(data);
    // this.data = this.get_median_values(data);

    // this.color.domain(Object.keys(this.data[0]));
    // this.legend_group.call(this.legend);
    // this.legend_group.selectAll('text').attr('fill', '#f50');
    // // console.log(this.data);
    // // this.x.domain(d3.extent(this.data, (d, i) => {
    // //   console.log(d.parsed_clock);
    // //   return d.parsed_clock
    // // })) // extent return min and max of an array
    // // console.log(d3.extent(this.data.map(value => value.parsed_clock)));
    // this.x.domain(d3.extent(this.data.map(value => value.parsed_clock))) // extent return min and max of an array
    // this.y.domain([0, MAXIMUM]);
    // //   if (key !== 'date') {
    // // const datapoint = { values: [...this.data.stress_level], date: this.data.date };
    // // const circles = this.graph.selectAll('circle')
    // //   .data(this.data);

    // // //remove unwanted dots
    // // circles.exit().remove();

    // // // update current point
    // // circles
    // //   .attr('cx', d => {
    // //     return this.x(d.parsed_clock)
    // //   })
    // //   .attr('cy', d => {
    // //     return this.y(d.social_work_skill_level)
    // //   })

    // // // add new points

    // // circles.enter()
    // //   .append('circle')
    // //   .attr('r', 4)
    // //   .attr('cx', d => {
    // //     return this.x(d.parsed_clock)
    // //   })
    // //   .attr('cy', d => {
    // //     return this.y(d.social_work_skill_level)
    // //   })
    // //   .attr('fill', '#ccc');
    // // console.log(key, datapoint);



    // // .attr('d', d => this.line(d))
    // // .attr('d', d => {
    // //   console.log(d);
    // //   return this.line
    // // })// add the line generator
    // // }
    // // })

    // // create axis
    // const x_axis = d3.axisBottom(this.x)
    //   .ticks(4)
    //   .tickFormat(d3.timeFormat('%b %d'));
    // const y_axis = d3.axisLeft(this.y)
    //   .ticks(4)
    //   .tickFormat(d => d + 'm');

    // // call axis inside the group
    // this.x_axis_group.call(x_axis)
    // this.y_axis_group.call(y_axis)
    // // rotate x-axis text
    // this.x_axis_group.selectAll('text')
    //   .attr('transform', 'rotate(-40)')
    //   .attr('text-anchor', 'end');

    // const keys = Object.keys(this.data[0]);
    // for (const key of keys) {
    //   let datapoint;
    //   if (key !== 'parsed_clock') {
    //     datapoint = this.data.map(value => {
    //       return {
    //         value: value[key],
    //         date: value.parsed_clock,
    //         data_name: key
    //       }
    //     });
    //   } else { continue }

    //   const path = this.graph.selectAll('path.chart' + key).data([datapoint]);
    //   // remove older paths
    //   path.exit().remove();

    //   path.attr('class', 'chart' + key)
    //     .attr('fill', 'none')
    //     .attr('stroke', this.color(key))
    //     .attr('stroke-width', 2)
    //     .attr('d', d => this.line(d));

    //   path.enter()
    //     .append('path')
    //     .attr('class', 'chart' + key)
    //     .attr('fill', 'none')
    //     .attr('stroke', this.color(key))
    //     .attr('stroke-width', 2)
    //     .attr('d', d => this.line(d));
    // }

    // this.graph.selectAll('path')
    //   .on('mouseover', (d, i, n) => {
    //     // show tooltip
    //     const x0 = this.x.invert(d3.mouse(document.body)[0])
    //     const index = d3.bisector(d => d.date).left
    //     this.tip.show(d[index(d, x0, 1)], n[i]); // pass the data and the html element
    //     // handle_mouse_over(d, i, n);
    //   })
    //   .on('mouseout', (d, i, n) => {
    //     // hide tooltip
    //     this.tip.hide();
    //     // handle_mouse_out(d, i, n);
    //   })
  }

  get_median_values(arr) {
    // const 
    // const median = { date: arr[0].memories.parsed_clock };
    const divider = arr.length;
    const attrs = Object.keys(arr[0].memories[0]);
    const tmp_2 = [];
    for (let j = 0; j < arr[0].memories.length; j++) {
      const tmp_1 = {};
      for (const attr of attrs) {
        let sum;
        for (let i = 0; i < arr.length - 1; i++) {
          // console.log(arr[i]);
          const memory = arr[i].memories[j][attr];
          if (i === 0) sum = memory;
          const next = arr[i + 1].memories[j][attr];
          if (typeof sum === 'number') { sum += next; }
          else if (typeof sum === 'boolean') {
            sum = this.bool_to_number(sum) + this.bool_to_number(next)
          } else if (attr === 'parsed_clock') {
            sum = memory
          }
        }
        if (!isNaN(sum) && attr !== 'parsed_clock') tmp_1[attr] = sum / divider;
        else if (attr === 'parsed_clock') tmp_1[attr] = sum
      }
      tmp_2.push(tmp_1);
    }
    // console.log(tmp_2);
    return tmp_2
  }
  bool_to_number(bool) {
    return bool ? 1 : 0;
  }
  create_d3_obj(pointer, w, h) {
    return d3.select(pointer).append('svg').attr('width', w).attr('height', h)
  }

  canvas_w() {
    const info = document.getElementById('info-window');
    const w = info.getBoundingClientRect().width;
    console.log(w);
    return innerWidth - w;
  };

  canvas_h() {
    const footer = document.getElementById('footer');
    const h = footer.getBoundingClientRect().height;
    return innerHeight - h;
  }
}