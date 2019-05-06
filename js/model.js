class IrisModel {
  constructor(traits, min_wage, num_task, model_type) {
    // this.plot = new Plot();
    this.batch = false;
    this.agents = [];
    this.tasks = [];

    this.model_type = model_type;

    this.traits = traits;
    this.traits_list = extract_unique_keys(this.traits, 'trait');

    this.max_time_coins = 0;
    let idx = 0;
    for (const trait of this.traits) {
      this.agents.push(new Agent(idx, trait, model_type))
      idx++;
    }
    // make the info for all of the agents
    for (const agent of this.agents) {
      agent.makeInfo(this.agents);
      agent.setInfo();
    }
    // add tasks
    // let restingTimePerTask = Math.floor(this.GLOBAL_RESTING_TIME / (TASK_LIST.length * num_task))
    for (let i = 0; i < num_task; i++) {
      for (const task of TASK_LIST) {
        this.tasks.push(new Task(task, min_wage));
      }
    }

    this.GLOBAL_RESTING_TIME = this.calcGlobalRestTime();
    console.log(this.GLOBAL_RESTING_TIME);
    this.getTotalRestingTime();
    this.counter = 0;

    this.timeUnit = 0;

    this.hours = 0;
    this.days = 0;
    this.weeks = 0;
    this.months = 0;
    this.years = 0;

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
      brute_force: '#ff7d0096'//color(255, 125, 0, 150)
    };

    this.to_emoji = {
      skill: '🤸🏻‍♀️',
      preference: '🥰',
      fld: '🙇🏻‍♀️',
      time_coins: '💵',
      time_coins_real: '💰',
      stress: '😰',
      aot: '⏳',//color(45, 105, 245)
      swapped: '🔄', //color(0, 255, 100, 150)
      brute_force: '💪🏻'//color(255, 125, 0, 150)

    }

    // this.plot = new Plot(parent, 20, 20, this.colors);
    this.pointIndex = 0;

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
    // for(let i = 0; i < 10; i++){
    for (const agent of this.agents) {
      // let agent = this.agents[i];
      agent.update();
      // drawInfos(agent);
      // agent.setInfo();
    }

    for (const task of this.tasks) {
      // task.show();
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
    this.setModelTime();
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

  show() { // show isn't the most correct name for this method
    /**
     * here we sort the agents array that was shuffled 
     * during the choose agent process of task.js
     */
    background(51);
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
        brute_force: []
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
          // if (el.time_coins > 100) {
          // console.log(el.time_coins, max_time_coins);
          result = (el.time_coins / this.max_time_coins) * 100;
          // console.log(result); 
          // }
          // let val = (el.time_coins / (this.GLOBAL_RESTING_TIME / extractedAgents.length)) * 100;
          return result;
        });
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
      }
      // const median = {};
      // and calculate the median
      Object.keys(agentsData).forEach(key => {
        // console.log(result.fld);
        // here we get the array with the lowest amount of elements
        // to calculate the median we need all the arrays to be the same length
        // threfore we compute the minimum length of all the arrays
        // console.log(agentsData);
        const minLen = Math.min(...agentsData[key].map(result => result.length));
        // console.log(minLen);
        let sum = Array(minLen).fill(0);
        // console.log(sum);
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
        // console.log(result.fld);
        // get the median
        if (key === 'swapped' || key === 'brute_force') { } else {
          for (let i = 0; i < sum.length; i++)sum[i] /= len;
        }
        median[key] = sum;
      });
      // median.number_of_agents = len;
      // median['agents'] = len;
      // console.log(median, behavior);
      medianValuesByBehavior[behavior] = median;
    }
    // console.log(medianValuesByBehavior);
    this.infographic(medianValuesByBehavior);
    // this.plot.draw(medianValuesByBehavior, { h: this.hours, d: this.days, m: this.months, y: this.years })
    // console.log(medianValuesByBehavior);
    // this.plot.show(median, this.pointIndex);
    this.pointIndex++;
    this.agents.sort((a, b) => a.ID - b.ID);

    // preference debug view only 4 agents
    // for (const agent of this.agents) {
    //   agent.infographic();
    // }

    // here we alter the bar informing how many agents are working resting etc.
    // console.log(this.agents);
    const working = this.agents.filter(result => result.working === true).length;
    const swapping = this.agents.filter(result => result.has_swapped === true).length;
    const resting = this.agents.filter(result => result.resting === true).length;
    const available = this.agents.length - (working + swapping + resting)
    // console.log(working, swapping, resting, available);

    const w_elt = document.getElementById('working');
    w_elt.style.width = (working / this.agents.length) * 100 + '%'
    const sw_elt = document.getElementById('swapping');
    sw_elt.style.width = (swapping / this.agents.length) * 100 + '%'
    const r_elt = document.getElementById('resting');
    r_elt.style.width = (resting / this.agents.length) * 100 + '%'
    const av_elt = document.getElementById('available')
    av_elt.style.width = (available / this.agents.length) * 100 + '%'

    w_elt.previousElementSibling.innerText = '🏋🏻‍♂️' + working;
    sw_elt.previousElementSibling.innerText = '🤷🏻‍♂️' + swapping;
    r_elt.previousElementSibling.innerText = '💆🏻‍♂️' + resting;
    av_elt.previousElementSibling.innerText = '🙋🏻‍♂️' + available;
    // console.log(w_elt.previousElementSibling)
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
      fill(0);
      stroke(100);
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
        let currY = INFO_HEIGHT - map(val, 0, MAXIMUM, 0, INFO_HEIGHT);//posY(val, row_number);
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
  /**
   * sets the time passed in the form of hours | days | months | yeara
   */
  setModelTime() {
    // if (this.timeUnit > 0 && this.timeUnit % TS_FRACTION == 0) {
      this.hours++;
    // }
    if (this.hours > 0 && this.hours % 24 == 0) {
      // here we update the agent status rest and availability to work
      for (const agent of this.agents) {
        agent.resting = false;
        agent.done_for_the_day = false;
      }
      this.days++;
      this.hours = 0;
      this.distribute_time_coins();
    }
    if (this.days > 0 && this.days % 30 == 0) {
      this.months++;
      this.days = 0;

      this.termination_counter++;
      if (this.batch) {
        // save images every 3 months
        // if(this.months % 2 === 0)this.show();
        if(this.months % 12 === 0){
          this.show();
          const d = new Date();
          const milliseconds = Date.parse(d) / 1000;
          let save_txt = milliseconds + '_'+ batch_save_txt +  '_model';
          console.log(save_txt);
          // saveCanvas(save_txt, 'png');
        }

        if(this.termination_counter >= this.termination){
          this.terminated = true;
        }
      } else {
        if (this.termination_counter >= this.termination) {
          console.log('terminate');
          start_stop_model();
          const d = new Date();
          const milliseconds = Date.parse(d) / 1000;
          let save_txt = batch_save_txt + '_'+ milliseconds +'_model';
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