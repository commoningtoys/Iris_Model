class Agent {
  constructor(id, _traits, model_type, monthly_hours) {
    this.ID = nf(id, 4);

    // here we should also populate the select element in the menu
    const select = document.getElementById('agents-list');
    const option = document.createElement('option');
    option.setAttribute('class', 'btn');
    option.value = this.ID;
    option.innerText = this.ID + ' ' + _traits.trait;
    select.appendChild(option)
    this.monthly_hours = monthly_hours;
    this.spending_hours = this.get_spending_hours(model_type);
    // console.log(model_type);
    this.spending_model = model_type === 'time-spending' ? true : false;

    this.behavior = _traits.trait;//_behavior;
    this.behavior_exp = new Behavior(_traits, this);
    this.time_coins = 0;
    this.resting = false;
    this.restingTimer = 0;
    this.preferences = this.makePreferences(TASK_LIST);//preferences for each single task
    const val = (10 + Math.floor(Math.random() * 40)) / 100;
    this.forget_rate = val;
    this.step = 10;
    // console.log(this.forget_rate)
    /**
     * if the agent is perfectionist we need to define
     * the task he wants to master
     */
    // if (this.behavior === 'perfectionist') {
    let max = 0;
    let myObj = this.preferences;
    let result = ''
    Object.keys(myObj).forEach(key => {
      let pref = myObj[key].skill_level;
      let name = myObj[key].task_name;
      // console.log(pref, name)
      if (pref > max) {
        max = pref;
        result = name;
      }
    });
    result = random_arr_element(Object.keys(this.preferences))
    // the master tast is the one with higher skill level
    this.masterTask = result;
    // console.log(this.masterTask);
    // }

    // the next attributes are used for the trading system,
    this.swap_task = '';// this defines the task the agent wants to do
    this.has_swapped = false;// if has swapped than it will be selecteds for the trade task
    this.totalTaskCompleted = 0;
    this.totalTaskCompletedByAgents = 0;

    this.done_for_the_day = false;
    const year = new Date().getFullYear();
    this.initial_date = new Date(year, 0, 1);
    this.parsed_clock = this.initial_date;
    this.inner_clock = {}

    this.currentTask = '';
    this.FLD = MAXIMUM; //this.behavior === 'capitalist' ? 100 : randomMinMAx();// feel like doing
    this.solidarity = randomMinMAx();
    this.stress = 0;// we will need this to see how stressed the agents are, the stress will increase when the agents can't rest while FLD is 0
    this.stress_decrease_val = 1.5;
    this.stress_increase_val = 1;
    this.ability = true;
    this.wasBruteForced = false;
    // working attributes
    this.working = false;
    this.workingTimer = 0;// how long is the agent at work

    this.decision_archive = [];

    this.mappedAmountOfTime = 0;
    this.colors = {
      work: color(255, 0, 0),
      rest: color(255, 255, 0),
      swap: color(0, 255, 0),
      unable: color(125)
    };
    this.showStatistics = false;
    this.preferenceColors = {
      skill: color(0, 255, 0),
      preference: color(255, 0, 255),
      FLD: color(0, 255, 255),
      time_coins: color(255, 0, 0),
      stress: color(255, 255, 0),
      time: color(45, 105, 245),
      swapped: color(0, 255, 100, 100),
      brute_force: color(255, 125, 0, 100)
    };

    this.preferenceArchive = [];
    this.data = [];
    this.data_point = {
      preferences: this.preferences,
      executed_task: null,
      time_coins: this.time_coins, // this maps the value to a better scale¿
      feel_like_doing: this.FLD,
      spending_hours: this.spending_hours,
      stress_level: this.stress,
      amount_of_time: this.mappedAmountOfTime,
      swapped: this.has_swapped,// === true ? this.swap_task : '',
      brute_force: this.wasBruteForced,
      // inner_clock: this.inner_clock,
      parsed_clock: this.parsed_clock
    };

    this.memory = new Memory(this.data_point)


    this.recordData = false;
  }
  /**
   * 
   */
  // makeInfo(agents) {
  //   let myDiv = document.createElement('div');
  //   $(myDiv).html(this.htmlText())
  //     .addClass('content')
  //     .attr('id', this.ID)
  //     .click(() => {
  //       this.showStatistics = true;
  //       for (const agent of agents) {// this needs to be refactored
  //         if (this !== agent) agent.showStatistics = false;
  //       }
  //     });// here we set the agent to be shown in show function
  //   $('.info').append(myDiv);
  // }
  /**
   * 
   */
  // setInfo() {
  //   // to update the infos
  //   document.getElementById(this.ID).innerHTML = this.htmlText();
  // }
  /**
   * 
   */
  // htmlText() {
  //   const BR = '<br>';
  //   let str1 = '<b>AGENT: ' + this.ID + '</b>' + BR;
  //   let str11 = '<b>behavior: ' + this.behavior_exp.traits.trait + '</b>' + BR;
  //   let str12 = '<b>behavior traits:</b>' + BR;
  //   str12 += "<div class = 'preference'>";
  //   Object.keys(this.behavior_exp.result_traits).forEach(key => {
  //     str12 += "<strong>" + key + "</strong>: " + roundPrecision(this.behavior_exp.result_traits[key], 3) + "<br>";
  //   })
  //   str12 += "</div><br>";
  //   let str2 = (this.working == true ? 'doing this task: ' + BR + this.currentTask : 'is not working' + BR) + BR;
  //   let str21 = 'working timer: ' + BR + this.workingTimer + BR;
  //   let str22 = (this.done_for_the_day == true ? 'agent is done for today' : 'agent is available to work') + BR;
  //   let str3 = (this.has_swapped === true ? 'has swapped for: ' + BR + this.swap_task : 'has not swapped' + BR) + BR;
  //   let str31 = (this.resting === true ? `is resting` : 'not resting') + BR;
  //   let str4 = 'feel like doing: ' + this.FLD + BR;
  //   let str5 = 'time coins: ' + this.time_coins + BR;
  //   let str6 = '<div class="toggle">preferences:';
  //   //iterating through all the item one by one.
  //   Object.keys(this.preferences).forEach(val => {
  //     //getting all the keys in val (current array item)
  //     let keys = Object.keys(this.preferences[val]);
  //     let objAttribute = this.preferences[val];
  //     //assigning HTML string to the variable html
  //     str6 += "<div class = 'preference'>";
  //     //iterating through all the keys presented in val (current array item)
  //     keys.forEach(key => {
  //       //appending more HTML string with key and value aginst that key;
  //       // str6 += "<strong>preferences</strong> <br>"
  //       if (!key.startsWith('forget')) str6 += "<strong>" + key + "</strong>: " + roundPrecision(objAttribute[key], 2) + "<br>";
  //     });
  //     //final HTML sting is appending to close the DIV element.
  //     str6 += "</div><br>";
  //   });
  //   str6 += '</div>';
  //   return str1 + str11 + str12 + str2 + str21 + str22 + str3 + str31 + str4 + str5 + str6;
  // }

  set_time(time_obj) {
    const h = this.initial_date.getHours();
    const d = this.initial_date.getDate();
    const m = this.initial_date.getMonth() + 1;
    const y = this.initial_date.getFullYear() + time_obj.y;

    // console.log(`h: ${h} || d: ${d} || m: ${m} || y: ${y}`);
    const str = `${time_obj.m + 1}/${time_obj.d}/${y}  ${time_obj.h}:00`
    // // console.log(str);
    // const model_date = new Date(str);
    // console.log(model_date);
    this.parsed_clock = new Date(str)
    this.inner_clock = time_obj;
  }
  /**
   * @returns agent innerclock in date format
   */
  get_date() {
    return this.parsed_clock;
  }
  get_inner_clock() {
    return JSON.parse(JSON.stringify(this.inner_clock));
  }
  push_to_decision_archive(_decision) {
    // TO DO check if the object is correct!
    // obj should be made by a: whether agent has worked, swapped or rested
    // a time reference
    const obj = {
      decision: _decision,
      time: this.get_inner_clock()
    }
    this.decision_archive.push(obj)
  }
  get_decision_archive() {
    return JSON.parse(JSON.stringify(this.decision_archive));
  }
  get_spending_hours(model_type) {
    if (model_type === 'time-spending') return this.monthly_hours
    else return 1;
  }

  reset_spending_time() {
    // console.log(this.spending_hours);
    // this.spending_hours = this.monthly_hours;
    if (this.spending_hours <= 0) {
      // this.spending_hours += this.monthly_hours;
      this.spending_hours = this.monthly_hours;
    } else {
      // this agent has not used up all his monthly hours
      // what to do?
      this.spending_hours = this.monthly_hours + this.spending_hours;
    }
    // let update_hours = 0;
    // if(this.spending_hours > 0){
    //   update_hours = this.spending_hours;
    // }
    // this.spending_hours = this.monthly_hours + update_hours;
  }
  /**
   * 
   */
  show() {
    if (this.showStatistics) {
      background(51)
      // this.infographic();
    }
  }
  /**
   * 
   */
  infographic() {
    const INFO_WIDTH = width - LEFT_GUTTER;
    let ROW_NUMBER = 0;
    ROW_NUMBER += (ROWS + parseInt(this.ID)) % ROWS;
    ROW_NUMBER *= 2;
    const CT = this.currentTask;
    // here we extract the values of FLD, resting time && stress && more
    let fld = this.preferenceArchive.map(result => result.feel_like_doing);
    let rt = this.preferenceArchive.map(result => result.time_coins);
    let stress = this.preferenceArchive.map(result => result.stress_level);
    let aot = this.preferenceArchive.map(result => result.amount_of_time);
    let swapped = this.preferenceArchive.map(result => result.swapped);
    // console.log(swapped);
    let bruteForce = this.preferenceArchive.map(result => result.brute_force);
    // and here we draw them in the infographic
    stroke(255);
    // FIrst we draw the infographic outline
    line(posX(0, MAXIMUM), posY(MAXIMUM, ROW_NUMBER), posX(0, MINIMUM), posY(MINIMUM, ROW_NUMBER));
    line(posX(0, MAXIMUM), posY(MINIMUM, ROW_NUMBER), posX(MAXIMUM, MAXIMUM), posY(MINIMUM, ROW_NUMBER));
    let i = 0;
    for (const el of TASK_LIST) {
      line(posX(0, MAXIMUM, i, TASK_LIST.length), posY(MAXIMUM, ROW_NUMBER - 1), posX(0, MINIMUM, i, TASK_LIST.length), posY(MINIMUM, ROW_NUMBER - 1));
      line(posX(0, MAXIMUM, i, TASK_LIST.length), posY(MINIMUM, ROW_NUMBER - 1), posX(MAXIMUM, MAXIMUM, i, TASK_LIST.length), posY(MINIMUM, ROW_NUMBER - 1));
      i++;
    }
    // here we draw when an agent has swapped or has been brute forced to do a task
    drawLine(swapped, this.preferenceColors.swapped, ROW_NUMBER);
    drawLine(bruteForce, this.preferenceColors.brute_force, ROW_NUMBER);
    // here below we draw the information about the preferences of the agent
    printGraphic(`AGENT_ID${this.ID}\n${this.behavior_exp.traits.trait}\nFLD`, fld, this.preferenceColors.FLD, ROW_NUMBER);
    printGraphic('\n\n\nRESTING TIME', rt, this.preferenceColors.time_coins, ROW_NUMBER);
    printGraphic('\n\n\n\nSTRESS', stress, this.preferenceColors.stress, ROW_NUMBER);
    printGraphic('', aot, this.preferenceColors.time, ROW_NUMBER);
    // here we extract preferences and we NEEDS REFACTORING!!
    let j = 0;
    for (const el of TASK_LIST) {
      let pref = this.preferenceArchive.map(result => result.preferences[el.type]);
      let taskSkill = pref.map(result => result.skill_level);
      let taskPref = pref.map(result => result.task_preference);

      printGraphic('', taskSkill, this.preferenceColors.skill, ROW_NUMBER - 1, j, TASK_LIST.length);
      printGraphic('', taskPref, this.preferenceColors.preference, ROW_NUMBER - 1, j, TASK_LIST.length);
      j++;
    }
    function printGraphic(str, arr, col, row_number, col_number, tot_col) {
      let colNumber = col_number || 0;
      let totCol = tot_col || 1;
      noStroke();
      fill(col);
      text(str, PADDING / 2, posY(MAXIMUM, row_number));
      noFill();
      stroke(col);
      strokeWeight(1);
      let i = 0;
      beginShape();
      for (const val of arr) {
        let currX = posX(i, arr.length, colNumber, totCol);
        let currY = posY(val, row_number);
        vertex(currX, currY);
        i++;
      }
      endShape();
    }

    function drawLine(arr, col, row_number) {
      strokeWeight(0.5);
      stroke(col);
      let index = 0;
      for (const val of arr) {
        if (val === true) {
          let x = posX(index, arr.length);
          line(x, posY(MINIMUM, row_number), x, posY(MAXIMUM, row_number)); //posY(MINIMUM, ROW_NUMBER), posX(MAXIMUM, MAXIMUM), posY(MINIMUM, ROW_NUMBER)
        }
        index++;
      }
    }

    function posX(index, max, col_number, tot_col) {
      let col = col_number || 0;
      let colNumber = tot_col || 1;
      let W = (INFO_WIDTH - PADDING) / colNumber;

      return LEFT_GUTTER + map(index, 0, max, col * W, (col + 1) * W);
    }
    function posY(val, row_number) {
      return 2 * (INFO_HEIGHT + PADDING) + ((INFO_HEIGHT + PADDING) * row_number) - map(val, MINIMUM, MAXIMUM, 0, INFO_HEIGHT);
    }
  }
  /**
   * here the agent works
   */
  update() {
    // make the task archive constarined within a max value
    if (this.decision_archive.length > DATA_POINTS) {
      this.decision_archive.splice(0, 1);
    }
    /**
     * here we need to add the resting 
     * similar to working. resting should also get a timer
     */
    if (this.playerWorking) {
      this.playerTimer++;
      $('#timer').html(this.playerTimer);
      this.setInfo();
    }

    if (this.working && !this.isPlayer) {

      this.workingTimer -= timeUpdate();
      // this.setInfo();
      if (this.workingTimer <= 0) {
        this.has_swapped = false;// reset to false, very IMPORTANT otherwise the agent will always be called to do a swapped task
        this.swap_task = '';
        this.working = false;
        this.currentTask = '';
        this.done_for_the_day = true;
        // this.setInfo();
      }
    }
  }
  /**
   * We will need this later
   */
  setPosition(x, y) {
    this.pos.x = x;
    this.pos.y = y;
  }
  swap_2(task, agents) {
    // console.log('deciding...')
    // if (this.spending_model) {
    //   // console.log(`agent_${this.ID} is deciding`);
    //   return this.behavior_exp.decide_2(task, agents, this);
    // }
    // else {
    return this.behavior_exp.decide(task, agents, this);
    // }
  }

  increase_stress(mult) {
    const multiplier = mult || 1;
    this.stress += this.stress_increase_val * multiplier;
    this.stress = clamp(this.stress, MINIMUM, MAXIMUM);
  }

  taskValue(agents, task_name) {
    let counter = agents.length;
    const NUMBER_OF_AGENTS = agents.length;
    for (const agent of agents) {
      // we go through all the agents if their preferred task matches 
      // this task we add one to the counter
      const preference = agent.preferredTask();
      if (preference === task_name) {
        counter--;
      }
    }
    return ((NUMBER_OF_AGENTS - counter) / NUMBER_OF_AGENTS);
  }


  /**
   * sets the agent at work for a given amount of time
   * @param {Number} amount_of_time 
   */
  work(task, agents, brute_forced) {
    // console.log('work...');

    this.push_to_decision_archive('work');
    const skill = this.getPreferences(task.type).skill_level;
    const amount_of_time = this.spending_model == true ? task.aot : task.amountOfTimeBasedOnSkill(skill);

    // here we handle the time of the spending model
    if (this.spending_model && brute_forced === false) {
      this.spending_hours -= amount_of_time;
    }

    this.working = true;
    this.workingTimer = amount_of_time;
    this.updateAttributes(task, agents, amount_of_time, brute_forced);
    this.currentTask = task.type;// we set the current task according to the task the agent is currently working on
    // this.setInfo();
    // this.makeInfo(`AGENT: ${this.ID} is executing ${task.type}. It will take ${amount_of_time} ticks`);
  }

  rest(task) {
    if (!this.spending_model) {
      this.time_coins -= task.aot; // we could also double this amount
      task.updateGRT(task.aot);
    }
    // this.time_coins /= 2;// here add slider that chenges how much resting time is decreased
    // this.makeInfo(`AGENT: ${this.ID} is resting. Resting time ${this.time_coins}`);
    // console.log(`AGENT: ${this.ID} is resting. Behavior ${this.behavior} Resting time ${this.time_coins}`);
    this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
    this.resting = true;
    this.restingTimer = task.aot;
    // when the agent has rested he also is less stressed
    this.stress /= this.stress_decrease_val;
    // this.updateAttributes(task, true);
    // this.setInfo();
  }

  assign_swapped_task(task_name) {
    // console.log('swap...')
    this.has_swapped = true;
    this.swap_task = task_name;
    // this.setInfo();
  }

  /**
   * @returns a random task
   */
  randomTask(task_name) {

    // here we can check the preference for the task?

    // swapped task should be different than this task
    let result = ''
    let loop = true;
    while (loop) {
      // const index = Math.floor(Math.random() * this.preferences.length);
      let randObj = random(TASK_LIST);
      if (randObj.type !== task_name) {
        result = randObj.type;
        loop = false;
        break;
      }
    }
    // console.log(`result: ${result}`)
    return result;
  }
  /**
   * 
   * @param {Array} task 
   * @param {Array} agents 
   */
  updateAttributes(task, agents, _amount_of_time, brute_forced) {
    /**
     * - resting time (++) increases by some value depending on the value of the task
     * - preference (could be fixed, or updating, as described on the left); 
     * - laziness (+++) increase to maximum after having completed a task, then slowly decrease
     * - skill (+) a small increase in skill for the task the agent completed
     * - solidarity changes only if the agent has taken up a task instead of a NOT_able_agent (+)
     * - ability randomly goes to false (or true)
     * - occupied (true) agent becomes occupied when doing the task (not trading);
     *   it stays occupied for the duration of Taks's amount of time
     */
    this.updateCompletedTasks(task.type);
    this.updateFLD(agents, task, brute_forced);
    this.time_coins += task.value;// * task_executed == true ? 1 : -1;
    // console.log(this.time_coins, task.value)
    // console.log(`executed ${task.type}: ${this.time_coins}, value: ${task.value}`);
    const arr = TASK_LIST.map(result => result.amount_of_time);
    const max = Math.max(...arr);
    this.mappedAmountOfTime = map(_amount_of_time, 0, max + (max / 2), MINIMUM, MAXIMUM);
    this.wasBruteForced = brute_forced || false;



    this.updatePreferences(task, agents);
    /**
     * the magic trick below let us to push the preferences
     * without copying the reference to the original array 
     */
    const insert = JSON.parse(JSON.stringify(this.preferences));// the trick
    this.data_point = {
      preferences: insert,
      executed_task: task.type,
      time_coins: this.time_coins, // this maps the value to a better scale¿
      feel_like_doing: this.FLD,
      spending_hours: this.spending_hours,
      stress_level: this.stress,
      amount_of_time: this.mappedAmountOfTime,
      swapped: this.has_swapped,// === true ? this.swap_task : '',
      brute_force: this.wasBruteForced,
      // inner_clock: this.inner_clock,
      parsed_clock: this.parsed_clock
    }
    // this.setInfo();
  }

  add_data_to_archive() {

    this.preferenceArchive.push(this.data_point);
    this.memory.add_memory(this.data_point);
    if (this.preferenceArchive.length > DATA_POINTS) this.preferenceArchive.splice(0, 1);
    if (this.recordData) {
      this.data.push(this.data_point);
    }

  }

  updatePreferences(_task, agents) {
    /**
     * the preferences (skill & preference for a task) get updated
     * according on how often the same task has been done in a row
     * as often as the same task is done as much skill you gain
     * but you also get bored of the task therefore you lose preference
     * while skill and preference get updated the skill and preference of the
     * tasks that have not been executed  also get inversely updated 
     * a.k.a. you forget how to do a task
     */
    let lastPreferences = this.data_point.preferences;
    // let tasksCompleted = {};
    // let result = {};
    // let executedTask = this.preferenceArchive.map(result => result.executed_task);
    // console.log(executedTask); 
    /**
     * here we compute the skill of each single agent.
     * The skill in our model is a quantitative measure,
     * it looks how often the skill has been executed and compares it
     * with how often the other have executed the same task.
     * therefore the agent who has executed the task the most is the more 
     * skilled, and so on.
     */
    for (const task of TASK_LIST) {
      /**
       * here we compute the which agent has executed a task 
       * the most
       */
      let max = 0;
      for (const a of agents) {
        if (a.preferenceArchive.length > 0) {
          lastPreferences = a.preferenceArchive[a.preferenceArchive.length - 1].preferences;
          if (lastPreferences[task.type].completed > max) max = lastPreferences[task.type].completed;
        }
      }
      /**
       * here we check how often an agent has completed this task.type
       */

      if (task.type === _task.type) {
        // here we update the skill for the task the agent has executed
        let completed = this.data_point.preferences;
        let sum = max == 0 ? 0 : (completed[task.type].completed / max);
        // console.log(sum, this.forget_rate, sum - this.forget_rate);
        // we can include something else here on how to update the skill
        // this.preferences[task.type].skill_level += (sum - this.forget_rate) * this.step;

        // console.log(sum, sum * this.step, task.type, this.ID)
        this.preferences[task.type].skill_level += sum * this.step;

        this.preferences[task.type].skill_level = clamp(this.preferences[task.type].skill_level, MINIMUM, MAXIMUM);
      }
      this.preferences[task.type].forget_skill();
    }

    this.behavior_exp.update_task_preference(this, _task);
  }
  /**
   * updates the completed task preference by adding +1
   * @param {String} task_name 
   */
  updateCompletedTasks(task_name) {
    this.totalTaskCompleted++;
    let myObj = this.preferences;
    Object.keys(myObj).forEach(key => {
      if (myObj[key].task_name === task_name) {
        myObj[key].completed++;
      }
    });
  }

  updateFLD(agents, task, brute_forced) {// rename me: motivation
    /**
      * this algorithm looks how much the other agents have been 
      * working. If the others are working more than this agent then
      * his FLD decreases slower, if he is working more than it 
      * decreses faster.
      * it could be possible to introduce the concept of groups here where 
      * the agents looks only how the group performs
      */
    if (brute_forced) {
      // here we manage the decrease in FLD when the agents are forced to do a task
      this.FLD /= 2;

    } else {
      // here their normal behavior when executing a task
      let otherTasksCompleted = [];
      for (const agent of agents) {
        if (agent !== this) otherTasksCompleted.push(agent.totalTaskCompleted);
      }

      const max = Math.max(...otherTasksCompleted);// magic trick
      // let result = (this.totalTaskCompleted / (this.totalTaskCompletedByAgents / this.numberOfAgents));
      let result = Math.floor((this.totalTaskCompleted / max) * 5); // <= hard-coded value
      this.FLD -= result;

    }
    this.FLD = clamp(this.FLD, MINIMUM, MAXIMUM);
  }

  /**
   * @param {String} task_name 
   * @return the preferences of that specific task
   */
  getPreferences(task_name) {
    let result = {};
    let myObj = this.preferences;
    Object.keys(myObj).forEach(key => {
      if (myObj[key].task_name === task_name) {
        result = myObj[key];
      }
    });
    return result;
  }

  /**
   * @returns the preferred task of an agent
   */
  preferredTask() {
    let max = 0;
    let myObj = this.preferences;
    let result = ''
    Object.keys(myObj).forEach(key => {
      let pref = myObj[key].task_preference;
      let name = myObj[key].task_name;
      if (pref > max) {
        max = pref;
        result = name;
      }
    });
    return result;
  }
  /**
   * @returns the preferences as an array of 10 elements
   */
  getPreferencesAsObject() {
    let obj = {
      FLD: this.FLD,
      stress: this.stress,
      time_coins: this.time_coins,
      amount_of_time_task: this.mappedAmountOfTime,
      swapped: this.has_swapped,
      brute_force: this.wasBruteForced
    };
    // arr.push(this.FLD);
    // arr.push(this.time_coins);
    // arr.push(this.stress);
    // arr.push(this.mappedAmountOfTime);
    Object.keys(this.preferences).forEach(val => {
      let keys = Object.keys(this.preferences[val]);
      let objAttribute = this.preferences[val];
      keys.forEach(key => {
        if (key === 'skill_level' || key === 'task_preference') obj[key] = objAttribute[key];
      });
    });
    return obj;
  }
  /**
   * @param {Array} arr Array of task objects
   * @returns an Object with the preference for each task
   */
  makePreferences(arr) {
    const PREFERENCE_OFFSET = 30;

    let result = {};
    for (const el of arr) {
      let skill = Math.floor(randomMinMAx() / 2);
      // result[el.type] = {
      //   task_name: el.type,
      //   completed: 0, // how many times the task has been completed
      //   skill_level: skill,
      //   task_preference: this.calculatePreference(skill, PREFERENCE_OFFSET)
      // }
      result[el.type] = {
        task_name: el.type,
        completed: 0, // how many times the task has been completed
        skill_level: 0,
        task_preference: 0,
        forget_rate: (10 + Math.floor(Math.random() * 10)) / 100,
        forget_skill: () => {
          // console.log('forget rate ' + el.type + ' ' + result[el.type].forget_rate)
          // console.log('skill before ' + el.type + ' ' + result[el.type].skill_level);
          result[el.type].skill_level -= (result[el.type].forget_rate * this.step)
          result[el.type].skill_level = clamp(result[el.type].skill_level, MINIMUM, MAXIMUM);
          // console.log('skill after ' + el.type + ' ' + result[el.type].skill_level)
        }
      }
    }
    // console.log(result);
    return result;
  }

  /**
   * computes the preference based on skill and preference offset
   * @param {Number} skill 
   * @param {Number} offset 
   * @returns the result of the calculation
   */
  calculatePreference(skill, offset) {
    let result = 0;
    result = skill + (-offset + (Math.floor(Math.random() * offset * 2)));
    if (result < MINIMUM) result = MINIMUM;
    if (result > MAXIMUM) result = MAXIMUM
    return result;
  }






  /**
   * PLAYER ZONE
   */

  /**
  * 
  * @param {*} task 
  */
  playerInteraction(task, agents) {
    this.playerTaskToExecute = task;
    // needs to be done in the index.html
    $('.player-interface').toggle();
    // console.log($('.player-interface')[0].attributes[1].value)
    document.getElementById('task-name').innerText = task.type;
    // $('#yes').val = this.ID;
    document.getElementById('yes').value = this.ID;// we set the ID as value so we can use it later to find the agent in the array
    // let interactionP = document.createElement('p');
    // here we handle a positive answer
    // $('#yes').click(() => {
    //     // here a new window should open
    //     // this.work()
    // });
    // the following code is to keep the first option always selected
    document.getElementById('other-tasks').options[0].selected = true;
    let i = 0;
    for (const t of TASK_LIST) {
      if (t.type !== task.type) {
        $('#task-' + (i + 1))
          .text(t.type + ': ' + Math.floor(this.taskValue(agents, t.type) * TIME_SCALE * TS_FRACTION))
          .val(t.type);
        i++
      }
    }
    this.taskValue(agents, task.type)
    document.getElementById('task-value').textContent = task.value;
    document.getElementById('resting-time').textContent = this.time_coins;
    document.getElementById('spending-resting-time').textContent = task.aot;
    if (this.time_coins <= task.aot) {
      document.getElementById('rest-interaction').style.display = 'none';
    }
    else {
      document.getElementById('rest-interaction').style.display = 'block';
    }
  }
  /**
   * ADD DESCRIPTION
   * @param {*} agents 
   */
  playerWorks(agents) {
    // here the player timer should start
    noLoop();
    console.log('noLoop');
    $('.player-work').show();
    this.working = true;
    // this.updateAttributes(this.playerTaskToExecute, agents);
    this.currentTask = this.playerTaskToExecute.type;

    this.setInfo();
    // console.log('player works!', this.working);
    // let skill = this.getPreferences(this.playerTaskToExecute.type).skill_level;
    // console.log(skill);
    // let time = this.playerTaskToExecute.amountOfTimeBasedOnSkill(skill);
    // this.work(time, this.playerTaskToExecute, agents);
  }
  /**
   * 
   * @param {*} task_name 
   */
  playerTrades(task_name) {
    const task_to_trade = task_name.replace(/[\d\W]/g, '');
    console.log(task_to_trade);
    this.has_swapped = true;
    console.log(this.has_swapped);
    this.swap_task = task_to_trade;
    console.log(this.swap_task);
    this.setInfo();
    // console.log(this);
  }

  playerRests() {
    console.log(this.playerTaskToExecute);
    const task = this.playerTaskToExecute;
    this.time_coins -= task.aot;
    task.updateGRT(task.aot);
    // this.time_coins /= 2;// here add slider that chenges how much resting time is decreased
    // this.makeInfo(`AGENT: ${this.ID} is resting. Resting time ${this.time_coins}`);
    // console.log(`AGENT: ${this.ID} is resting. Behavior ${this.behavior} Resting time ${this.time_coins}`);
    this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
    this.resting = true;
    this.restingTimer = task.aot;
    loop();
    // this.updateAttributes(task, true);
    this.setInfo();
  }

}



