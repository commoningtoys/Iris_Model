class Task {
  /**
   * The task Object it takes a a task_object with the specification
   * for the amount of time the task takes how often neeeds to be executed each day
   * and the name of the task
   * @param {Object} task_object a task object
   * @param {Number} global_resting_time amount of time/value that the task can give to the agent 
   */
  constructor(task_object, min_wage, model_type) {
    // this.time_coins_reserve = global_resting_time;
    // console.log(this.time_coins_reserve)
    this.spending_model = model_type === 'time-spending' ? true : false;
    /**
     * time needed to carry out the task
     */
    this.aot = task_object.amount_of_time;
    // console.log(this.aot);
    this.time_coins_reserve = 4 * this.aot;
    /**
     * Value of a task expresses the relative exchange rate to other task.
     * The value of a task goes up every time an agent decides to 'trade'.
     * The value goes down every time an agent (or agents) decide to 'carry out' the task.
     */
    this.value = 0;// BETWEEN 1 - 100
    this.minWage = min_wage;
    this.agentsPool = [];// this is the pool of availabale agents where task picks a random one
    this.swapping_agents = 0;// to keep track of the agents that traded
    /**
     * after how many ticks do I need to call this task again?
     * here we need an algorithm that calculates the urgency based
     * on how often the task needs to be carried out.
     */
    this.urgency = Math.floor(DAY / task_object.executions_per_day) + Math.floor(Math.random() * 10);
    // console.log(this.urgency);
    /**
     * WE NEED TO MAKE THE URGENCY A LITTLE BIT MORE FLUCTUANT SO THAT THE TASK NEVER REALLY OVERLAP
     */
    this.urgencyReset = this.urgency; //we need this to reset the urgency
    this.type = task_object.type;
    this.executed = 0;
    // DEPRECATED FOR NOW
    this.skillNeeded = randomMinMAx();//this needs to be better defined
    /////////////////////////////////
    // this.pos = createVector(x, y);
    // this.r = 10;
  }
  /**
   * show the task development over time
   */
  show() {
    fill(255);
    let h = (this.aot / TIME_SCALE) * 10;
    // console.log(h);
    rect(this.pos.x, this.pos.y, this.r, -h);
  }
  /**
   * this method is called every tick by decreasing
   * the urgency when it reaches 0 it wil be reset to its original value.
   */
  updateUrgency(agents) {
    this.urgency -= timeUpdate();
    if (this.urgency <= 0) {
      // console.log('choose agent for the task: ' + this.type);
      this.urgency = this.urgencyReset;
      // every time the uregency reaches 0 we update the value in the future
      // the preference of the agent may vary according on how often he executed the same task
      if(!this.spending_model)this.updateValue(agents);// we update the value only when the mocdel runs on the accumulate model
      this.executed++;
      // here we choose the agent to carry out the task
      this.chooseAgent(agents);
      // noLoop();
    }
  }
  /**
   * the value is defined by the amount of the agent that want to take the task.
   * @param {Array} agents 
   */
  updateValue(agents) {
    // INVERSE TO THE NUMBER OF AGENTS WITH PREFERENCE FOR SUCH TASK
    // here we remove some time from the amout of resting tim the task can give away
    let counter = agents.length;// we start from 1 to avoid 0 as result, this will result in a minimum value
    const NUMBER_OF_AGENTS = agents.length;
    for (const agent of agents) {
      // we go through all the agents if their preferred task matches 
      // this task we add one to the counter
      let preference = agent.preferredTask();
      if (preference === this.type) {//string comparison
        counter--;
      }
    }
    /**
     * else we return a value that is inverse proportional
     * as many agents prefer that task as lower it is its value
     * but it can't be 0
     * 
     * If the model gives a minimum resting time than the capitalist
     * are more stressed. if we let the model give 0 resting time 
     * than the capitalist are the less stressed.
     */
    let amountOfTime = this.minWage + ((NUMBER_OF_AGENTS - counter) / NUMBER_OF_AGENTS) * this.aot;
    amountOfTime = Math.ceil(amountOfTime);
    // console.log(this.type, amountOfTime, this.aot, counter);
    // down here we remove time from the GRT if it reaches 0 it stays 0!
    if (this.time_coins_reserve > 0) {
      if (this.time_coins_reserve - amountOfTime < 0) {
        // if the amount of time computed above is 
        // bigger than the reserve of resting time
        // than we set the value to be the leftover of the 
        // resting time. here we also need to set the
        // resting time reserve to 0 because ve removed all of it.
        this.value = this.time_coins_reserve;
        this.time_coins_reserve = 0;
      } else {
        // else we set the amout of time as the valuse for the task
        this.value = amountOfTime;
        this.time_coins_reserve -= amountOfTime;
        // this.time_coins_reserve = roundPrecision(this.time_coins_reserve, 1)
      }
    } else {
      // here we don't give any resting time
      // we should think also on how the agent react when no resting time is given for a task
      this.value = 0;
      this.time_coins_reserve = 0;
    }
    return;
  }

  updateGRT(amount_of_time) {

    this.time_coins_reserve += amount_of_time;
    // console.log(`task ${this.type} GRT got updated by ${amount_of_time}, total GRT = ${this.time_coins_reserve}`)
  }

  /**
   * The task chooses one agent from the available pool.
   * The task is assigned by picking enough agents that with 
   * their skill will reduce urgency to 0.
   * Inside here we need take in consideration the trade function 
   * of the agent.
   * @param {Array} agents 
   */
  chooseAgent(agents) {

    this.agentsPool = [];
    this.swapping_agents = 0;
    shuffleArray(agents);// we shuffle the agents 
    // here we filter out all the agents who already have done the task for the day
    let available_agents = agents.filter(agent => (agent.done_for_the_day === false && agent.spending_hours > 0) && (!agent.working || !agent.resting));
    // console.log(available_agents.length);
    let swapping_agents = available_agents.filter(agent => agent.has_swapped === true);
    // console.log(swapping_agents.length);
    // available_agents = available_agents.filter(agent => agent.behavior_exp.compute_resting(agent, this) === false)

    // here we add the vailable agents who did  not swap to the agents pool
    // this will be used later in the case no agent has swapped for this task
    this.agentsPool = available_agents.filter(agent => agent.has_swapped === false);

    // what if there is no available agents? brute force
    if(this.agentsPool.length <= 0){
      // console.log('no agents available... brute forcing...');
      this.bruteForceTask(agents);
    }

    // here we select the swapping agent if there is any
    swapping_agents = swapping_agents.filter(agent => agent.swap_task === this.type);
    // console.log(`swapping agents with ${this.type}: ${swapping_agents.length}`);
    if(swapping_agents.length > 0){
      // here we pick a random agent that has swapped for this task
      const rand_idx = Math.floor(Math.random() * swapping_agents.length);
      const chosen_agent = swapping_agents[rand_idx];
      // the agent executes the task
      chosen_agent.work(this, agents, false);
      chosen_agent.has_swapped = false; // here we reset the status of the agent!!
      return // we return as the task has been executed
    }


      /*
       ######  ####### ######  ######  #######  #####     #    ####### ####### ######
       #     # #       #     # #     # #       #     #   # #      #    #       #     #
       #     # #       #     # #     # #       #        #   #     #    #       #     #
       #     # #####   ######  ######  #####   #       #     #    #    #####   #     #
       #     # #       #       #   #   #       #       #######    #    #       #     #
       #     # #       #       #    #  #       #     # #     #    #    #       #     #
       ######  ####### #       #     # #######  #####  #     #    #    ####### ######

      */
    // // here we check if the agent has traded before if yes he executes the task
    // for (const agent of available_agents) {
    //   // skill = agent.getPreferences(this.type).skill_level;
    //   if ((agent.has_swapped && agent.swap_task === this.type) && (!agent.working || !agent.resting)) {
    //     // this is where chooseTask() happens
    //     if (agent.isPlayer) {
    //       // if the agent is the player than make him work
    //       agent.playerTaskToExecute = this;
    //       agent.has_swapped = false; // reset here the traded boolean
    //       agent.playerWorks(agents);
    //       return;// WE RETURN BECAUSE THE AGENT IS THE PLAYER THEREFORE WE DON'T NEED TO CHECK FOR MORE AGENTS TO DO THE TASK
    //     } else {
    //       /**
    //        * I THINK THERE IS A LOGIC PROBLEM HERE
    //        * IT MIGHT BE BETTER TO PUT ALL THE AGENT THAT 
    //        * TRADED FOR THIS TASK ONTO A POOL AND THEN PICK A RANDOM ONE
    //        */
    //       // this.agentsPool.push(agent);
    //       this.swapping_agents++;
    //       //////DEPRECATED//////
    //       // amountOfSkill += skill;// we will use this when we will need more agents to carry out the task
    //       //////////////////////
    //       // console.log(agent.ID, agent.swap_task)
    //       agent.work(this, agents, false);//the agent works
    //       agent.has_swapped = false; // reset here the traded boolean | needs to be done after the the agent.work otherwise the it is not possible to visualize the trade happening
    //       // this.executed++;
    //       // console.log('swapping agent doing the task!');
    //       return;// IF THE AGENT HAS TRADED FOR THIS TASK THAN HE GETS PICKED THEREFORE WE RETURN
    //     }
    //   } else if (!agent.working && agent.ability && !agent.has_swapped) {// maybe the trade happens once we have the pool
    //     this.agentsPool.push(agent);// IF NONE OF THE ABOVE THINGS HAPPENED THAN WE PUSH THE AGENT INTO A POOL OF POSSIBLE CANDIDATE FOR THE TASK
    //   }
    // }


    /**
     * here is where the swapping happens we have a pool 
     * of agents that are not working and able
     * the task should pick a random agent from the pool
     * if he trades than it looks for another agent
     */
    // console.log('agent pool: ', this.agentsPool.length);
    let swapping = true;
    let maximumTradings = 10000;
    let counter = 0;
    while (swapping) {
      let randIndex = Math.floor(Math.random() * this.agentsPool.length);
      const agent = this.agentsPool[randIndex];// here we pick a random agent from the pool

      if (counter > maximumTradings || this.agentsPool.length < 1) {
        // we need to handle the case in which no agent is available for one task
        this.bruteForceTask(agents);
        // flush the pool
        this.agentsPool = [];
        // console.log(`NO AGENT FOUND FOR ${this.type}!`);
        // noLoop();
        break;
      } else {
        if (!agent.swap_2(this, agents)) {
          // console.log('swapped')
          // if the agent has not traded 
          // then he executes the task
          agent.work(this, agents, false);// we set the agent at work
          // this.executed++;
          swapping = false;// here we exit the while loop
          // flush the pool
          this.agentsPool = [];
          break;//DEPRECATED
        } else {
          // if the agent has traded we remove him from the pool
          // so he can't be picked the next time 
          this.agentsPool.splice(randIndex, 1);
          // console.log('agent pool after swapping: ', this.agentsPool.length);
        }
      }
      counter++;
    }
  }

  bruteForceTask(agents) {
    //assigns the task to someone as next task to do.
    // console.log('BRUTE FORCE!!!')
    let i = 0;
    let controlState = true;
    while (controlState) {
      let index = Math.floor(Math.random() * agents.length);
      let agent = agents[index];
      // console.log(`working: ${agent.working}, resting: ${agent.resting}, traded: ${agent.has_swapped}`);
      if (!agent.working || agent.resting || agent.has_swapped || agent.isPlayer) {
        /**
         * HERE WE NEED TO CHECK WHICH 
         * BEHAVIOR THE AGENT HAS
         * AND ACCORDING TO THAT THE FLD
         * NEEDS TO BE UPDATED ACCORDIGLY
         * 
         * For now it doesn't let player to be brute forced
         */
        agent.resting = false;
        agent.restingTimer = 0;
        // check resting timer!!!
        agent.has_swapped = false;
        agent.swap_task = '';
        agent.increase_stress(1);
        agent.work(this, agents, true);
        // agent.FLD /= 2;
        // add this to the html text
        // console.log(`agent_${agent.ID} has been brute forced to do ${this.type}`);
        controlState = false;
        break;
      }

      i++;
      if (i > 5000) {
        // assign task as next to do to an agent
        // console.log('no agent found');
        controlState = false;
        break;
      }
    }
    // for (const agent of agents) {
    //     if(agent.resting || agent.has_swapped){
    //         console.log(agent.ID);
    //     }
    // }
  }
  /**
   * 
   * @param {Number} skill_level the skill level for this task
   * @returns the amount of time the agent needs to complewte the task
   */
  amountOfTimeBasedOnSkill(skill_level) {
    /**
     * we assume that an agent with medium skill
     * will complete the task in the assigned amount of time
     * but highly skilled or lower skilled agents will complete it 
     * in less or more time
     */
    const MEDIUM_SKILL = MAXIMUM / 2;// we define the medium skill level
    // here we subtract the skill level the the medium skill level and we divide it 
    // by maximum to get a value between 0 and 1, that we multiply by the time scale.
    // the result will oscillate between -0.5 and +0.5 that we multiply by the time scale
    let result = ((MEDIUM_SKILL - skill_level) / MAXIMUM) * this.aot;
    result = Math.round(result);
    result += this.aot;
    // console.log(`${this.type}this is the skill level: ${skill_level} and this the median: 50. this is the amount of time: ${this.aot} and the result: ${result}`);
    const MINIMUM_TIME = TIME_SCALE;// this is the minimum time an agent has to invest for an assigned task aka 1 hour
    if (result <= MINIMUM_TIME) return MINIMUM_TIME;// if the result is less than the minimum time return the minimum time
    else return result;// else return the result
  }
}