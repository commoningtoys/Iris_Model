class Agent {
  constructor(id, _traits, model_type, monthly_hours) {
    const id_len = 4 - id.toString(10).length;
    let zeroes = ''; 
    for(let i = 0; i < id_len; i++)zeroes += '0'
    this.ID = zeroes + id;

    // here we should also populate the select element in the menu
    const select = document.getElementById('agents-list');
    const option = document.createElement('option');
    option.setAttribute('class', 'btn');
    option.value = this.ID;
    option.innerText = this.ID + ' ' + _traits.trait;
    select.appendChild(option);

    this.spending_model = model_type === 'time-spending' ? true : false;
    this.monthly_hours = model_type === 'time-spending' ? monthly_hours : 0;
    this.spending_hours = this.get_spending_hours(model_type);
    // console.log(model_type);

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
    this.decision = '';

    this.mappedAmountOfTime = 0;
    this.showStatistics = false;

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
      parsed_clock: this.parsed_clock,
      decision: this.decision
    };

    this.memory = new Memory(this.data_point)


    this.recordData = false;
  }

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
    this.decision_archive.push(obj);
    this.decision = _decision;
  }
  get_decision_archive() {
    return JSON.parse(JSON.stringify(this.decision_archive));
  }
  get_spending_hours(model_type) {
    if (model_type === 'time-spending') return this.monthly_hours
    else return 1;
  }

  reset_spending_time() {
    // this.spending_hours = this.monthly_hours;
    if (this.spending_hours <= 0) {
      this.spending_hours += this.monthly_hours;
      // this.spending_hours = this.monthly_hours;
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
        this.data_point.executed_task = this.currentTask;
        this.currentTask = '';
        this.done_for_the_day = true;
        // this.setInfo();
      }
    }
  }
  swap_2(task, agents) {
    return this.behavior_exp.decide(task, agents, this);
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
    // console.log('work...', this.ID);
    const decision = brute_forced === true ? 'brute-forced' : 'work'
    this.push_to_decision_archive(decision);
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

    // this.setInfo();
  }

  add_data_to_archive() {

    /**
     * the magic trick below let us to push the preferences
     * without copying the reference to the original array 
     */
    const insert = JSON.parse(JSON.stringify(this.preferences));// the trick
    this.data_point.preferences = insert;
    // this.data_point.executed_task = this.currentTask;
    this.data_point.time_coins = this.time_coins; // this maps the value to a better scale¿
    this.data_point.feel_like_doing = this.FLD;
    this.data_point.spending_hours = this.spending_hours;
    this.data_point.stress_level = this.stress;
    this.data_point.amount_of_time = this.mappedAmountOfTime;
    this.data_point.swapped = this.has_swapped;// === true ? this.swap_task  = '';
    this.data_point.brute_force = this.wasBruteForced;
    // inner_clock = this.inner_clock;
    this.data_point.parsed_clock = this.parsed_clock;
    this.data_point.decision = this.decision;


    // console.log(this.decision);
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



