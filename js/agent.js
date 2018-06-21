class Agent {
    constructor(tasksList, x, y) {
        this.restingTime = 1 + Math.floor(Math.random() * 100);// or should start at 0?
        this.preferences = this.makePreferences(tasksList);
        // the next attributes are used for the trading system,
        this.tradeTask = '';// this defines the task the agent wants to do
        this.hasTraded = false;// if has traded than it will be selecteds for the trade task
        // console.log(this.preferences);
        this.FLD = 1 + Math.floor(Math.random() * 10);// feel like doing
        this.solidarity = 1 + Math.floor(Math.random() * 10);
        this.ability = true;
        this.occupied = false;
        this.occupiedTimer = 0;
        this.pos = createVector(x, y);
        this.r = 10;
    }
    show() {
        noStroke();
        if (this.occupied) fill(255, 0, 0);
        else if (!this.ability) fill(125);
        else fill(0, 255, 0);
        rect(this.pos.x, this.pos.y, this.r, this.r);
    }
    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }
    getSkillLevel(taskName) {
        let result = 0;
        for (const el of this.preferences) {
            if (el.task_name.includes(taskName)) {
                result = el.skill_level;
                break;
            }
        }
        return result;
    }
    updateCompletedTasks(taskName){
        for (const el of this.preferences) {
            if (el.task_name.includes(taskName)) {
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
        if (Math.random() < 1.5) {// let's test without trading
            // if not trading
            this.updateAttributes(task, true);
            // increase resting time
            return false;
        } else {// if trading
            if (Math.random() < 0.5) {// this needs to be updated with the lazyness as a factor
                /**
                 * updateAttributes()
                 * occupied = true
                 * decrease resting time
                 */
            } else {
                /**
                 * Occupied = false
                 * therefore available for another task.
                 * no need for an else
                 */
            }
            return true;
        }
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



