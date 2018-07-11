let autoScrolling = true; // thius is our variable for the autoscrolling
class Agent {
    constructor(task_list, id, x, y) {
        this.ID = nf(id, 4);
        // or should start at 0?
        // might be accumulative or not
        this.restingTime = 0;//MINIMUM + Math.floor(Math.random() * MAXIMUM);
        this.preferences = this.makePreferences(task_list);//preferences for each single task
        this.preferenceArchive = [];
        // the next attributes are used for the trading system,
        this.tradeTask = '';// this defines the task the agent wants to do
        this.hasTraded = false;// if has traded than it will be selecteds for the trade task
        this.totalTaskCompleted = 0;
        this.totalTaskCompletedByAgents = 0;
        this.agents = [];
        this.currentTask = '';
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
        this.showStatistics = false;
        this.preferenceColors = {
            skill: color(255, 255, 0),
            preference: color(255, 0, 255),
            FLD: color(0, 255, 255),
            restingTime: color(255, 0, 0)
        }
        this.makeInfo();
    }

    makeInfo() {
        let myDiv = document.createElement('div');
        $(myDiv).html(this.htmlText())
            .addClass('content')
            .attr('id', this.ID)
            .click(() => {

                // $('#' + this.ID + ' .preference').toggle('slow');
                this.showStatistics = true;
                for (const agent of agents) {// this needs to be refactored
                    if (this !== agent) agent.showStatistics = false;
                }
            });// here we set the agent to be shown in show function
        $('.info').append(myDiv);

        /**
         * set autoscrolling on and off
         */
        // $('#i').hover(() => {
        //     autoScrolling = false;
        //     // console.log('HOVER');
        //     noLoop();//find a better solution like suspending the remove child
        // }, () => {
        //     autoScrolling = true;
        //     // console.log('NOT HOVER');
        //     loop();
        // });
        // //this automatically scrolls to the bottom of the div
        // if (autoScrolling) $('#i').scrollTop($('#i')[0].scrollHeight);
    }

    setInfo() {
        // to update teh infos
        document.getElementById(this.ID).innerHTML = this.htmlText();
    }

    htmlText() {
        const BR = '<br>';
        let str1 = '<b>AGENT: ' + this.ID + '</b>' + BR;
        let str2 = (this.working == true ? 'doing this task : ' + this.currentTask : 'is not working') + BR;
        let str21 = 'working timer: ' + BR + this.workingTimer + BR;
        let str3 = (this.hasTraded == true ? 'has traded to do : ' + this.tradeTask : 'has not traded') + BR;
        let str4 = 'feel like doing: ' + this.FLD + BR;
        let str5 = 'resting time: ' + this.restingTime + BR;
        let str6 = '<div class="toggle">preferences:';
        //iterating through all the item one by one.
        this.preferences.forEach(val => {
            //getting all the keys in val (current array item)
            var keys = Object.keys(val);
            //assigning HTML string to the variable html
            str6 += "<div class = 'preference'>";
            //iterating through all the keys presented in val (current array item)
            keys.forEach(key => {
                //appending more HTML string with key and value aginst that key;
                str6 += "<strong>" + key + "</strong>: " + val[key] + "<br>";
            });
            //final HTML sting is appending to close the DIV element.
            str6 += "</div><br>";
        });
        str6 += '</div>';
        // $('.preference').hide();
        // $('.toggle').click((el) => {
        //     console.log(el);
        //     $('.preference').toggle('slow');
        // });
        // console.log(str6);
        return str1 + str2 + str21 + str3 + str4 + str5 + str6;
    }

    show() {
        // noStroke();
        // if (this.working) fill(this.colors.working);
        // else if (!this.ability) fill(this.colors.unable);
        // else if (!this.working) fill(this.colors.available);
        // rect(this.pos.x, this.pos.y, this.r, this.r);
        if (this.showStatistics) {
            this.infographic();
        }
    }

