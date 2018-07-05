class Task {
    /**
     * The task Object it takes a a task_object with the specification
     * for the amount of time the task takes how often neeeds to be executed each day
     * and the name of the task
     * @param {Object} task_object a task object
     * @param {Number} x position 
     * @param {Number} y position
     */
    constructor(task_object, x, y) {
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
        this.urgency = Math.floor(DAY / task_object.executions_per_day);
        // 
        this.urgencyReset = this.urgency; //we need this to reset the urgency
        this.type = task_object.type;
        this.executed = 0;
        // DEPRECATED FOR NOW
        this.skillNeeded = randomMinMAx();//this needs to be better defined
        /////////////////////////////////
        this.pos = createVector(x, y);
        this.r = 10;
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
        this.urgency--;
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
        let counter = 1;// we start from 1 to avoid 0 as result, this will result in a minimum value
        const NUMBER_OF_AGENTS = agents.length;
        for (const agent of agents) {
            // we go through all the agents if their preferred task matches 
            // this task we add one to the counter
            let prefererence = agent.preferredTask();
            if (prefererence.includes(this.type)) {//string comparison
                counter++;
            }
        }
        // the value needs to be proportional to the TIME_SCALE
        this.value = (counter / NUMBER_OF_AGENTS) * TIME_SCALE;
        console.log(`value: ${this.type}`, this.value);
    }
    /**
     * The task chooses one agent from the available pool.
     * The task is assigned by picking enough agents that with 
     * their skill will reduce urgency to 0.
     * Inside here we need take in consideration the trade function 
     * of the agent.
     * @param {Array} agents 
     */
    chooseAgent(agents) {// choose only one agent for now!
        this.agentsPool = [];
        this.tradingAgents = 0;
        let amountOfSkill = 0;
        let skill = 0;
        for (const agent of agents) {
            skill = agent.getSkillLevel(this.type);
            if (agent.hasTraded && agent.tradeTask.includes(this.type)) {
                // this is where chooseTask() happens
                // this.agentsPool.push(agent);
                this.tradingAgents++;
                //////DEPRECATED//////
                amountOfSkill += skill;// we will use this when we will need more agents to carry out the task
                //////////////////////
                let time = this.amountOfTimeBasedOnSkill(skill);
                agent.work(time, this);//the agent works
                // this.executed++;
                console.log('trading agent doing the task!');
                return;
            }
            if (!agent.working && agent.ability) {// maybe the trade happens once we have the pool
                this.agentsPool.push(agent);
            }
        }
        /**
         * here is where the trading happens we have a pool 
         * of agents that are not working and able
         * the task should pick a random agent from the pool
         * if he trades than it looks for another agent
         * and updates the value of the task by increment
         */
        console.log('agent pool: ', this.agentsPool.length);
        let trading = true;
        let maximumTradings = 10000;
        let counter = 0;
        while (trading) {
            let randIndex = Math.floor(Math.random() * this.agentsPool.length);
            const agent = this.agentsPool[randIndex];// here we pick a random agent from the pool

            if (counter > maximumTradings || this.agentsPool.length < 1) {
                // we need to handle the case in which no agent is available for one task
                console.log('NO AGENT FOUND FOR THIS TASK!');
                noLoop();
                break;
            } else {
                if (!agent.trade(this)) {
                    // if the agent has not traded 
                    // then he executes the task
                    let time = this.amountOfTimeBasedOnSkill(skill);
                    agent.work(time, this);// we set the agent at work
                    // this.executed++;
                    trading = false;// here we exit the while loop
                    break;//DEPRECATED
                } else {
                    // if the agent has traded we remove him from the pool
                    // so he can't be picked the next time 
                    this.agentsPool.splice(randIndex, 1);
                    console.log('agent pool after trading: ', this.agentsPool.length);
                }
            }
            counter++;
        }
        //CHOOSE RANDOM AGENT FROM THE POOL
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
        let result = ((MEDIUM_SKILL - skill_level) / MAXIMUM) * TIME_SCALE;
        result += this.aot;
        const MINIMUM_TIME = 0.25 * TIME_SCALE;// this is the minimum time an agent has to invest for an assigned task aka 15 minutes
        if (result <= MINIMUM_TIME) return MINIMUM_TIME;// if the result is less than the minimum time return the minimum time
        else return result;// else return the result
    }
}