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
   * @param {Object} self 
   * @returns a boolean stating if he swapped or accepted the task
   */
  decide(task, agents, self) {
    const task_name = task.type;
    const agent_archive = self.preferenceArchive;
    compute_curiosity(agent_archive, task_name);
    compute_perfectionism(self, task_name)
    compute_resilience(self, task.aot)
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

    function compute_resilience(agent, task_aot) {
      const diff_coins = task_aot - agent.time_coins;
      console.log(diff_coins, agent.time_coins / Math.abs(diff_coins));
      if(diff_coins < 0){
        return Math.abs(diff_coins);
      }else return 1;
    }
  }

  setType(_traits) {
    this.traits = _traits;
  }
}