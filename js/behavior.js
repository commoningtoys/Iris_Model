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
    // Object.keys(this.traits).forEach(key => {
    //   if(key !== 'trait'){
    //     this.computed_traits[key] = null;
    //   }
    // });
    // console.log(this.traits);
    let mx = 0;
    Object.keys(this.traits).forEach(key => {
      if (key !== 'trait' && key !== 'endurance') {
        if (this.traits[key] >= mx) mx = this.traits[key];
      }
    });
    // console.log(mx)
    this.dominant_traits = [];
    Object.keys(this.traits).forEach(key => {
      if (key !== 'trait' && key !== 'endurance') {
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
    this.computed_traits.curiosity = compute_curiosity(agent_archive, task_name);
    this.computed_traits.perfectionism = compute_perfectionism(agent, task_name);
    this.computed_traits.endurance = compute_endurance(agent, task);
    this.computed_traits.goodwill = compute_goodwill(agent, agents, task);
    // console.log(this.computed_traits);
    // const sum = this.computed_traits.curiosity.value + this.computed_traits.perfectionism.value + this.computed_traits.endurance + this.computed_traits.goodwill.value;
    // console.log(`sum of traits: ${sum}`);
    this.result_traits = {
      curiosity: (this.computed_traits.curiosity.value * this.traits.curiosity),
      perfectionism: (this.computed_traits.perfectionism.value * this.traits.perfectionism),
      endurance: (this.computed_traits.endurance + this.traits.endurance) / 2,// endurance won't be part of the swap
      goodwill: (this.computed_traits.goodwill.value * this.traits.goodwill)
    }
    let swap_value = 0;
    Object.keys(this.result_traits).forEach(key => {
      if (key !== 'endurance') {
        // console.log(key)
        swap_value += this.result_traits[key];
      }
    });
    // swap_value /= 2;
    // console.log(task.type, agent.behavior)
    // console.log(this.traits);
    // console.log(this.computed_traits);
    // console.log(this.result_traits);
    // console.log(swap_value);
    // first we handle the case of resting therefore if endurance is lower than 0.3
    // console.log(this.traits.trait)
    // console.log(`behavior: ${agent.time_coins} && ${task.aot}`)
    if (this.computed_traits.endurance < 0.3 && agent.time_coins >= task.aot) {
      // in here we handle the coins aspect
      // does the agent have enough money?
      // console.log('agent resting...');
      agent.rest(task);
      return true;
    } else if (swap_value > 0.7) {
      // console.log('WORK')
      return false
    } else {
      // console.log('SWAP');
      const swap_trait = random_arr_element(this.dominant_traits);
      // console.log(this, this.computed_traits[swap_trait])
      const swap_task = this.computed_traits[swap_trait].swap_task
      // console.log(`agent swaps for: ${swap_task}`);
      agent.assign_swapped_task(swap_task);
      return true;
    }
    // comp_cur + comp_perf + comp_res + comp_acc = [0, 4]
    // return true
    /**
     * this methods computes the curiosity of the agent
     * it checks how often the task has been done and
     * returns a value between 
     * @param {Array} agent_archive the archive of the agent's preferences
     * @param {String} task_name the task the agent s requested to execute
     * @returns an object with the computed value between [0, 1] and a suggested task to swap
     */
    function compute_curiosity(agent_archive, task_name) {
      if (agent_archive.length > 1) {
        /**
         * first we extract all the task and how often have been executed
         */
        const task_execution = [];
        for (const task of TASK_LIST) {
          const executed_tasks = agent_archive.filter(result => result.executed_task === task.type).length;
          let result = {
            name: task.type,
            executions: executed_tasks
          }
          task_execution.push(result);
        }
        // than we get how often this task the agent has executed
        const this_task_execution = task_execution.filter(result => result.name === task_name)[0];
        // we compute the curiosity by getting the inversve percentage
        // between the execution of this task and the total of task executions
        // this returns a value between [0, 1] that tends to 1 when the task has been
        // executed less often
        const result = 1 - this_task_execution.executions / agent_archive.length;
        // this method also returns a suggestion for a task to be executed in the case
        // the agent decides to swap for another task
        // first we look for the task with minimum value
        // const minimum = Math.min(...task_execution.map(result => result.executions));
        // const less_executed_tasks = task_execution.filter(result => result.executions === minimum);
        // we sort the array by execution
        task_execution.sort((a, b) => a.executions - b.executions);
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
    function compute_perfectionism(agent, task_name) {
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
    function compute_endurance(agent, task) {
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
        // const mx = Math.max(perc_preference, perc_wealth);
        // const mn = Math.min(perc_preference, perc_wealth);
        // const result = (mx - mn) / 4;
        // return isNaN(result) ? 0 : result;
      };
      // than we sum them up and divide by 2 to get a median value
      // console.log(nudge())
      const tot_perc = ((perc_preference + perc_wealth) / 2) + nudge();
      /**
       * we compute resilince on top of FLD therefore
       * first we compute the difference between FLD
       * and its max value (100), we multiply
       * it by the tot_perc and we add the agent.FLD
       */
      const top_fld = (MAXIMUM - agent.FLD) / MAXIMUM;
      const curr_fld = agent.FLD / MAXIMUM;
      // const result = (top_fld * tot_perc) + (agent.FLD / MAXIMUM);
      const result = (curr_fld * tot_perc) + curr_fld;
      const log = `
      pref: ${perc_preference}\n
      wealth: ${perc_wealth}\n
      tot: ${tot_perc}\n
      topfld: ${top_fld}\n
      curr fld: ${curr_fld}\n
      result curr: ${curr_fld * tot_perc}\n
      result nofld: ${top_fld * tot_perc}\n
      result curr: ${(curr_fld * tot_perc) + curr_fld}\n
      result top: ${result}`
      // console.log(log)
      if (result >= 1) return 1
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
    function compute_goodwill(agent, agents, _task) {
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
  }
  /**
   * to compute the preference for a task we look n how the task scored the
   * in the different traits areas. Than we take the one where it socred the higher
   * and we subtract the two who scored the worst  ad and we compute the sign [+, 0, -]
   * than we use the sign to add or remove value to the preference for that task.
   * this system has the advantage of being a mre genral way to update preference for a task,
   * as it take in consideration the fact that agents may prefer a task that doesn't
   * score good with the dominant trait, bu that nevertheless has scored good with
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
    // console.log(curiosity, perfectionism, goodwill, endurance);
    const results = [curiosity, perfectionism, goodwill].sort();
    // console.log(results);
    const sum = Math.sign(results[2] - (results[0] + results[1])) / 2;
    const agent_pref = agent.preferences[task.type]
    const agent_fld = (agent.FLD / MAXIMUM) - 0.5;
    // console.log(sum, agent_fld, (sum + agent_fld) * endurance * 25)
    // console.log(agent_pref)
    agent_pref.task_preference += (sum + agent_fld) * endurance * 25;// this 25 is here to make the gain and drop in preference more marked
    agent_pref.task_preference = clamp(agent_pref.task_preference, MINIMUM, MAXIMUM);
  }
  setType(_traits) {
    this.traits = _traits;
  }
}