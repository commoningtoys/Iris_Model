class Task{
    constructor(taskObject, x, y){
        /**
         * time needed to carry out the task
         */
        this.aot = taskObject.amount_of_time;
        /**
         * Value of a task expresses the relative exchange rate to other task.
         * The value of a task goes up every time an agent decides to 'trade'.
         * The value goes down every time an agent (or agents) decide to 'carry out' the task.
         */
        this.value = 0;
        this.agentPool = [];
        this.tradingAgents = 0;
        /**
         * after how many ticks do I need to call this task again?
         * here we need an algorithm that calculates the urgency based
         * on how often the task needs to be carried out.
         */         
        this.urgency = Math.floor(DAY / taskObject.executions_per_day);
        this.urgencyReset = this.urgency; //we need this to reset the urgency
        this.type = taskObject.type;
        this.skillNeeded = 1 + Math.floor(Math.random() * 100);//this needs to be better defined
        this.pos = createVector(x, y);
        this.r = 10;
    }

    show(){
        fill(255);
        let h = (this.aot / TIME_SCALE) * 10;
        // console.log(h);
        rect(this.pos.x, this.pos.y, this.r, -h);
    }
    /**
     * this method is called every tick by decreasing
     * the urgency when it reaches 0 it wil be reset to its original value.
     */
    updateUrgency(agents){
        this.urgency--;
        if(this.urgency <= 0){
            console.log('choose agent for the task: ' + this.type);
            this.urgency = this.urgencyReset;
            this.chooseAgent(agents);
            noLoop();
        }
    }
    /**
     * the value is defined by the amount of the agent that want to take the task.
     * @param {Array} agents 
     */
    updateValue(agents){

    }
    /**
     * The task chooses one agent from the available pool.
     * The task is assigned by picking enough agents that with 
     * their skill will reduce urgency to 0.
     * Inside here we need take in consideration the trade function 
     * of the agent.
     * @param {Array} agents 
     */
    chooseAgent(agents){
        this.agentPool = [];
        this.tradingAgents = 0;
        let amountOfSkill = 0;
        for (const agent of agents) {
            let skill = agent.getSkillLevel(this.type);
            if(agent.hasTraded && agent.tradeTask.includes(this.type)){//here we need a string comparison
                // this is where chooseTask() happens
                this.agentPool.push(agent);
                this.tradingAgents++;
                amountOfSkill += skill;
                // maybe deprecated
                agent.occupied = true;//the agent becomes occupied
            }
            if(!agent.occupied && agent.ability && !agent.trade(this)){
                this.agentPool.push(agent);
            }            
        }
    }
}