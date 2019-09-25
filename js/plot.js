class Plot {
  constructor(datapoint) {
    /**
     * because of how the data is structured in the model we need here a way to 
     * transform in dtatpoints that are better readable for d3js
     * therefore we extract all the attributes of the object and we transform
     * it into an dummy object with arrays that can be used within d3js
     */
    this.date_format = '%Y-%m-%d-%H';
    this.date_to_string = d3.timeFormat(this.date_format);
    this.global_median = {};//{...this.empty_object}
    this.chart;
    this.init();
    this.data = [];
  }

  init() {
    this.chart = c3.generate({
      bindto: '#chart',
      size: {
        width: innerWidth,
        height: innerHeight
      },
      padding: {
        top: 20,
        right: 75,
        bottom: 20,
        left: 75
      },
      data: {
        x: 'x',
        columns: []
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: this.date_format
          }
        }
      },
      tooltip: {
        position : (data, w, h, el) => {return {top: 0, left: 0}}
      },
      subchart: {
        show: true
      }
    })
  }

  update(data) {
    // this.data = data;
    // console.log(data);
    this.data = this.get_median_values(data);
    // console.log(this.data);
    this.chart.load({
      columns: this.parse_data(this.data)
    });
  }

  get_median_values(arr) {
    // const 
    const median = { date: arr[0].memories.parsed_clock };
    const divider = arr.length;
    const attrs = Object.keys(arr[0].memories);
    // extract memories
    const memories = arr.map(value => value.memories);
    for (const attr of attrs) {
      let tmp_1 = memories[0][attr];
      // let sum;
      if (typeof tmp_1[0] === 'string') {
        continue;
      } else if (typeof tmp_1[0] === 'boolean') {
        for (let i = 1; i < memories.length; i++) {
          const memory = memories[i][attr];
          tmp_1 = tmp_1.map((num, idx) => this.bool_to_number(num) + this.bool_to_number(memory[idx]));
        }
      } else if (typeof tmp_1[0] === 'number') {
        for (let i = 1; i < memories.length; i++) {
          const memory = memories[i][attr];
          tmp_1 = tmp_1.map((num, idx) => num + memory[idx]);
        }
      } else {
        continue;
      }
      if (attr !== 'swapped' && attr !== 'brute_force') {
        tmp_1 = tmp_1.map(value => value / divider);
      }
      median[attr] = tmp_1;
    }
    return median;
  }
  parse_data(obj) {
    // console.log(obj);
    const values = [];
    const dates = []
    Object.keys(obj).forEach(key => {
      if (key !== 'date') {
        const arr = [...obj[key]];
        arr.unshift(key);
        values.push(arr);
      } else {
        let arr = [...obj[key]];
        arr.unshift('x');
        values.push(arr);
      }
    })
    console.log(values);
    return values
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