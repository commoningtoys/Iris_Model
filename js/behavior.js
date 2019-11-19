class Behavior {
  /**
   * how to transform the trading behaviors in numerals:
   * likeliness to do different task
   * likeliness to do the same task
   * likeliness to workaholicness 
   * likeliness to rest
   * the traits JSON Object 
   *   {
   *       curiosity:     [0, 1],
   *       perfectionism: [0, 1], // 
   *       endurance:    [0, 1], // endurance
   *       goodwill:    [0, 1]  // accumulate  
   *       planning: {Object}               
   *   }
   * @param {JSON} _traits is an object containing two values: tendency to rest over work and tendency to repeat same task over curiosity
   * @param {*} _agent 
   */
  constructor(_traits, _agent) {
    this.traits = _traits;
    this.agent = _agent;
    this.computed_traits = {
      curiosity: null,
      perfectionism: null,
      endurance: null,
      goodwill: null
    };
    this.result_traits = {
      curiosity: null,
      perfectionism: null,
      endurance: null,
      goodwill: null
    }
    this.planning = {
      plan: _traits.planning[0],
      distribution: _traits.planning[1]
    }
    // console.log(this.planning);
    // Object.keys(this.traits).forEach(key => {
    //   if(key !== 'trait'){
    //     this.computed_traits[key] = null;
    //   }
    // });
    // console.log(this.traits);
    let mx = 0;
    Object.keys(this.traits).forEach(key => {
      if (key !== 'trait' && key !== 'endurance' && key !== 'planning') {
        if (this.traits[key] >= mx) mx = this.traits[key];
      }
    });
    // console.log(mx)
    this.dominant_traits = [];
    Object.keys(this.traits).forEach(key => {
      if (key !== 'trait' && key !== 'endurance' && key !== 'planning') {
        if (this.traits[key] >= mx) this.dominant_traits.push(key);
      }
    });
    // console.log(this.dominant_traits);

  }
  /**
   * this method computes the three traits of the behavior and
   * returns whether the agent should take the task or choose another task
   * @param {Object} task 
   * @param {Object} agents 
   * @param {Object} agent 
   * @returns a boolean stating if he swapped or accepted the task
   */
  decide(task, agents, agent) {
    // console.log(agent.ID, this.dominant_traits)
    const task_name = task.type;
    const agent_archive = agent.preferenceArchive;

    this.compute_traits(agent_archive, task_name, agent, task, agents);;
    return this.compute_decision(agent, task);;
  }

  compute_traits(agent_archive, task_name, agent, task, agents) {
    this.computed_traits.curiosity = this.compute_curiosity(agent_archive, task_name);
    this.computed_traits.perfectionism = this.compute_perfectionism(agent, task_name);
    this.computed_traits.endurance = this.compute_endurance(agent, task, this.traits.endurance);
    this.computed_traits.goodwill = this.compute_goodwill(agent, agents, task);
    // console.log(this.computed_traits);
    // const sum = this.computed_traits.curiosity.value + this.computed_traits.perfectionism.value + this.computed_traits.endurance + this.computed_traits.goodwill.value;
    // console.log(`sum of traits: ${sum}`);
    this.result_traits = {
      curiosity: (this.computed_traits.curiosity.value * this.traits.curiosity),
      perfectionism: (this.computed_traits.perfectionism.value * this.traits.perfectionism),
      endurance: this.computed_traits.endurance,
      goodwill: (this.computed_traits.goodwill.value * this.traits.goodwill)
    };
  }

  compute_decision(agent, task) {
    // console.log('compute decision...');
    let result = false;
    let swap_value = 0;
    if (agent.spending_model) {
      Object.keys(this.result_traits).forEach(key => {
        if (key !== 'endurance' && key !== 'goodwill') {
          swap_value += this.result_traits[key];
        }
      });
    } else {
      Object.keys(this.result_traits).forEach(key => {
        if (key !== 'endurance') {
          swap_value += this.result_traits[key];
        }
      });
    }
    if(this.compute_resting(agent, task)) return true;
    // here the swapping happens
    if (swap_value > 0.5) { // make it a slider between 0.3 – 0.7
      // console.log('WORK')
      // add rest to the agent task archive
      result = false
    } else {
      // add rest to the agent task archive
      agent.push_to_decision_archive('swap');
      const swap_trait = random_arr_element(this.dominant_traits);
      // console.log('SWAP', swap_trait);
      // console.log(this, this.computed_traits[swap_trait])
      const swap_task = this.computed_traits[swap_trait].swap_task
      // console.log(`agent swaps for: ${swap_task}`);
      agent.assign_swapped_task(swap_task);
      result = true;
    }
    return result;
  }

  compute_resting(agent, task) {
    // console.log(agent);
    let result = false;
    // first we handle the case of resting therefore if endurance is lower than 0.3
    // if the agents endurance reaches a treshold
    // first we handle the case of the spending model
    if (agent.spending_model) {
      // first we need to get the archive of the decisions
      const decision_archive = agent.get_decision_archive()
      result = this.compute_decision_resting(decision_archive)
      if (result) {       
        // if the agent is resting than he rests
        agent.push_to_decision_archive('rest');
        // console.log('agent resting...', agent.ID);
        agent.rest(task);
      }
      return result;
    } else if (this.computed_traits.endurance < 0.3) {


      // in here we handle the coins aspect
      // does the agent have enough money?
      if (agent.time_coins >= task.aot) {
        // add rest to the agent task archive
        agent.push_to_decision_archive('rest');
        //if the agent has enough time coins he rests and tells the task that he rests
        // console.log('agent resting...');
        agent.rest(task);
        result = true;
        return result;
      } else {
        // here we update the stress value
        agent.increase_stress()
        // the agent can't rest
        return false
      }
    } else {
      return false
    }
  }
  compute_decision_resting(decision_archive) {
    let result = false;
    const work_archive = decision_archive.filter(result => result.decision === 'work');
    let last_decision = null;
    let curr_month = 0;
    if(work_archive.length > 0){
      last_decision = work_archive[work_archive.length - 1];
      curr_month = work_archive.filter(result => result.time.m === last_decision.time.m);
    }
    if(curr_month === undefined)console.log(curr_month);
    if (this.planning.plan === 'distributed') {
      // if the plan is distributed the agent should look at the past executions 
      // the tendency to rest will decrease by the distance
      if(last_decision === null){result = false;}
      else if(last_decision.time.m !== this.agent.get_inner_clock().m){result = false}
      else{
        const last_day = last_decision.time.d;
        const current_day = this.agent.get_inner_clock().d;
        const difference = current_day - last_day;
        const mult = Math.pow(2, difference)
        const probability = (100 - (difference * mult)) * 0.01;
        const test = Math.random();
        result = mult > probability ? true : false;
        // console.log(test, probability, result);
      }
    } else {
      result = this.compute_compact_resting(decision_archive)
    }
    return result
  }

  compute_compact_resting(decision_archive){
    let result = false;
    // let period_of_month = undefined;
    const current_day = this.agent.get_inner_clock().d;
    const agent_compact_plan = this.planning.distribution;
    // console.log(agent_compact_plan);
    if(current_day >= 1 && current_day <=10){
      // begin
      
      result = (agent_compact_plan === 'begin')
    }else if(current_day >= 11 && current_day <= 20){
      // middle
      result = (agent_compact_plan === 'middle')
    }else if(current_day >= 21 && current_day <= 30){
      // end
      result = (agent_compact_plan === 'end')
      
    }else{
      // error handling
      console.error(`error: a month has less than ${current_day} days!!`);
    }
    // console.log({current_day, agent_compact_plan, result});
    // wwe need to return the inverse of the result 
    // so that the agent say no when the compact plan matches and yes when it does not match
    return !result;
  }

  /**
   * this methods computes the curiosity of the agent
   * it checks how often the task has been done and
   * returns a value between [0,1]
   * @param {Array} agent_archive the archive of the agent's preferences
   * @param {String} task_name the task the agent s requested to execute
   * @returns an object with the computed value between [0, 1] and a suggested task to swap
   */
  compute_curiosity(agent_archive, task_name) {
    if (agent_archive.length > 1) {
      let archive = agent_archive;
      /**
       * first we extract the last 10 tasks and how often have been executed
       */
      const task_execution = [];
      if (agent_archive.length < 10) {

        // console.log(result)
      } else {
        // use only the last ten tasks of the archive
      }

      if (agent_archive.length > 10) {
        archive = [];
        for (let i = agent_archive.length - 11; i < agent_archive.length - 1; i++) {
          // console.log(i)
          // console.log(agent_archive[i])
          archive.push(agent_archive[i]);
        }
      }

      // fill with the data in the archive
      const executed_tasks = archive.map(result => result.executed_task);
      // console.log(executed_tasks);
      // const result = {};
      for (const task of TASK_LIST) {
        let sum = 0;
        for (const exec_task of executed_tasks) {
          if (exec_task === task.type) sum++
        }
        // task_execution[task.type] = sum;
        task_execution.push({
          name: task.type,
          num: sum
        })
      }

      // than we get how often this task the agent has executed
      // console.log(task_execution);
      const this_task_execution = task_execution.filter(result => result.name === task_name)[0];
      // console.log(this_task_execution);
      // we compute the curiosity by getting the inversve percentage
      // between the execution of this task and the total of task executions
      // this returns a value between [0, 1] that tends to 1 when the task has been
      // executed less often
      const result = 1 - this_task_execution.num / archive.length;
      // console.log(result)
      // this method also returns a suggestion for a task to be executed in the case
      // the agent decides to swap for another task
      // first we look for the task with minimum value
      // we sort the array by execution
      task_execution.sort((a, b) => a.num - b.num);
      // console.log(task_execution)
      const len = Math.floor(task_execution.length / 2);
      const less_executed_tasks = [];
      for (let i = 0; i < len; i++)less_executed_tasks.push(task_execution[i].name)
      // console.log(less_executed_tasks);
      // console.log(task_execution, this_task_execution, result);
      return {
        value: result,
        swap_task: random_arr_element(less_executed_tasks)
      };
    } else {
      // if we don't have enough data we just return 1
      return {
        value: 1,
        swap_task: task_name
      };
    }
  }
  /**
   * @param {Object} agent
   * @param {String} task_name
   * @returns an object with the computed value between [0, 1] and a suggested task to swap
   */
  compute_perfectionism(agent, task_name) {
    const result = {
      value: 0,
      swap_task: ''
    }
    if (agent.masterTask === task_name) {
      // console.log(agent)
      // if it is a match we return the max value 1
      result.value = 1;
      result.swap_task = task_name;
      return result;
    } else {
      // else we return the skill level in the range of [0, 1]
      // and we suggest the master task as swap task
      const val = agent.preferences[task_name]['skill_level'] / MAXIMUM;
      result.value = val;
      result.swap_task = agent.masterTask;
      return result;
    };
  }
  /**
   * this method computes the endurance of agent.
   * it is computed by looking at his wealth aka time coins
   * and compares it to the amount of time needed to complete the task
   * as this difference grows bigger the agent become less resilient. It also
   * takes in account its preference for that task the higher it is the more
   * resilient the agent will be.
   * maybe it should grow on top of FLD
   * @param {Object} agent 
   * @param {String} task_aot
   * @returns the endurance as avalue between [0, 1]
   */
  compute_endurance(agent, task, input_val) {
    const divider = agent.time_coins == 0 ? 1 : agent.time_coins;
    let perc_wealth = task.aot / divider;
    if (perc_wealth >= 1) perc_wealth = 1;
    // here we compute the preference for the task as value between [0,1]
    const perc_preference = agent.preferences[task.type].task_preference / MAXIMUM;
    /**
     * here we do a nudged median that gives preference 
     * advantage over wealth
     */

    const nudge = () => { // this should be available for other methods too...!
      if (perc_preference > perc_wealth) {
        return (perc_preference - perc_wealth) / 4
      } else return 0;
    };
    // than we sum them up and divide by 2 to get a median value
    // console.log(nudge())
    const tot_perc = ((perc_preference + perc_wealth) / 2) + nudge();
    // console.log(((input_val - 0.5) * 10) * tot_perc);
    const compute_input_tot = (((input_val - 0.5) * 10) * tot_perc) / MAXIMUM; // needs refactoring
    /**
     * we compute endurance on top of FLD therefore
     * we add the result between the input value, 
     * wealth and preference.
     */
    const top_fld = (MAXIMUM - agent.FLD) / MAXIMUM;
    const curr_fld = agent.FLD / MAXIMUM;
    const result = curr_fld + compute_input_tot;
    // const log = `
    // pref: ${perc_preference}\n
    // wealth: ${perc_wealth}\n
    // tot: ${tot_perc}\n
    // topfld: ${top_fld}\n
    // curr fld: ${curr_fld}\n
    // result curr: ${curr_fld * tot_perc}\n
    // result nofld: ${top_fld * tot_perc}\n
    // result curr: ${(curr_fld * tot_perc) + curr_fld}\n
    // result top: ${result}`
    // // console.log(log)
    if (result >= 1) return 1
    else if (result <= 0) return 0
    else return result;
  }
  /**
   * this methods computes the likeliness to choose a more renumerative
   * task rather than the assigned one. it takes in consideration the value of all the
   * tasks and compares it with the assigned task and returns a value and a preferred task
   * in case he wants to trade
   * @param {Object} agent the agent from the parent class
   * @param {Array} agents the pool of all agents
   * @param {Object} _task a task object
   * @returns an object with the computed value between [0, 1] and a suggested task to swap
   */
  compute_goodwill(agent, agents, _task) {
    // console.log(_task.value);
    const task_values = {}
    for (const task of TASK_LIST) {
      if (task.type !== _task.type) task_values[task.type] = agent.taskValue(agents, task.type) * task.amount_of_time;
    }
    task_values[_task.type] = _task.value
    // we compute the max
    let max = {
      name: '',
      value: 0
    }
    Object.keys(task_values).forEach(key => {
      if (task_values[key] >= max.value) {
        max.value = task_values[key];
        max.name = key
      }
    })
    // console.log(_task.type, task_values, max, _task.value / max.value);
    // here we see how our task does compared to the max one
    const result = {
      value: isNaN(_task.value / max.value) ? 0 : _task.value / max.value, // we avoid 0/0 giving NaN
      swap_task: max.name
    }
    // console.log(result)
    return result;
  }

  /**
   * to compute the preference for a task we look on how the task scored the
   * in the different traits areas. Than we take the one where it socred the higher
   * and we subtract the two who scored the worst  ad and we compute the sign [+, 0, -]
   * than we use the sign to add or remove value to the preference for that task.
   * this system has the advantage of being a more general way to update preference for a task,
   * as it take in consideration the fact that agents may prefer a task that doesn't
   * score good with the dominant trait, but that nevertheless has scored good with
   * the other traits, this could also be used to alter the traits, making the traits more dynamic
   * @param {Object} agent 
   * @param {Array} agents 
   * @param {Object} task 
   */
  update_task_preference(agent, task) {
    const curiosity = this.result_traits.curiosity;
    const perfectionism = this.result_traits.perfectionism;
    const goodwill = this.result_traits.goodwill;
    const endurance = this.result_traits.endurance;
    // console.log(curiosity, perfectionism, goodwill);
    const results = [curiosity, perfectionism, goodwill].sort();
    // console.log(results);
    const agent_pref = agent.preferences[task.type];
    const skill = agent_pref.skill_level / MAXIMUM;
    const skill_sum = skill > 0.5 ? skill : -(skill);
    const sum = Math.abs(results[2] - (results[0] + results[1])) > 0.5 ? 1 : -1;
    const agent_fld = (agent.FLD / MAXIMUM) - 0.5;
    agent_pref.task_preference += sum  * endurance * skill_sum;// this 25 is here to make the gain and drop in preference more marked
    agent_pref.task_preference = clamp(agent_pref.task_preference, MINIMUM, MAXIMUM);
  }
  setType(_traits) {
    this.traits = _traits;
  }
  get_endurance() {
    return this.computed_traits.endurance;
  }
}