    infographic() {
        const LEFT_GUTTER = 120;
        const INFO_WIDTH = width - LEFT_GUTTER;
        const ROWS = 5;
        const INFO_HEIGHT = (height - (6 * PADDING)) / ROWS;
        const CT = this.currentTask;
        // console.log(this.currentTask);
        // here we extract the values of FLD and resting time
        let fld = this.preferenceArchive.map(result => result.feel_like_doing);
        let rt = this.preferenceArchive.map(result => result.resting_time);
        // and here we draw them in the infographic
        printGraphic('FLD', fld, this.preferenceColors.FLD, 1);
        printGraphic('\nRESTING \nTIME', rt, this.preferenceColors.restingTime, 1);
        // here we extract preferences and we NEEDS REFACTORING!!
        // let preferences = this.preferenceArchive.map(result => result.prefereces);
        // console.log(preferences);
        // for (const preference of preferences) {
        //     let i = 0;
        //     // console.log(preference);
        //     for (const el of preference) {
        //         let skillz = preferences.map(result => result[i].skill_level);
        //         let prefz = preferences.map(result => result[i].task_preference);
        //         // console.log(skillz);
        //         // console.log(prefz);
        //         // console.log(el.task_name);
        //         printGraphic(el.task_name, skillz, this.preferenceColors.skill, i + 1);
        //         printGraphic(el.task_name, prefz, this.preferenceColors.preference, i + 1);
        //         i++;
        //     }
        // }
        let prefCook = this.preferenceArchive.map(result => result.prefereces[0]);
        let cookSkill = prefCook.map(result => result.skill_level);
        let cookPref = prefCook.map(result => result.task_preference);
        // let name = prefCook.prefereces[0].task_name[0];
        printGraphic('COOK', cookSkill, this.preferenceColors.skill, 2);
        printGraphic('', cookPref, this.preferenceColors.preference, 2);
        let prefClean = this.preferenceArchive.map(result => result.prefereces[1]);
        let cleanSkill = prefClean.map(result => result.skill_level);
        let cleanPref = prefClean.map(result => result.task_preference);
        printGraphic('CLEAN', cleanSkill, this.preferenceColors.skill, 3);
        printGraphic('', cleanPref, this.preferenceColors.preference, 3);
        let prefShop = this.preferenceArchive.map(result => result.prefereces[2]);
        let shopSkill = prefShop.map(result => result.skill_level);
        let shopPref = prefShop.map(result => result.task_preference);
        printGraphic('SHOP', shopSkill, this.preferenceColors.skill, 4);
        printGraphic('', shopPref, this.preferenceColors.preference, 4);
        let prefAdmin = this.preferenceArchive.map(result => result.prefereces[3]);
        let adminSkill = prefAdmin.map(result => result.skill_level);
        let adminPref = prefAdmin.map(result => result.task_preference);
        printGraphic('ADMIN', adminSkill, this.preferenceColors.skill, 5);
        printGraphic('', adminPref, this.preferenceColors.preference, 5);
        function printGraphic(str, arr, col, row_number) {
            // let prevX = LEFT_GUTTER;
            // let prevY = PADDING + INFO_HEIGHT;
            // here we draw the outline of the graphics
            // if(CT === str.toLowerCase() && str !== ''){
            //     noStroke();
            //     fill(255, 255, 0, 100);
            //     rect(posX(0, MAXIMUM), posY(MAXIMUM, row_number), posX(MAXIMUM, MAXIMUM), posY(MINIMUM, row_number));
            // }
            fill(255);
            noStroke();
            text(str, PADDING, posY(MAXIMUM, row_number))
            stroke(255);
            line(posX(0, MAXIMUM), posY(MAXIMUM, row_number), posX(0, MINIMUM), posY(MINIMUM, row_number));
            line(posX(0, MAXIMUM), posY(MINIMUM, row_number), posX(MAXIMUM, MAXIMUM), posY(MINIMUM, row_number));
            noFill();
            stroke(col);
            let i = 0;
            beginShape();
            for (const val of arr) {
                strokeWeight(2);
                let currX = posX(i, arr.length);
                let currY = posY(val, row_number);
                // line(prevX, prevY, currX, currY);
                vertex(currX, currY);
                // prevX = currX;
                // prevY = currY;
                i++;
            }
            endShape();

        }
        function posX(index, max) {
            return LEFT_GUTTER + map(index, 0, max, 0, INFO_WIDTH - PADDING);
        }
        function posY(val, row_number) {
            return ((INFO_HEIGHT + PADDING) * row_number) - map(val, MINIMUM, MAXIMUM, 0, INFO_HEIGHT);
        }
    }
    /**
     * here the agent works
     */
    update() {
        // this.FLD--;
        // this.FLD = clamp(this.FLD, MINIMUM, MAXIMUM);
        // this.totalTaskCompletedByAgents = 0;
        // for (const task of _tasks) {// no go!
        //     this.totalTaskCompletedByAgents += task.executed;
        // }
        if (this.working) {
            this.workingTimer--;
            this.setInfo();
            if (this.workingTimer <= 0) {
                this.hasTraded = false;// reset to false, very IMPORTANT otherwise the agent will always be called to do a traded task
                this.tradeTask = '';
                this.working = false;
                this.currentTask = '';
                this.setInfo();
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
            // this.makeInfo(`AGENT: ${this.ID} is doing the task!,  FLD ${this.FLD}, time: ${result}, pref: ${taskPreference}`);
            // this.updateAttributes(task, true);
            // increase resting time
            this.setInfo();
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
            // this.restingTime -= task.value;
            this.restingTime /= 2;
            // this.makeInfo(`AGENT: ${this.ID} is resting. Resting time ${this.restingTime}`);
            this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
            // this.updateAttributes(task, true);
            this.setInfo();
            return true;
        } else {
            //chooseTask()
            /**
             * therefore available for another task.
             */
            // console.log(`trade this: ${task.type}`);
            this.hasTraded = true;
            // need to keep track how often the agent traded
            this.tradeTask = this.randomTask(task.type);// traded task should be different than this task
            // this.makeInfo(`AGENT: ${this.ID} has traded task ${task.type} for ${this.tradeTask}`);
            this.setInfo();
            return true;
        }
    }
    /**
     * sets the agent at work for a given amount of time
     * @param {Number} amount_of_time 
     */
    work(amount_of_time, task, agents) {
        this.working = true;
        this.workingTimer = amount_of_time;
        this.updateAttributes(task, agents);
        this.currentTask = task.type;// we set the current task according to the task the agent is currently working on
        this.setInfo();
        // this.makeInfo(`AGENT: ${this.ID} is executing ${task.type}. It will take ${amount_of_time} ticks`);
    }

    /**
     * @returns a random task
     */
    randomTask(task_name) {
        // traded task should be different than this task
        let result = ''
        let loop = true;
        while (loop) {
            const index = Math.floor(Math.random() * this.preferences.length);
            if (this.preferences[index].task_name !== task_name) {

                result = this.preferences[index].task_name;
                loop = false;
                break;
            }
        }
        // console.log(`result: ${result}`)
        return result;
    }

    updateAttributes(task, agents) {
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
        this.updateFLD(agents);
        // this.FLD = ;
        this.restingTime += task.value;// * task_executed == true ? 1 : -1;
        // console.log(`executed task: ${this.restingTime}, value: ${task.value}`);
        /**
         * the magik trick below let us to push the preferences
         * without copying the reference to the original array 
         */
        let insert = JSON.parse(JSON.stringify(this.preferences));// the trick
        this.preferenceArchive.push({
            prefereces: insert,
            executed_task: task.type,
            resting_time: this.restingTime,
            feel_like_doing: this.FLD,
            traded: this.hasTraded == true ? this.tradeTask : ''
        });
        if (this.preferenceArchive.length > 100) this.preferenceArchive.splice(0, 1);
        this.updatePreferences(task.type);
        this.setInfo();
    }
    updatePreferences(task_name) {
        /**
         * the preferences (skill & preference for a task) get updated
         * according on how often the same task has been done in a row
         * as often as the same task is done as much skill you gain
         * but you also get bored of the task therefore you lose preference
         * while skill and preference get updated the skill and preference of the
         * tasks that have not been executed  also get inversely updated
         */
        // here we check how often a task has been executed in a row
        let counter = 0;
        for (let i = this.preferenceArchive.length - 1; i >= 0; i--) {
            let pref = this.preferenceArchive[i];
            if (pref.executed_task.includes(task_name)) counter++;
            else break;
        }
        // console.log(counter);
        // here we adjust the skill and preference
        for (const pref of this.preferences) {
            if (pref.task_name.includes(task_name)) {
                // skill increases while preference decreases
                pref.skill_level += counter;
                pref.task_preference -= Math.pow(counter, 2);
                // pref.task_preference--;
            } else {
                // the opposit for the other tasks
                pref.skill_level--;
                pref.task_preference += 2;
                // pref.task_preference += 1;
            }
            // we clamp the values between 1 and 100
            pref.skill_level = clamp(pref.skill_level, MINIMUM, MAXIMUM);
            pref.task_preference = clamp(pref.task_preference, MINIMUM, MAXIMUM);
        }
        // console.log(this.preferenceArchive, counter, task_name);
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

    updateFLD(agents) {
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
        for (const agent of agents) {
            if (agent !== this) otherTasksCompleted.push(agent.totalTaskCompleted);
        }

        const max = Math.max(...otherTasksCompleted);// magic trick
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
                task_name: el.type,
                completed: 0, // how many the task has been completed
                skill_level: skill,
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



