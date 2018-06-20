class Task{
    constructor(taskObject){
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
        /**
         * after how many ticks do I need to call this task again?
         * here we need an algorithm that calculates the urgency based
         * on how often the task needs to be carried out.
         */         
        this.urgency = Math.floor(DAY / taskObject.executions_per_day);
        this.urgencyReset = this.urgency; //we need this to reset the urgency
        this.type = taskObject.type;
        this.skillNeeded = 1 + Math.floor(Math.random() * 11);
    }
    /**
     * this method is called every tick by decreasing
     * the urgency when it reaches 0 it wil be reset to its original value.
     */
    updateUrgency(){
        this.urgency--;
        if(this.urgency <= 0){
            console.log('choose agent for the task: ' + this.type);
            this.urgency = this.urgencyReset;
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

    }
}