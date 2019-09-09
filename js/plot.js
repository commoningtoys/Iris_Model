class Plot {
  constructor(datapoint) {
    console.log(datapoint);
    /**
     * because of how the data is structured in the model we need here a way to 
     * transform in dtatpoints that are better readable for d3js
     * therefore we extract all the attributes of the object and we transform
     * it into an dummy object with arrays that can be used within d3js
     */
    // this.empty_object = {};
    // Object.keys(datapoint).forEach(key => {
    //   const data = datapoint[key];
    //   if (typeof data === 'number' || typeof data === 'boolean') {
    //     this.empty_object[key] = [];
    //   } else if (key === 'preferences') {
    //     const tmp_obj = {};
    //     Object.keys(data).forEach(task => {
    //       const preferences = data[task];
    //       const tmp_inner_obj = {}
    //       Object.keys(preferences).forEach(inner_key => {
    //         const inner_el = preferences[inner_key];
    //         if (typeof inner_el === 'number') {
    //           tmp_inner_obj[inner_key] = [];
    //         } else if (typeof inner_el === 'string') {
    //           tmp_inner_obj[inner_key] = [];
    //         }
    //         tmp_obj[task] = tmp_inner_obj;
    //       })
    //     })
    //     this.empty_object[key] = tmp_obj
    //   } else {
    //     this.empty_object[key] = [];
    //   }
    // })
    // console.log(this.empty_object);
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
        console.log(d);
        // return this.x(d.date[i])
      })
      .y(d => {
        console.log(d);
        // return this.y(d.distance);
      });

    this.path = this.graph.append('path');
  }

  update(data) {
    // this.data = data;


    this.data = this.get_median_values(data);
    // this.x.domain(d3.extent(this.data.date, (d, i) => {
    //   return d
    // })) // extent return min and max of an array
    // this.y.domain([0, MAXIMUM]);

    // Object.keys(this.data).forEach(key => {
    //   if (key !== 'date') {
    // const datapoint = { values: [...this.data.stress_level], date: this.data.date };
    // const circles = this.graph.selectAll('circle')
    //   .data(datapoint);

    // //remove unwanted dots
    // circles.exit().remove();

    // // update current point
    // circles
    //   .attr('cx', d => {
    //     console.log(d.date);
    //     x(d.date)
    //   })
    //   .attr('cy', d => {
    //     console.log(d);
    //     y(d.values)
    //   })

    // // add new points

    // circles.enter()
    //   .append('circle')
    //   .attr('r', 4)
    //   .attr('cx', d => {
    //     console.log(d.date);
    //     x(d.date)
    //   })
    //   .attr('cy', d => {
    //     console.log(d);
    //     y(d.values)
    //   })
    //   .attr('fill', '#ccc');
    // console.log(key, datapoint);
    // this.path.data([datapoint])
    //   .attr('fill', 'none')
    //   .attr('stroke', '#0bf')
    //   .attr('stroke-width', 2)
    //   .attr('d', d => this.line(d))
    // .attr('d', d => {
    //   console.log(d);
    //   return this.line
    // })// add the line generator
    // }
    // })

    // create axis
    const x_axis = d3.axisBottom(this.x)
      .ticks(4)
      .tickFormat(d3.timeFormat('%b %d'));
    const y_axis = d3.axisLeft(this.y)
      .ticks(4)
      .tickFormat(d => d + 'm');

    // call axis inside the group
    this.x_axis_group.call(x_axis)
    this.y_axis_group.call(y_axis)
    // rotate x-axis text
    this.x_axis_group.selectAll('text')
      .attr('transform', 'rotate(-40)')
      .attr('text-anchor', 'end');
  }

  get_median_values(arr) {
    console.log(arr);
    // const 
    // const median = { date: arr[0].memories.parsed_clock };
    const tmp_1 = {};
    const divider = arr.length;
    const attrs = Object.keys(arr[0].memories[0]);
    const tmp_2 = []
    for (let j = 0; j < arr[0].memories.length; j++) {
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
          }else if(attr === 'parsed_clock'){
            
            sum = memory
          }
        }
        if(!isNaN(sum)&& attr !== 'parsed_clock')tmp_1[attr] = sum / divider;
        else if(attr === 'parsed_clock')tmp_1[attr] = sum
      }
      tmp_2.push(tmp_1);
    }
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
    return innerWidth - w;
  };

  canvas_h() {
    const footer = document.getElementById('footer');
    const h = footer.getBoundingClientRect().height;
    return innerHeight - h;
  }
}