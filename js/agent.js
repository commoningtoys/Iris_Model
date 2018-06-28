class Agent {
    constructor(task_list, x, y) {
        // or should start at 0?
        // might be accumulative or not
        this.restingTime = 0;//1 + Math.floor(Math.random() * 100);
        this.preferences = this.makePreferences(task_list);//preferences for each single task
        // the next attributes are used for the trading system,
        this.tradeTask = '';// this defines the task the agent wants to do
        this.hasTraded = false;// if has traded than it will be selecteds for the trade task
        // console.log(this.preferences);
        this.FLD = 1 + Math.floor(Math.random() * 10);// feel like doing
        this.solidarity = 1 + Math.floor(Math.random() * 10);
        this.ability = true;
        this.working = false;
        this.workingTimer = 0;
        this.pos = createVector(x, y);
        this.r = 10;
    }
    show() {
        noStroke();
        if (this.working) fill(255, 0, 0);
        else if (!this.ability) fill(125);
        else fill(0, 255, 0);
        rect(this.pos.x, this.pos.y, this.r, this.r);
    }
    update() {
        if (this.working) {
            this.workingTimer--;
            if (this.workingTimer <= 0) {
                this.hasTraded = false;
                this.working = false;
            }
        }
    }
    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }
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
    /**
     * updates the completed task preference by adding +1
     * @param {String} task_name 
     */
    updateCompletedTasks(task_name) {
        for (const el of this.preferences) {
            if (el.task_name.includes(task_name)) {
                el.completed++;
                break;
            }
        }
    }
    trade(task) {
        // lazyness should be a value that influences 
        // the trade algorithm
        // and resting time as well
        // if an agent has no resting time he can't trade
        if (Math.random() < 0.5) {// let's test without trading
            // if not trading
            console.log('Doing the task!')
            this.updateAttributes(task, true);
            // increase resting time
            return false;
        } else {// if trading
            if (Math.random() > 0.5) {// this needs to be updated with the lazyness as a factor and available resting time
                /**
                 * updateAttributes()
                 * occupied = true
                 * decrease resting time
                 */
                console.log('too lazy to work now!')
                this.updateAttributes(task, true);
                return true;
            } else {
                //chooseTask()
                /**
                 * therefore available for another task.
                 */
                console.log('traded!')
                this.hasTraded = true;
                // need to keep track how often the agent traded
                this.tradeTask = this.randomTask();
                return true;
            }
        }
    }
    /**
     * sets the agent at work for a given amount of time
     * @param {Number} amount_of_time 
     */
    work(amount_of_time) {
        this.working = true;
        this.workingTimer = amount_of_time;
    }
    randomTask() {
        const index = Math.floor(Math.random() * this.preferences.length);
        return this.preferences[index].task_name;
    }
    updateAttributes(task, done) {
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
        // IMPORTANT!!!!!
        // add a update function to update the preference of the task

        this.restingTime += task.value;
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
    makePreferences(arr) {
        const PREFERENCE_OFFSET = 30;
        let result = [];
        for (const el of arr) {
            let skill = 1 + Math.floor(Math.random() * 100);
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
        if (result < 1) result = 1;
        if (result > 100) result = 100
        return result;
    }
}



