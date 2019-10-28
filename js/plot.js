class Plot {
  constructor(datapoint) {
    /**
     * because of how the data is structured in the model we need here a way to 
     * transform in dtatpoints that are better readable for d3js
     * therefore we extract all the attributes of the object and we transform
     * it into an dummy object with arrays that can be used within d3js
     */
    this.date_format = '%Y-%m-%d %H:00';
    this.date_to_string = d3.timeFormat(this.date_format);
    this.global_median = {};//{...this.empty_object}
    this.chart;
    this.data = [];
    this.filter = [];

    this.pies_1;
    this.pies_2;

    this.bar_chart;
    this.previous_data = []
    this.init_chart();
    this.init_pies();
    this.init_bar_chart();
  }


  get_dims() {
    return {
      w: document.getElementById('chart').getBoundingClientRect().width,
      h: innerHeight - 100
    }
  }

  init_bar_chart(){
    this.bar_chart = c3.generate({
      bindto: '#bar-chart',
      size:{
        width: this.get_dims().w,
        height: this.get_dims().h
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      data:{
        columns: [],
        type : 'bar',
        order: null
      },
      axis:{
        rotated: true,
        x: {
          show: false
        }
      },
      tooltip: {
        format:{
          title: d => 'agent ' + d
        }
      },
      grid: {
        y: {
            lines: [{value:0}]
        }
    }
    })
  }

  init_pies() {
    this.pies_1 = c3.generate({
      bindto: '#pie-1',
      size:{
        width: this.get_dims().w / 2,
        height: this.get_dims().w / 2
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      data:{
        columns: [],
        type : 'pie'
      }
    })
    this.pies_2 = c3.generate({
      bindto: '#pie-2',
      size:{
        width: this.get_dims().w / 2,
        height: this.get_dims().w / 2
      },
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      data:{
        columns: [],
        type : 'pie'
      }
    })
  }
  init_chart() {
    this.chart = c3.generate({
      bindto: '#chart',
      size: {
        width: this.get_dims().w,
        height: this.get_dims().h
      },
      padding: {
        top: 20,
        right: 75,
        bottom: 20,
        left: 75
      },
      data: {
        x: 'date',
        columns: [],
        axes: {
          swapped: 'y2',
          brute_force: 'y2'
        },
        types: {
          swapped: 'scatter',
          brute_force: 'scatter'
        }
      },
      // legend: {
      //   item: {
      //     onclick: function (id) { this.chart.toggle(id) }
      //   }
      // },
      color: {
        pattern: [
          '#f00', '#0f0', '#0ff', '#ff0', '#f0f',
          '#bada55', '#ff80ed', '#5ac18e', '#ccff00', '#00ff7f',
          '#daa520', '#afeeee', '#f6546a', '#e6e6fa', '#d3ffce'

        ]
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: this.date_format,
            multiline: true,
            count: 10
          },
        },
        y2: {
          show: true,
          label: {
            text: 'swapped || brute force',
            position: 'outer-middle'
          },
          padding: {
            top: 100,
            bottom: 100
          }
        }
      },
      tooltip: {
        position: (data, w, h, el) => { return { top: 0, left: 0 } }
      },
      onresize: function () {

      },
      subchart: {
        show: true
      },
      point: {
        r: 2,
        focus: {
          expand: {
            r: 5
          }
        }
      },
      transition: {
        duration: 100
      }
    })
  }
  /**
   * 
   * @param {Array} data Agent's data
   * @param {Array} filter list of ID to filter agents
   */
  update_chart(data) {
    // this.data = data;
    // console.log(data);
    this.data = this.get_median_values(data);
    // console.log(this.data);
    this.chart.load({
      columns: this.parse_data(this.data)
    });
  }

  update_pies(agents, tasks){
     // // here we alter the bar informing how many agents are working resting etc.
    // // console.log(this.agents);
    const working = agents.filter(result => result.working === true).length;
    const swapping = agents.filter(result => result.has_swapped === true).length;
    const resting = agents.filter(result => result.resting === true).length;
    const available = agents.length - (working + swapping + resting)
    const agents_situation = [
      ['working'].concat(working),
      ['swapping'].concat(swapping),
      ['resting'].concat(resting),
      ['available'].concat(available)
    ];
    this.pies_1.load({
      columns: agents_situation
    })
  }

  update_bar_chart(data){
    this.bar_chart.load({
      columns: data,
      unload: this.previous_data
    })

    this.previous_data = [data[0][0], data[1][0]];
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
        arr.unshift('date');
        values.push(arr);
      }
    })
    return values
  }
  bool_to_number(bool) {
    return bool ? 1 : 0;
  }

  toggle() {
    console.log('toggle');
    this.chart.toggle();
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