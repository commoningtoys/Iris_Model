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
   *       perfectionism: [0, 1],
   *       resilience:    [0, 1],
   *       accumulate:    [0, 1]                 
   *   }
   * @param {JSON} _traits is an object containing two values: tendency to rest over work and tendency to repeat same task over curiosity
   * @param {*} _agent 
   */
  constructor(_traits, _agent) {
    this.traits = _traits;
    this.agent = _agent;
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
    const task_name = task.type;
    const agent_archive = agent.preferenceArchive;
    // compute_curiosity(agent_archive, task_name);
    // compute_perfectionism(agent, task_name);
    // compute_resilience(agent, task);
    compute_accumulation(agent, agents, task);
    // comp_cur + comp_perf + comp_res + comp_acc = [0, 4]
    return true

    function compute_curiosity(agent_archive, task_name) {
      if (agent_archive.length > 1) {
        const last_idx = agent_archive.length - 1;
        const last_task = agent_archive[last_idx].executed_task;
        console.log(last_task);
        if (task_name === last_task) return 0;
        else return 1;
      } else {
        // if we don't have enough data we just return 1
        return 1;
      }
    }

    function compute_perfectionism(agent, task_name) {
      if (agent.masterTask === task_name) return 1;
      else return 0;
    }

    /**
     * this method computes the resilience of angent.
     * it is computed by looking at his wealth aka time coins
     * and compares it to the amount of time needed to complete the task
     * as this difference grows bigger the agent become less resilient
     * @param {Object} agent 
     * @param {String} task_aot 
     */
    function compute_resilience(agent, task) {
      const divider = agent.time_coins == 0 ? 1 : agent.time_coins;
      const result = task.aot / divider;
      if(result >= 1) return 1;
      else return result
    }

    function compute_accumulation(agent, agents, task){
      const task_values = {}
      for (const task of TASK_LIST) {
        task_values[task.type] = agent.taskValue(agents, task.type) * task.amount_of_time;
      }
      // console.log(task_values);
    }
  }

  setType(_traits) {
    this.traits = _traits;
  }
}