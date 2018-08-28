class Task {
    /**
     * The task Object it takes a a task_object with the specification
     * for the amount of time the task takes how often neeeds to be executed each day
     * and the name of the task
     * @param {Object} task_object a task object
     * @param {Number} x position 
     * @param {Number} y position
     */
    constructor(task_object, global_resting_time) {
        this.GRT = global_resting_time;
        // console.log(this.GRT)
        /**
         * time needed to carry out the task
         */
        this.aot = task_object.amount_of_time;
        /**
         * Value of a task expresses the relative exchange rate to other task.
         * The value of a task goes up every time an agent decides to 'trade'.
         * The value goes down every time an agent (or agents) decide to 'carry out' the task.
         */
        this.value = 0;// BETWEEN 1 - 100
        this.agentsPool = [];// this is the pool of availabale agents where task picks a random one
        this.tradingAgents = 0;// to keep track of the agents that traded
        /**
         * after how many ticks do I need to call this task again?
         * here we need an algorithm that calculates the urgency based
         * on how often the task needs to be carried out.
         */
        this.urgency = Math.floor(DAY / task_object.executions_per_day) + Math.floor(Math.random() * 10);
        console.log(this.urgency);
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
            this.updateValue(agents);
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
            let prefererence = agent.preferredTask();
            if (prefererence === this.type) {//string comparison
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
         * than th ecapitalist are the less stressed.
         */
        let amountOfTime = 1 + ((NUMBER_OF_AGENTS - counter) / NUMBER_OF_AGENTS) * TIME_SCALE * TS_FRACTION;
        amountOfTime = Math.round(amountOfTime);
        // down here we remove time from the GRT if it reaches 0 it stays 0!
        if (this.GRT > 0) {
            this.GRT -= amountOfTime;
            this.GRT = roundPrecision(this.GRT, 1)
        }
        // console.log(this.GRT, amountOfTime);
        if (this.GRT - amountOfTime > 0) {
            // if there is still vailable GRT give it to the agent as value for the task
            this.value = amountOfTime;
            // console.log(`GRT ${this.type} above 0 value: ${this.value}`);
        } else if (this.GRT > 0) {
            // here we give the agent the remaining GRT
            this.value = parseFloat(this.GRT);
            // console.log(`GRT almost 0 ${this.GRT}`);
            this.GRT = 0;
        } else {
            // here we don't give any resting time
            // we should think also on how the agent react when no resting time ids given for a task
            // console.log(`GRT is ${this.GRT}`)
            this.value = 0;
            this.GRT = 0;
        }
        // this.value = (1 - (counter / NUMBER_OF_AGENTS)) * TIME_SCALE;
        // console.log(`value: ${this.type}, ${this.value}, number ${counter}`);
        // console.log(`task ${this.type} has this value ${this.value}, and this GRT ${this.GRT}`);
        /**
         * task shop has this value 0, and this GRT 23
         * this is an error that I need to fix
         */
        return;
    }

    updateGRT(amount_of_time) {
        this.GRT += amount_of_time;
        // console.log(`GRT got updated by ${amount_of_time}, total GRT = ${this.GRT}`)
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
        this.tradingAgents = 0;
        let amountOfSkill = 0;
        let skill = 0;
        shuffleArray(agents);// we shuffle the agents 
        // here we check if the agent has traded before if yes he executes the task
        for (const agent of agents) {
            // skill = agent.getPreferences(this.type).skill_level;
            if (agent.hasTraded && agent.tradeTask === this.type && (!agent.working || !agent.resting)) {
                // this is where chooseTask() happens
                if (agent.isPlayer) {
                    // if the agent is the player than make him work
                    agent.playerTaskToExecute = this;
                    agent.hasTraded = false; // reset here the traded boolean
                    agent.playerWorks(agents);
                    return;// WE RETURN BECAUSE THE AGENT IS THE PLAYER THEREFORE WE DON'T NEED TO CHECK FOR MORE AGENTS TO DO THE TASK
                } else {
                    /**
                     * I THINK THERE IS A LOGIC PROBLEM HERE
                     * IT MIGHT BE BETTER TO PUT ALL THE AGENT THAT 
                     * TRADED FOR THIS TASK ONTO A POOL AND THEN PICK A RANDOM ONE
                     */
                    // this.agentsPool.push(agent);
                    this.tradingAgents++;
                    //////DEPRECATED//////
                    // amountOfSkill += skill;// we will use this when we will need more agents to carry out the task
                    //////////////////////
                    skill = agent.getPreferences(this.type).skill_level;
                    let time = this.amountOfTimeBasedOnSkill(skill);
                    agent.work(time, this, agents);//the agent works
                    agent.hasTraded = false; // reset here the traded boolean | needs to be done after the the agent.work otherwise the it is not possible to visualize the trade happening
                    // this.executed++;
                    // console.log('trading agent doing the task!');
                    return;// IF THE AGENT HAS TRADED FOR THIS TASK THAN HE GETS PICKED THEREFORE WE RETURN
                }
            } else if (!agent.working && agent.ability && !agent.hasTraded) {// maybe the trade happens once we have the pool
                this.agentsPool.push(agent);// IF NONE OF THE ABOVE THINGS HAPPENED THAN WE PUSH THE AGENT INTO A POOL OF POSSIBLE CANDIDATE FOR THE TASK
            }
        }
        /**
         * here is where the trading happens we have a pool 
         * of agents that are not working and able
         * the task should pick a random agent from the pool
         * if he trades than it looks for another agent
         * and updates the value of the task by increment
         */
        // console.log('agent pool: ', this.agentsPool.length);
        let trading = true;
        let maximumTradings = 10000;
        let counter = 0;
        while (trading) {
            let randIndex = Math.floor(Math.random() * this.agentsPool.length);
            const agent = this.agentsPool[randIndex];// here we pick a random agent from the pool

            if (counter > maximumTradings || this.agentsPool.length < 1) {
                // we need to handle the case in which no agent is available for one task
                this.bruteForceTask(agents);
                // console.log(`NO AGENT FOUND FOR ${this.type}!`);
                // noLoop();
                break;
            } else {
                if (!agent.trade(this, agents)) {
                    // if the agent has not traded 
                    // then he executes the task
                    skill = agent.getPreferences(this.type).skill_level;
                    let time = this.amountOfTimeBasedOnSkill(skill);
                    agent.work(time, this, agents);// we set the agent at work
                    // this.executed++;
                    trading = false;// here we exit the while loop
                    break;//DEPRECATED
                } else {
                    // if the agent has traded we remove him from the pool
                    // so he can't be picked the next time 
                    this.agentsPool.splice(randIndex, 1);
                    // console.log('agent pool after trading: ', this.agentsPool.length);
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
            // console.log(`working: ${agent.working}, resting: ${agent.resting}, traded: ${agent.hasTraded}`);
            if (!agent.working || agent.resting || agent.hasTraded) {
                /**
                 * HERE WE NEED TO CHECK WHICH 
                 * BEHAVIOR THE AGENT HAS
                 * AND ACCORDING TO THAT THE FLD
                 * NEEDS TO BE UPDATED ACCORDIGLY
                 */
                agent.resting = false;
                agent.restingTimer = 0;
                // check resting timer!!!
                agent.hasTraded = false;
                agent.tradeTask = '';
                agent.stress++;
                agent.stress = clamp(agent.stress, MINIMUM, MAXIMUM);
                let skill = agent.getPreferences(this.type).skill_level;
                let time = this.amountOfTimeBasedOnSkill(skill);
                agent.work(time, this, agents, true);
                // agent.FLD /= 2;
                // add this to the html text
                // console.log(`agent_${agent.ID} has been brute forced to do ${this.type}`);
                controlState = false;
                break;
            }

            i++;
            if (i > 5000) {
                // assign task as next to do to an agent
                console.log('no agent found')
                controlState = false;
                break;
            }
        }
        // for (const agent of agents) {
        //     if(agent.resting || agent.hasTraded){
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
        const MINIMUM_TIME = TIME_SCALE * 2;// this is the minimum time an agent has to invest for an assigned task aka 15 minutes
        if (result <= MINIMUM_TIME) return MINIMUM_TIME;// if the result is less than the minimum time return the minimum time
        else return result;// else return the result
    }
}