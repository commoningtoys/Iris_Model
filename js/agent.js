class Agent {
    constructor(task_list, id, x, y) {
        this.ID = nf(id, 4);
        // or should start at 0?
        // might be accumulative or not
        this.restingTime = 0;//MINIMUM + Math.floor(Math.random() * MAXIMUM);
        this.preferences = this.makePreferences(task_list);//preferences for each single task
        this.preferenceArchive = [];
        let insert = JSON.parse(JSON.stringify(this.preferences));
        this.preferenceArchive.push(insert);
        // const insert = this.preferences;
        // this.preferenceArchive.push(insert);
        // the next attributes are used for the trading system,
        this.tradeTask = '';// this defines the task the agent wants to do
        this.hasTraded = false;// if has traded than it will be selecteds for the trade task
        this.totalTaskCompleted = 0;
        this.totalTaskCompletedByAgents = 0;
        this.agents = [];

        this.FLD = randomMinMAx();// feel like doing
        this.solidarity = randomMinMAx();
        this.ability = true;
        // working attributes
        this.working = false;
        this.workingTimer = 0;// how long is the agent at work
        // ANIMATION
        this.pos = createVector(x, y);
        this.r = 10;
        this.colors = {
            working: color(255, 0, 0),
            available: color(0, 255, 0),
            unable: color(125),
            lazy: color(255, 255, 0)
        };
    }
    show() {
        noStroke();
        if (this.working) fill(this.colors.working);
        else if (!this.ability) fill(this.colors.unable);
        else if (!this.working) fill(this.colors.available);
        rect(this.pos.x, this.pos.y, this.r, this.r);
    }
    /**
     * here the agent works
     */
    update(_tasks) {
        // this.FLD--;
        // this.FLD = clamp(this.FLD, MINIMUM, MAXIMUM);
        this.totalTaskCompletedByAgents = 0;
        for (const task of _tasks) {// no go!
            this.totalTaskCompletedByAgents += task.executed;
        }
        if (this.working) {
            this.workingTimer--;
            if (this.workingTimer <= 0) {
                this.hasTraded = false;// reset to false, very IMPORTANT otherwise the agent will always be called to do a traded task
                this.working = false;
            }
        }
    }
    setAgents(_agents) {
        this.agents = _agents;
    }
    /**
     * We will need this later
     */
    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }

    /**
     * 
     * @param {String} task_name 
     * @returns returns the skill levele given a task
     */
    getSkillLevel(task_name) {
        let result = 0;
        for (const el of this.preferences) {
            if (el.task_name.includes(task_name)) {
                result = el.skill_level;
                break;
            }
        }
        return result;
    }

    trade(task) {
        // lazyness should be a value that influences 
        // the trade algorithm
        // and resting time as well
        // if an agent has no resting time he can't trade

        /**
         * here we compute the skill of the agent.
         * given its skill level we compute the amount of time he needs to 
         * complete if he needs more time than the original time needed to
         * complete the task than the agent will trade
         */
        let skill = this.getPreferences(task.type).skill_level; // here we get the skill
        let timeNeeded = task.amountOfTimeBasedOnSkill(skill); // we compute the time he needs
        let result = task.aot - timeNeeded; // and we compute the result that is either a positive or negative number
        // console.log(skill, timeNeeded, result);
        /**
         * preference also influences the trading algorithm
         * if the preference for that task is high enough 
         * the agent will execute it even if it takes a lot of time
         */
        let taskPreference = this.getPreferences(task.type).task_preference;
        if (this.FLD >= 20 && (result >= 0 || taskPreference > 90)) {// let's test without trading
            // if not trading
            // console.log(`Doing the task!,  FLD ${this.FLD}, time: ${result}, pref: ${taskPreference}`);
            // this.updateAttributes(task, true);
            // increase resting time
            return false;
        } else if (this.FLD < 2 && this.restingTime > task.aot) {// if trading
            // this needs to be updated with the lazyness as a factor and available resting time
            /**
             * NOT DOING THE TASK
             * updateAttributes()
             * occupied = true
             * decrease resting time
             */
            // console.log(`too lazy FLD: ${this.FLD}, rest time : ${this.restingTime}`);
            this.working = true;
            this.workingTimer = 2 * TIME_SCALE;
            this.restingTime -= task.value;
            this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
            // this.updateAttributes(task, true);
            return true;
        } else {
            //chooseTask()
            /**
             * therefore available for another task.
             */
            // console.log(`traded! FLD ${this.FLD}, time: ${result}, pref: ${taskPreference}`);
            this.hasTraded = true;
            // need to keep track how often the agent traded
            this.tradeTask = this.randomTask();// traded task should be different than this task
            return true;
        }
    }
    /**
     * sets the agent at work for a given amount of time
     * @param {Number} amount_of_time 
     */
    work(amount_of_time, task) {
        this.working = true;
        this.workingTimer = amount_of_time;
        this.updateAttributes(task, true);
    }
    /**
     * @returns a random task
     */
    randomTask() {
        // traded task should be different than this task
        const index = Math.floor(Math.random() * this.preferences.length);
        return this.preferences[index].task_name;
    }

    updateAttributes(task, task_executed) {
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
        // this.working = true;
        // this.workingTimer = task.aot;
        let taskName = task.type;
        this.updateCompletedTasks(task.type);
        this.updateFLD();
        // this.FLD = ;
        this.restingTime += task.value;// * task_executed == true ? 1 : -1;
        /**
         * the magik trick below let us to push the preferences
         * without copying the reference to the original array 
         */
        let insert = JSON.parse(JSON.stringify(this.preferences));// the trick
        this.preferenceArchive.push(insert);
        if (this.preferenceArchive.length > 10) this.preferenceArchive.splice(0, 1);
        console.log(insert, this.preferenceArchive);
    }
    /**
     * updates the completed task preference by adding +1
     * @param {String} task_name 
     */
    updateCompletedTasks(task_name) {
        this.totalTaskCompleted++;
        for (const el of this.preferences) {
            if (el.task_name.includes(task_name)) {
                el.completed++;
                break;
            }
        }
    }

    updateFLD() {
        // get the total tasks that have been completed by all the agents
        // let sum = 0;
        // for (const agent of agents) {
        //     for (const item of agent.preferences) {
        //         sum += item.completed;
        //     }            
        // }     
        /**
          * this algorithm looks how much the other agents have been 
          * working. If the others are working more than this agent than
          * his FLD decreases slower, if he is working more than it 
          * decreses faster.
          * it could be possible to introduce the soncept of groups here where 
          * the agents looks only how the group performs
          */
        let otherTasksCompleted = [];
        for (const agent of this.agents) {
            if (agent !== this) otherTasksCompleted.push(agent.totalTaskCompleted);
        }

        const max = Math.max(...otherTasksCompleted);
        // let result = (this.totalTaskCompleted / (this.totalTaskCompletedByAgents / this.numberOfAgents));
        let result = Math.floor((this.totalTaskCompleted / max) * 5);
        this.FLD -= result;
        this.FLD = clamp(this.FLD, MINIMUM, MAXIMUM);
        // console.log('update FLD: ', this.ID, this.totalTaskCompleted, max, result, this.FLD);
        // if (result > 1) this.FLD--;
        // else this.FLD++;
        // result = (this.totalTaskCompleted / sum) * agents.length;
        // console.log(this.totalTaskCompleted, sum, result);


    }
    /**
     * updates the task_preference in this.preferences by adding +1
     * @param {String} task_name 
     */
    updateTaskPreference(task_name) {
        for (const el of this.preferences) {
            if (el.task_name.includes(task_name)) {
                el.completed++;
                break;
            }
        }
    }

    /**
     * @param {String} task_name 
     * @return the preferences of that specific task
     */
    getPreferences(task_name) {
        let result = {};
        for (const el of this.preferences) {
            if (el.task_name.includes(task_name)) {
                result = el;
                break;
            }
        }
        return result;
    }

    /**
     * @returns the preferred task of an agent
     */
    preferredTask() {
        let max = 0;
        let i = 0;
        let index = 0;
        for (const el of this.preferences) {
            if (el.task_preference > max) {
                max = el.task_preference;
                index = i;
            }
            i++;
        }
        return this.preferences[index].task_name;
    }

    /**
     * @param {Array} arr Array of task objects
     * @returns an Array of objects with the preference for each task
     */
    makePreferences(arr) { // MAYBE NEEDSD REFACTORING MAKING IT AN OBJECT RATHER THAN A ARRAY OF OBJECTS
        const PREFERENCE_OFFSET = 30;
        let result = [];
        for (const el of arr) {
            let skill = randomMinMAx();
            result.push({
                completed: 0, // how many the task has been completed
                skill_level: skill,
                task_name: el.type,
                task_preference: this.calculatePreference(skill, PREFERENCE_OFFSET)
                // need to add a way to update the prefrence based on how often the same task has been completed
            })
        }
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
}



