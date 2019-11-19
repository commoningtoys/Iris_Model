class IrisModel {
  constructor(traits, min_wage, num_task, model_type, monthly_hours) {
    this.batch = false;
    this.agents = [];
    this.tasks = [];

    this.model_type = model_type;

    this.traits = traits;
    this.traits_list = extract_unique_keys(this.traits, 'trait');

    this.max_time_coins = 0;

    this.model_date = {}

    this.hours = 0;
    this.days = 1;
    this.weeks = 0;
    this.months = 0;
    this.years = 0;
    this.setModelTime(); // THIS MAY YELD SOME BUGS IN THE FUTURE!!!
    let idx = 0;

    for (const trait of this.traits) {
      this.agents.push(new Agent(idx, trait, model_type, monthly_hours))
      idx++;
    }
    // make the info for all of the agents and set their initial time
    for (const agent of this.agents) {
      // agent.makeInfo(this.agents);
      // agent.setInfo();
      agent.set_time(this.model_date);
    }
    // add tasks
    // let restingTimePerTask = Math.floor(this.GLOBAL_RESTING_TIME / (TASK_LIST.length * num_task))
    for (let i = 0; i < num_task; i++) {
      for (const task of TASK_LIST) {
        this.tasks.push(new Task(task, min_wage, model_type));
      }
    }

    this.GLOBAL_RESTING_TIME = this.calcGlobalRestTime();
    console.log(this.GLOBAL_RESTING_TIME);
    this.getTotalRestingTime();
    this.counter = 0;

    this.timeUnit = 0;


    this.termination = 0;
    this.termination_counter = 0;
    this.terminated = false;
    /**
     * PLOT
     */

    this.colors = {
      // skill: color(0, 255, 0),
      // preference: color(255, 0, 255),
      fld: '#0ff',
      time_coins: '#f00',
      time_coins_real: '#fff',
      stress: '#ff0',
      aot: '#2d69f5',//color(45, 105, 245)
      swapped: '#00ff6496', //color(0, 255, 100, 150)
      brute_force: '#ff7d0096',//color(255, 125, 0, 150)
      spending_hours: '#fff'
    };

    this.to_emoji = {
      skill: '🤸🏻‍♀️',
      preference: '🥰',
      fld: '🙇🏻‍♀️',
      time_coins: '💵',
      time_coins_real: '💰',
      spending_hours: '💸',
      stress: '😰',
      aot: '⏳',//color(45, 105, 245)
      swapped: '🔄', //color(0, 255, 100, 150)
      brute_force: '💪🏻',//color(255, 125, 0, 150)

    }

    // the plot will need an empty datapoint to construct it's structure
    const datapoint = this.agents[0].data_point;
    this.plot = new Plot(datapoint);
    this.filter = [];
    this.behavior = '';
    const sel_1 = document.getElementById('agents-param-1').value;
    const sel_2 = document.getElementById('agents-param-2').value;
    this.params = [sel_1, sel_2];
    // this.plot = new Plot(parent, 20, 20, this.colors);
    this.pointIndex = 0;

    this.data;

    this.numShowAgents = 5;
    this.showFrom = 0;
    this.showTo = this.numShowAgents;

    this.recordAgentsData = false;
    this.recordDataCounter = 0;
    this.dataCollected = 0;
  }


  /**
   * calculates the global amount of time the agents have for resting
   * it doubles the amount of time needed to finish all the tasks by an agent
   * multiplied by two and by all the agents
   * @param {Number} num_agents 
   * @param {Number} num_task 
   * @returns the global amount of time the agents have to rest
   */
  calcGlobalRestTime() {
    let sum = 0;
    for (const task of this.tasks) {
      sum += task.time_coins_reserve;
    }
    // console.log(sum);
    return sum;
  }
  update() {
    this.setModelTime();
    // for(let i = 0; i < 10; i++){
    for (const agent of this.agents) {
      agent.set_time(this.model_date);
      agent.update();
    }

    for (const task of this.tasks) {
      task.updateUrgency(this.agents);
    }

    // here we need to redistribbute the time coins for all the tasks
    // this could be done every two months or every semester
    // this.distribute_time_coins();

    // this needs refactoring
    if (this.counter % TIME_SCALE == 0) {
      this.timeUnit++;

      // this.setModelTime();
    }
    this.counter++;
    // console.log(this.counter, this.timeUnit);
    // if we are recording the data, we show how much has been collected
    if (this.recordAgentsData) {
      for (const agent of this.agents) {
        this.dataCollected += agent.data.length;
      }
      $('#data-collected').text(this.dataCollected);
    }
  }

  get_median_values_by_behavior() {
    const medianValuesByBehavior = {};
    for (const behavior of this.traits_list) {
      const median = {};
      // here we extract the preferences of the agents by behavior
      // console.log(behavior)
      const extractedAgents = this.agents.filter(result => {
        // console.log(result)
        if (result.behavior_exp.traits.trait === behavior) return result
      });// need to change this to the behavior_exp!!!!
      // console.log(extractedAgents);
      if (extractedAgents.length == 0) continue;// if there is no extracted agent, than we skip to the next behavior
      // here we get the lenght of our data set
      const len = extractedAgents.length;
      const agentsData = {
        fld: [],
        time_coins_real: [],
        time_coins: [],
        stress: [],
        aot: [],
        swapped: [],
        brute_force: [],
        spending_hours: []
      }
      // here we extract all the preferences values 
      for (const agent of extractedAgents) {
        const fld = agent.preferenceArchive.map(result => result.feel_like_doing);
        const time_coins = agent.preferenceArchive.map(result => result.time_coins);
        const tcMax100 = agent.preferenceArchive.map(el => {
          if (el.time_coins > this.max_time_coins) {
            this.max_time_coins = el.time_coins;//here we update the max value for time coins 
          }
          let result = el.time_coins;
          result = (el.time_coins / this.max_time_coins) * 100;
          return result;
        });
        // const sh = agent.preferenceArchive.map(result => (result.spending_hours / 30) * 100);
        const sh = agent.preferenceArchive.map(result => (result.spending_hours));
        const stress = agent.preferenceArchive.map(result => result.stress_level);
        const aot = agent.preferenceArchive.map(result => result.amount_of_time);
        const swapped = agent.preferenceArchive.map(result => result.swapped);
        const bruteForce = agent.preferenceArchive.map(result => result.brute_force);
        agentsData.fld.push(fld);
        agentsData.time_coins_real.push(time_coins);
        agentsData.time_coins.push(tcMax100);
        agentsData.stress.push(stress);
        agentsData.aot.push(aot);
        agentsData.swapped.push(swapped);
        agentsData.brute_force.push(bruteForce);
        agentsData.spending_hours.push(sh);
      }
      // and calculate the median
      Object.keys(agentsData).forEach(key => {
        // console.log(result.fld);
        // here we get the array with the lowest amount of elements
        // to calculate the median we need all the arrays to be the same length
        // threfore we compute the minimum length of all the arrays
        const minLen = Math.min(...agentsData[key].map(result => result.length));
        let sum = Array(minLen).fill(0);
        for (let i = 0; i < agentsData[key].length; i++) {
          for (let j = 0; j < minLen; j++) {
            // console.log(i, j, agentsData.fld[i], agentsData.fld[0][j])
            // if (sum[j] === undefined || sum[j] === null) sum[j] = 0;
            if (key === 'swapped' || key === 'brute_force') {
              sum[j] += agentsData[key][i][j] == true ? 1 : 0;
            } else {
              sum[j] += agentsData[key][i][j];
            }
          }
        }
        // get the median
        if (key === 'swapped' || key === 'brute_force') { } else {
          for (let i = 0; i < sum.length; i++)sum[i] /= len;
        }
        median[key] = sum;
      });
      medianValuesByBehavior[behavior] = median;
    }
    return medianValuesByBehavior;
  }

  update_data(elt) {
    let time_filter = 'last';
    if (elt !== undefined) {
      // console.log(elt.value);
      time_filter = parseInt(elt.value);
    }
    this.data = this.agents.map(agent => {
      return {
        id: agent.ID,
        behavior: agent.behavior,
        date: agent.parsed_clock,
        memories: agent.memory.get_memories(time_filter)
      }
    })
    this.plot_data();
    this.plot_pies();
    this.plot_bar_chart();
  }
  plot_bar_chart() {

    let param = this.data.map(datapoint => {
      const val_1_arr = datapoint.memories[this.params[0]]
      const val_2_arr = datapoint.memories[this.params[1]]
      return {
        value_1: -(val_1_arr[val_1_arr.length -1]),
        value_2: (val_2_arr[val_2_arr.length - 1]),
        id: datapoint.id
      }
    });
    param = param.sort((a, b) => a.value_1 - b.value_1);
    this.plot.update_bar_chart(param);

  }
  plot_pies() {
    const pie_data = this.data.map(datapoint => {
      return {
        id: datapoint.id,
        decision: datapoint.memories.decision[datapoint.memories.decision.length -1],
        task: datapoint.memories.executed_task[datapoint.memories.executed_task.length -1]
      }
    });
    this.plot.update_pies(pie_data);
  }
  plot_data() {
    // possibility to filter by behavior
    // more granular filtering is done in plot.js
    const data = this.behavior == '' ? this.data : this.data.filter(datapoint => datapoint.behavior === this.behavior);
    // disable options that are not associated with that behavior
    const options = document.getElementById('agents-list').options;
    if (this.behavior !== '') {
      for (const option of options) {
        option.disabled = false;
      }
      for (const option of options) {
        if (!option.innerText.includes(this.behavior)) option.disabled = true;
      }
    } else {
      for (const option of options) {
        option.disabled = false;
      }
    }


    if (this.filter.length > 0) {
      let filtered_data = [];
      for (const item of this.filter) {
        filtered_data = filtered_data.concat(data.filter(value => value.id === item))
      }
      this.plot.update_chart(filtered_data);
    } else {
      // console.log(data);


      this.plot.update_chart(data);
    }
  }

  show_behavior(el) {
    this.behavior = el.innerText.toLowerCase();
    this.plot_data()
  }

  filter_agents(elt) {
    this.filter = []
    for (const el of elt.selectedOptions) {
      this.filter.push(el.value);
    }
    // console.log(this.filter);
    this.plot_data();
  }

  filter_params() {

    const sel_1 = document.getElementById('agents-param-1').value;
    const sel_2 = document.getElementById('agents-param-2').value;
    this.params[0] = sel_1;
    this.params[1] = sel_2;

    this.plot_bar_chart();

  }

  reset_filters() {
    this.behavior = '';
    this.filter = [];
    this.plot_data();
  }

  show() { // show isn't the most correct name for this method

    this.plot.update(this.get_median_values_by_behavior());

    /**
     * here we sort the agents array that was shuffled 
     * during the choose agent process of task.js
     */
    // background(51);
    // this.show_task_archives()
    // console.log(medianValuesByBehavior);
    // this.infographic(this.get_median_values_by_behavior());
    // this.plot.draw(medianValuesByBehavior, { h: this.hours, d: this.days, m: this.months, y: this.years })
    // console.log(medianValuesByBehavior);
    // this.plot.show(median, this.pointIndex);
    // this.pointIndex++;
    // this.agents.sort((a, b) => a.ID - b.ID);

    // // preference debug view only 4 agents
    // // for (const agent of this.agents) {
    // //   agent.infographic();
    // // }

    // // here we alter the bar informing how many agents are working resting etc.
    // // console.log(this.agents);
    // const working = this.agents.filter(result => result.working === true).length;
    // const swapping = this.agents.filter(result => result.has_swapped === true).length;
    // const resting = this.agents.filter(result => result.resting === true).length;
    // const available = this.agents.length - (working + swapping + resting)
    // // console.log(working, swapping, resting, available);

    // const w_elt = document.getElementById('working');
    // w_elt.style.width = (working / this.agents.length) * 100 + '%'
    // const sw_elt = document.getElementById('swapping');
    // sw_elt.style.width = (swapping / this.agents.length) * 100 + '%'
    // const r_elt = document.getElementById('resting');
    // r_elt.style.width = (resting / this.agents.length) * 100 + '%'
    // const av_elt = document.getElementById('available')
    // av_elt.style.width = (available / this.agents.length) * 100 + '%'

    // w_elt.previousElementSibling.innerText = '🏋🏻‍♂️' + working;
    // sw_elt.previousElementSibling.innerText = '🤷🏻‍♂️' + swapping;
    // r_elt.previousElementSibling.innerText = '💆🏻‍♂️' + resting;
    // av_elt.previousElementSibling.innerText = '🙋🏻‍♂️' + available;
    // // console.log(w_elt.previousElementSibling)
  }
  /**
   * displays the median values of the agents
   * @param {Array} data array of object containing the median values of the preferences of the agents divided by behavior
   */
  infographic(data) {
    const INFO_WIDTH = (width - ((2 * LEFT_GUTTER) + (2 * PADDING))) / 2;
    const INFO_HEIGHT = (height - (3 * PADDING)) / 2;
    let infoX = LEFT_GUTTER;
    let infoY = PADDING;
    let i = 0;
    Object.keys(data).forEach(key => {

      const preferences = data[key];
      // console.log(data[key], key)
      // console.log(this.agents);
      // this returns the number of agents by behavior
      const agents_by_behavior = this.agents.filter(result => result.behavior === key)
      // console.log(agents_by_behavior);
      const num_agents_by_behavior = agents_by_behavior.length;
      const agents_traits = agents_by_behavior[0].behavior_exp.traits;
      // the trick below is useful to spread the 
      // the visualization in 4 regions of the screen
      infoX = LEFT_GUTTER + ((width / 2) * (i % 2));
      if (i > 1) {
        infoY = 2 * PADDING + INFO_HEIGHT;
      }
      // here we draw the background fotr the text
      fill('#0007');
      noStroke()
      rect(infoX - LEFT_GUTTER, infoY, LEFT_GUTTER, INFO_HEIGHT);
      // outline fo the box containing the viz
      fill(0);
      stroke(100);
      strokeWeight(2);
      rect(infoX, infoY, INFO_WIDTH, INFO_HEIGHT);
      noStroke();
      fill(255);
      textAlign(CENTER, CENTER)
      textSize(TEXT_SIZE - 5);
      const agents_info = `${num_agents_by_behavior} ${key}: c: ${roundPrecision(agents_traits.curiosity, 2)} p: ${roundPrecision(agents_traits.perfectionism, 2)} e: ${roundPrecision(agents_traits.endurance, 2)} gw: ${roundPrecision(agents_traits.goodwill, 2)}`;
      text(agents_info, infoX, infoY - PADDING, INFO_WIDTH, PADDING);
      let lines = 0;


      Object.keys(this.colors).forEach(pref => {
        textAlign(RIGHT, CENTER);
        fill(this.colors[pref])

        const arr = preferences[pref];
        let last = Math.round(arr[arr.length - 1])
        last = isNaN(last) ? 0 : last;
        text(this.to_emoji[pref] + ': ' + last, infoX - 10, (infoY + 50) + (lines * TEXT_SIZE));
        lines += 1.3;
      })
      Object.keys(preferences).forEach(pref => {
        // console.log(pref)
        if (pref === 'time_coins_real') {
          // textSize(20);
          // fill('#fff');
          // noStroke();
          // const arr = preferences[pref];
          // const last = arr[arr.length - 1];
          // text('💰 ' + round(last), infoX, infoY)
        } else if (pref === 'swapped' || pref === 'brute_force') {

          const agent_num = this.traits.filter(result => result.trait === key).length;
          drawLine(preferences[pref], agent_num, infoX, infoY, this.colors[pref], pref)
        } else {
          printGraphic(preferences[pref], infoX, infoY, this.colors[pref]);
        }
      })
      i++;
    })
    /**
     * Draws a scatterplot infographic
     * @param {Array} arr  array of values to be displayed
     * @param {Number} x position of the infographic on x-axis
     * @param {Number} y position of the infographic on y-axis
     * @param {Object} col p5.Color object
     */
    function printGraphic(arr, x, y, col) {
      noFill();
      stroke(col);
      strokeWeight(1);
      let i = 0;
      push();
      translate(x, y)
      beginShape();
      for (const val of arr) {
        let currX = map(i, 0, arr.length, 0, INFO_WIDTH);//posX(i, arr.length, colNumber, totCol);
        const clamped_val = clamp(map(val, 0, MAXIMUM, 0, INFO_HEIGHT), 0, INFO_HEIGHT)
        // let currY = INFO_HEIGHT - map(val, 0, MAXIMUM, 0, INFO_HEIGHT);//posY(val, row_number);
        let currY = INFO_HEIGHT - clamped_val;//posY(val, row_number);
        // currY = clamp(currY, MINIMUM - y, MAXIMUM - y);
        vertex(currX, currY);
        i++;
      }
      endShape();
      pop();
    }
    /**
     * draws a line representing how often an agent has swapped or has been brute-forced
     * @param {Array} arr array of values to be displayed
     * @param {Number} num_agents number of agents with same bahavior
     * @param {Number} x position of the infographic on x-axis
     * @param {Number} y position of the infographic on y-axis
     * @param {Object} col p5.Color object
     * @param {String} type string containing specific values regarding trading and brute force infos
     */
    function drawLine(arr, num_agents, x, y, col, type) {
      strokeWeight(1);
      stroke(col);
      push()
      translate(x, y)
      let index = 0;
      for (const val of arr) {
        let h = 3 + map(val, 0, num_agents, 1, INFO_HEIGHT * 0.2)
        // console.log(INFO_WIDTH / DATA_POINTS, INFO_WIDTH, DATA_POINTS, val)
        const currX = map(index, 0, arr.length, 0, INFO_WIDTH);
        if (type === 'swapped') {
          // console.log(h)
          // ellipse(currX + (r / 2), INFO_HEIGHT * 0.33333, r);
          // rect(currX + (r / 2), INFO_HEIGHT * 0.33333, 1, -h);
          // stroke(0, 255, 0);
          line(currX, (INFO_HEIGHT * 0.33333) - (h / 2), currX, (INFO_HEIGHT * 0.33333) + (h / 2));
        } else {
          // ellipse(currX + ((r * 10)/ 2), INFO_HEIGHT * 0.66666, r * 10);
          // rect(currX + ((r * 10) / 2), INFO_HEIGHT * 0.66666, 1, -h);
          // stroke(255, 0, 255);
          line(currX, (INFO_HEIGHT * 0.66666) - (h / 2), currX, (INFO_HEIGHT * 0.66666) + (h / 2));
        }
        index++;
      }
      pop();
    }
  }

  show_task_archives() {
    const sorted_agents = sort_agents(this.agents);
    noStroke();
    const w = width / DATA_POINTS;
    const h = height / this.agents.length;
    let idx_h = 0;
    for (const agent of sorted_agents) {
      const decisions = agent.get_decision_archive().map(result => result.decision);
      let idx_w = 0;
      for (const decision of decisions) {
        fill(agent.colors[decision]);
        rect(idx_w * w, idx_h * h, w, h);
        idx_w++;
      }
      idx_h++;
    }
  }
  /**
   * sets the time passed in the form of hours | days | months | yeara
   */
  setModelTime() {
    // if (this.timeUnit > 0 && this.timeUnit % TS_FRACTION == 0) {
    this.hours++;
    // }
    if (this.hours > 0 && this.hours % 24 == 0) {
      // here we update the agent status rest and availability to work
      // for (const agent of this.agents) {
      // for (let i = 0; i < this.agents.length; i++) {
      //   const agent = this.agents[i];
      //   agent.resting = false;
      //   agent.done_for_the_day = false;
      //   agent.add_data_to_archive();
      // }
      this.agents.forEach(agent => {

        agent.add_data_to_archive();
        agent.resting = false;
        agent.done_for_the_day = false;
      })
      this.days++;
      this.hours = 0;
      this.distribute_time_coins();
    }
    if ((this.days > 1 && this.days % 31 == 0) || (this.days > 1 && (this.days % 29 == 0 && this.months === 1))) {// shorter month on february
      // here we need to reset the spent time of the agents if its the spending model
      if (this.model_type === 'time-spending') {
        for (const agent of this.agents) {
          agent.reset_spending_time();
        }
      }
      this.months++;
      this.days = 1;

      this.termination_counter++;
      if (this.batch) {
        // save images every 3 months
        // if(this.months % 2 === 0)this.show();
        if (this.months % 12 === 0) {
          this.show();
          const d = new Date();
          const milliseconds = Date.parse(d) / 1000;
          let save_txt = milliseconds + '_' + batch_save_txt + '_model';
          console.log(save_txt);
          // saveCanvas(save_txt, 'png');
        }

        if (this.termination_counter >= this.termination) {
          this.terminated = true;
        }
      } else {
        if (this.termination_counter >= this.termination) {
          console.log('terminate');
          start_stop_model();
          const d = new Date();
          const milliseconds = Date.parse(d) / 1000;
          let save_txt = batch_save_txt + '_' + milliseconds + '_model';
          // save_txt = save_txt.replace('.', '_');
          console.log(save_txt);
          // saveCanvas(save_txt, 'png');
        }
      }
    }
    if (this.months > 0 && this.months % 12 == 0) {
      this.years++;
      this.months = 0;
      this.weeks = 0;
    }

    this.model_date = {
      h: this.hours,
      d: this.days,
      m: this.months,
      y: this.years
    }
    let currentDate = `years: ${this.years}<br>months: ${this.months}<br>days: ${this.days}<br>hours: ${this.hours}`;
    // console.log(currentDate);
    document.getElementById('display-date').innerHTML = currentDate;
  }
  end_after(val) {
    this.termination = val;
  }

  set_batch_executions(bool) {
    this.batch = bool;
  }

  /**
   * computes the total resting time in the model
   */
  getTotalRestingTime() {
    let sumAgent = 0;
    for (const agent of this.agents) {
      sumAgent += agent.time_coins;
    }
    let sumTask = 0;
    for (const task of this.tasks) {
      sumTask += task.time_coins_reserve;
    }
    console.log(`agent resting time: ${sumAgent}, task time_coins_reserve: ${sumTask} GLOBAL ${this.GLOBAL_RESTING_TIME}`);
  }

  distribute_time_coins() {
    // here we need to redistribute the time coins
    // between the task to avoid that some tasks accumulate
    // all the time coins
    const get_coins = this.tasks.map(result => result.time_coins_reserve)
    const sum = get_coins.reduce((acc, curr) => acc + curr);
    const result = Math.floor(sum / this.tasks.length);
    const advance = sum % this.tasks.length;
    // console.log(sum, result, advance);
    for (const task of this.tasks) {
      task.time_coins_reserve = result;
    }
    const rand_idx = Math.floor(Math.random() * this.tasks.length)
    this.tasks[rand_idx].time_coins_reserve += advance
    // console.log(this.tasks);
    // console.log(sum, result)

  }

  /**
   * this methods records the data generated by the agents and stores it
   * in JSON that can be saved by the client
   */
  recordData() {
    console.log('RECORDING...');
    this.recordAgentsData = !this.recordAgentsData;
    if (this.recordAgentsData) {
      for (const agent of this.agents) {
        agent.data = []; // empty the data set
        agent.recordData = true;
      }
      $('#record-data').html('<span id="data-collected"></span> entries<br>(click again to save)');
    } else {
      $('#record-data').text('RECORD DATA');
      for (const agent of this.agents) {
        agent.recordData = false;
      }
      saveRAWData(this.agents, this.recordDataCounter);
      this.dataCollected = 0;
      this.recordDataCounter++;
    }
  }
  /**
   * sets the minimum wage in the model
   * at the beginning it is 0
   */
  setMinWage(val) {
    console.log(val);
    for (const task of tasks) {
      task.minWage = val;
    }

  }
  /**
   * sets the behavior of all the agents to a specific behavior
   */
  setAgentsBehavior(behavior) {
    console.log(behavior);
    for (const agent of this.agents) {
      agent.behavior = behavior;
      agent.makeInfo(this.agents);
      agent.setInfo();
    }
  }
  setView(val) {
    console.log(val);

    this.showFrom = val - 2;
    this.showTo = val + 3;
    if (this.showFrom < 0) this.showFrom = 0;
    if (this.showTo > this.agents.length) this.showTo = this.agents.length;
  }

  set_stress_increment(val) {
    console.log(val)
    for (const agent of this.agents) {
      agent.stress_increase_val = parseFloat(val);
    }
  }

  set_stress_decrement(val) {
    console.log(val)
    for (const agent of this.agents) {
      agent.stress_decrease_val = parseFloat(val);
    }
  }
  /**
   * player interactions below
   */
  playerExecuteTask() {
    // console.log('YES');
    let task_name = $('#task-name').text();
    // console.log(task_name);
    let agent = this.returnPlayerAgent();
    console.log(agent);
    agent.playerWorks(this.agents);
    // let task = tasks.filter(obj => obj.type === task_name);
    // task = task.filter(obj => {
    //   for(const a of obj.agentsPool){
    //     a.ID === PLAYER_ID;
    //     return obj;
    //     // break
    //   }
    // })
    // loop();
    $('.player-interface').toggle();
  }

  playerTradeTask() {
    let el = $('select#other-tasks option:selected');
    let agent = this.returnPlayerAgent();
    // console.log(agent);
    agent.playerTrades(el.text());
    loop();
    $('.player-interface').toggle();
    // console.log($('.player-interface')[0].attributes[1].value);
  }

  playerRest() {
    console.log('REST');
    const agent = this.returnPlayerAgent();
    agent.playerRests()
    loop();
    $('.player-interface').toggle();
  }

  startPlayerTime() {
    console.log('start');
    let agent = this.returnPlayerAgent();
    agent.playerTimer = 0;
    agent.playerWorking = true;
    console.log(agent.playerWorking);
    loop();
  }

  stopPlayerTime() {
    console.log('stop');
    let agent = this.returnPlayerAgent();
    // updateAttributes(task, agents, brute_forced, _amount_of_time)
    agent.updateAttributes(agent.playerTaskToExecute, this.agents, false, agent.playerTimer);
    agent.playerWorking = false;
    agent.working = false;
    if (agent.hasTraded) {
      agent.hasTraded = false;
      agent.tradeTask = '';
    }
    agent.setInfo();
    setTimeout(() => {
      $('.player-work').hide('fast')
    }, 500)
  }

  returnPlayerAgent() {
    return this.agents.filter(obj => obj.ID === document.getElementById('yes').value)[0];
  }
}