let autoScrolling = true; // thius is our variable for the autoscrolling
class Agent {
    constructor(task_list, id, is_player, _behavior) {
        this.isPlayer = is_player;
        this.playerTaskToExecute;
        this.playerTimer = 0;
        this.playerWorking = false;
        this.ID = is_player ? `PLAYER_${nf(id, 4)}` : nf(id, 4);

        this.behavior = _behavior;


        this.restingTime = 0;
        this.resting = false;
        this.restingTimer = 0;
        this.preferences = this.makePreferences(task_list);//preferences for each single task
        this.preferenceArchive = [];
        /**
         * if the agent is perfectionist we need to define
         * the task he wants to master
         */
        if (this.behavior === 'perfectionist') {
            let max = 0;
            let myObj = this.preferences;
            let result = ''
            Object.keys(myObj).forEach(key => {
                let pref = myObj[key].skill_level;
                let name = myObj[key].task_name;
                if (pref > max) {
                    max = pref;
                    result = name;
                }
            });
            this.masterTask = result;
            // console.log(this.masterTask);
        }

        // the next attributes are used for the trading system,
        this.tradeTask = '';// this defines the task the agent wants to do
        this.hasTraded = false;// if has traded than it will be selecteds for the trade task
        this.totalTaskCompleted = 0;
        this.totalTaskCompletedByAgents = 0;

        this.currentTask = '';
        this.FLD = this.behavior == 'capitalist' ? 100 : randomMinMAx();// feel like doing
        this.solidarity = randomMinMAx();
        this.stress = 0;// we will need this to see how stressed the agents are, the stress will increase when the agents can't rest while FLD is 0
        this.ability = true;
        // working attributes
        this.working = false;
        this.workingTimer = 0;// how long is the agent at work
        // ANIMATION
        // this.pos = createVector(x, y);
        // this.r = 10;
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
        // this.makeInfo();
        // this.setInfo();
    }
    /**
     * 
     */
    makeInfo(agents) {
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
    }
    /**
     * 
     */
    setInfo() {
        // to update the infos
        document.getElementById(this.ID).innerHTML = this.htmlText();
        if (this.isPlayer) document.getElementById('player-stats').innerHTML = this.htmlText();
    }
    /**
     * 
     */
    htmlText() {
        const BR = '<br>';
        let str1 = '<b>AGENT: ' + this.ID + '</b>' + BR;
        let str11 = '<b>behavior: ' + this.behavior + '</b>' + BR;
        let str2 = (this.working == true ? 'doing this task : ' + this.currentTask : 'is not working') + BR;
        let str21 = 'working timer: ' + BR + this.workingTimer + BR;
        let str3 = (this.hasTraded === true ? 'has traded to do : ' + this.tradeTask : 'has not traded') + BR;
        let str31 = (this.resting === true ? `is resting for: ${this.restingTimer}` : 'not resting') + BR;
        let str4 = 'feel like doing: ' + this.FLD + BR;
        let str5 = 'resting time: ' + this.restingTime + BR;
        let str6 = '<div class="toggle">preferences:';
        //iterating through all the item one by one.
        Object.keys(this.preferences).forEach(val => {
            //getting all the keys in val (current array item)
            let keys = Object.keys(this.preferences[val]);
            let objAttribute = this.preferences[val];
            //assigning HTML string to the variable html
            str6 += "<div class = 'preference'>";
            //iterating through all the keys presented in val (current array item)
            keys.forEach(key => {
                //appending more HTML string with key and value aginst that key;
                str6 += "<strong>" + key + "</strong>: " + objAttribute[key] + "<br>";
            });
            //final HTML sting is appending to close the DIV element.
            str6 += "</div><br>";
        });
        str6 += '</div>';
        return str1 + str11 + str2 + str21 + str3 + str31 + str4 + str5 + str6;
    }
    /**
     * 
     */
    show() {
        if (this.showStatistics) {
            background(51)
            this.infographic();
        }
    }
    /**
     * 
     */
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
        printGraphic(`AGENT_ID${this.ID}FLD`, fld, this.preferenceColors.FLD, 1);
        printGraphic('\nRESTING \nTIME', rt, this.preferenceColors.restingTime, 1);
        // here we extract preferences and we NEEDS REFACTORING!!
        let i = 2;
        for (const el of TASK_LIST) {
            let pref = this.preferenceArchive.map(result => result.preferences[el.type]);
            let taskSkill = pref.map(result => result.skill_level);
            let taskPref = pref.map(result => result.task_preference);

            printGraphic(el.type, taskSkill, this.preferenceColors.skill, i);
            printGraphic('', taskPref, this.preferenceColors.preference, i);
            i++;
        }
        function printGraphic(str, arr, col, row_number) {
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
        /**
         * here we need to add the resting 
         * similar to working. resting should also get a timer
         */
        if (this.playerWorking) {
            this.playerTimer++;
            $('#timer').html(this.playerTimer);
            this.setInfo();
        }

        if (this.resting) {
            this.restingTimer -= timeUpdate();
            this.setInfo();
            if (this.restingTimer <= 0) {
                this.resting = false;
                this.setInfo();
            }
        }

        if (this.working && !this.isPlayer) {

            // console.log((1 / frameRate()) * TIME_SCALE);
            this.workingTimer -= timeUpdate();
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
    // setAgents(_agents) {
    //     this.agents = _agents;
    // }
    /**
     * We will need this later
     */
    setPosition(x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }
    /**
     * 
     * @param {*} task 
     */
    trade(task, agents) {
        /**
         * ATTENZIONE IMPORTANTE!!!!!!!!!!
         * don't forget to update the fld 
         * in task.js where the agent get brute-forced to do a task!
         */
        /**
         * 😯
         * CURIOUS BEHAVIOUR
         * Curious: tends to do as many different task as possible
         */
        if (this.behavior === 'curious') {
            if (this.preferenceArchive.length > 1) {
                const lastIndex = this.preferenceArchive.length - 1;
                const lastTask = this.preferenceArchive[lastIndex].executed_task;
                // console.log(lastTask);
                if (task.type === lastTask || this.FLD < 2) {
                    /**
                     * HERE THE AGENT TRADES
                     * either he takes another task or he rests
                     */
                    if (this.FLD < 2) {
                        // if the agent has enought resting time he rests
                        if (this.restingTime >= task.aot) {
                            this.rest(task);
                            return true;
                        }
                        else {
                            // the agent trades the task
                            this.stress++;
                            if (task.type === lastTask) assignTask(this);// if the task is the same as the last one than assign a new task 
                            else return false;// let the agent execute the task
                        }
                    } else if (task.type === lastTask) {
                        // here the agent trades for another task
                        assignTask(this);
                        return true;
                    }

                    function assignTask(agent) {
                        // let fld = this.preferenceArchive.map(result => result.feel_like_doing);
                        // const max = Math.max(...otherTasksCompleted);// magic trick
                        // we always check the last entry of the preference archive
                        let index = agent.preferenceArchive.length - 1;
                        if (index >= 0) {
                            let pref = agent.preferenceArchive[index].preferences;
                            let completed = [];
                            /**
                             * here we check for the task that was executed less often
                             */
                            Object.keys(pref).forEach(key => {
                                let objectAttr = pref[key]
                                completed.push(objectAttr.completed)
                            });
                            const minimum = Math.min(...completed);

                            /**
                             * here we make a pool of the task executed less often to be 
                             * randomly picked
                             */

                            let taskPool = [];
                            Object.keys(pref).forEach(key => {
                                let objectAttr = pref[key]
                                if (objectAttr.completed <= minimum) {
                                    taskPool.push(objectAttr.task_name);
                                }
                            });

                            /**
                             * now we pick a random task from the pool
                             */
                            let randomIndex = Math.floor(Math.random() * taskPool.length);
                            let toDoTask = taskPool[randomIndex];

                            /**
                             * now we assign the task to the agent
                             */

                            agent.hasTraded = true;
                            // need to keep track how often the agent traded
                            agent.tradeTask = toDoTask;// traded task should be different than this task
                            agent.setInfo();
                        }
                    }
                    return true;
                } else {
                    /**
                     * HERE HE EXECUTES THE TASK
                     * therefore we return true and the agent works
                     * look it up in task.js lines 200 - 202
                     */
                    // console.log('executing the task');

                    return false;
                }
            }
        }


        /**
         * 👨‍🚀
         * PERFECTIONIST BEHAVIOR
         * tends to execute only the task he wants to master
         */

        if (this.behavior === 'perfectionist') {
            if (task.type !== this.masterTask || this.FLD < 2) {
                if (this.FLD < 2) {
                    // here we handle the case in which the agent wants to rest
                    // if the agent has enought resting time he rests
                    if (this.restingTime >= task.aot) this.rest(task);
                    else {
                        // if the agent has no resting time than he 
                        // gets a random task assigned or he just executes
                        // the task
                        this.stress++;
                        if (task.type !== this.masterTask) {
                            // the agent decides to the task he wants to master
                            this.assignTradedTask(this.masterTask);
                        }
                        else return false;// let the agent execute the task
                    }
                    return true;
                } else if (task.type !== this.masterTask) {
                    this.assignTradedTask(this.masterTask);
                    return true;
                }
            } else {
                /**
                 * the agent executes the task because
                 * the type matches with the one he wants to master
                 */
                return false;
            }
        }


        /**
         * 🏖
         * GENIESSER BEAHAVIOR
         * uses his resting time whenever he has enough
         */

        if (this.behavior === 'geniesser') {
            if (this.restingTime >= task.aot || this.FLD < 2) {
                if (this.restingTime >= task.aot) {
                    // if the agent has enough resting time than he always rests
                    this.rest(task);
                    return true;
                } else {
                    this.stress++;
                    return false;// else he executes the task
                }
            } else {
                // the agent does not trade
                return false;
            }
        }


        /**
         * 🎩
         * Capitalist behavior
         * tries to accumulate as much as resting time as possible
         */

        if (this.behavior === 'capitalist') {
            /**
             * he takes all the tasks
             * and he rests only if the value of the task is really low
             */
            let taskValues = [];
            for (const task of TASK_LIST) {
                let obj = {
                    task_name: task.type,
                    task_value: taskValue(task.type)
                }
                taskValues.push(obj);
            }
            // console.log(taskValues);
            taskValues.sort((a, b) => a.task_value - b.task_value);
            // console.log(taskValues, 'sorted');
            if (this.FLD < 2 && taskValue(task.type) < 0.2 && this.restingTime >= task.aot) {
                this.rest(task);
                return true;
            } else {
                const lastElement = taskValues.length - 1
                if(taskValues[lastElement].task_value >= 0.5){
                    this.assignTradedTask(taskValues[lastElement].task_name);
                    return true;
                } else return false;
            }

            function taskValue(task_name) {
                let counter = agents.length;
                const NUMBER_OF_AGENTS = agents.length;
                for (const agent of agents) {
                    // we go through all the agents if their preferred task matches 
                    // this task we add one to the counter
                    let prefererence = agent.preferredTask();
                    if (prefererence === task_name) {
                        counter--;
                    }
                }
                return ((NUMBER_OF_AGENTS - counter) / NUMBER_OF_AGENTS);
            }
        }





















        // // this.behaviour.trade(task);
        // // first we check if the agent is the human player
        // // that has not traded
        // if (this.isPlayer && !this.hasTraded) {
        //     // console.log(agent.ID);
        //     noLoop();
        //     console.log('noLoop');
        //     // console.log(`noLoop ${agent.isPlayer}, ${agent.hasTraded}`)
        //     this.playerInteraction(task);
        //     return true;
        // }
        // /**
        //  * here we compute the skill of the agent.
        //  * given its skill level we compute the amount of time he needs to 
        //  * complete if he needs more time than the original time needed to
        //  * complete the task than the agent will trade
        //  */
        // let skill = this.getPreferences(task.type).skill_level; // here we get the skill
        // let timeNeeded = task.amountOfTimeBasedOnSkill(skill); // we compute the time he needs
        // let result = task.aot - timeNeeded; // and we compute the result that is either a positive or negative number
        // // console.log(skill, timeNeeded, result);
        // /**
        //  * preference also influences the trading algorithm
        //  * if the preference for that task is high enough 
        //  * the agent will execute it even if it takes a lot of time
        //  */
        // let taskPreference = this.getPreferences(task.type).task_preference;
        // if (this.isPlayer || (this.FLD >= 20 && (result >= 0 || taskPreference > 90))) {// let's test without trading
        //     // if not trading
        //     // this.makeInfo(`AGENT: ${this.ID} is doing the task!,  FLD ${this.FLD}, time: ${result}, pref: ${taskPreference}`);
        //     // this.updateAttributes(task, true);
        //     // increase resting time
        //     // console.log(`execute task ${task.type}`);
        //     this.setInfo();
        //     return false;
        // } else if (this.FLD < 2 && this.restingTime > task.aot) {
        //     // here we return the resting time to the task global resting time
        //     // this needs to be updated with the lazyness as a factor and available resting time
        //     /**
        //      * NOT DOING THE TASK
        //      * updateAttributes()
        //      * occupied = true
        //      * decrease resting time
        //      */
        //     // console.log(`too lazy FLD: ${this.FLD}, rest time : ${this.restingTime}`);
        //     // this.working = true;
        //     // this.workingTimer = 2 * TIME_SCALE;
        //     // if (this.restingTime > 0) {

        //     // }
        //     // this.restingTime -= task.aot;
        //     // task.updateGRT(task.aot);
        //     // // this.restingTime /= 2;// here add slider that chenges how much resting time is decreased
        //     // // this.makeInfo(`AGENT: ${this.ID} is resting. Resting time ${this.restingTime}`);
        //     // this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
        //     // this.resting = true;
        //     // this.restingTimer = task.aot;
        //     // // this.updateAttributes(task, true);
        //     // this.setInfo();
        //     this.rest(task);
        //     return true;
        // } else {
        //     /**
        //      * therefore available for another task.
        //      */
        //     // console.log(`trade this: ${task.type}`);
        //     this.hasTraded = true;
        //     // need to keep track how often the agent traded
        //     this.tradeTask = this.randomTask(task.type);// traded task should be different than this task
        //     // this.makeInfo(`AGENT: ${this.ID} has traded task ${task.type} for ${this.tradeTask}`);
        //     this.setInfo();
        //     return true;
        // }
    }
    /**
     * 
     * @param {*} task 
     */
    playerInteraction(task) {
        this.playerTaskToExecute = task;
        // needs to be done in the index.html
        $('.player-interface').toggle();
        // console.log($('.player-interface')[0].attributes[1].value)
        document.getElementById('task-name').innerHTML = task.type;
        // $('#yes').val = this.ID;
        document.getElementById('yes').value = this.ID;// we set the ID as value so we can use it later to find the agent in the array
        // let interactionP = document.createElement('p');
        // here we handle a positive answer
        // $('#yes').click(() => {
        //     // here a new window should open
        //     // this.work()
        // });
        // the following code is to keep the first option always selected
        document.getElementById('other-tasks').options[0].selected = true;
        let i = 0;
        for (const t of TASK_LIST) {
            if (t.type !== task.type) {
                $('#task-' + (i + 1))
                    .html(t.type)
                    .val(t.type);
                i++
            }
        }
    }
    /**
     * ADD DESCRIPTION
     * @param {*} agents 
     */
    playerWorks(agents) {
        // here the player timer should start
        noLoop();
        console.log('noLoop');
        $('.player-work').show();
        this.working = true;
        this.updateAttributes(this.playerTaskToExecute, agents);
        this.currentTask = this.playerTaskToExecute.type;

        this.setInfo();
        // console.log('player works!', this.working);
        // let skill = this.getPreferences(this.playerTaskToExecute.type).skill_level;
        // console.log(skill);
        // let time = this.playerTaskToExecute.amountOfTimeBasedOnSkill(skill);
        // this.work(time, this.playerTaskToExecute, agents);
    }
    /**
     * 
     * @param {*} task_name 
     */
    playerTrades(task_name) {
        this.hasTraded = true;
        console.log(this.hasTraded);
        this.tradeTask = task_name;
        console.log(this.tradeTask);
        this.setInfo();
        // console.log(this);
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

    rest(task) {
        this.restingTime -= task.aot;
        task.updateGRT(task.aot);
        // this.restingTime /= 2;// here add slider that chenges how much resting time is decreased
        // this.makeInfo(`AGENT: ${this.ID} is resting. Resting time ${this.restingTime}`);
        console.log(`AGENT: ${this.ID} is resting. Behavior ${this.behavior} Resting time ${this.restingTime}`);
        this.FLD = MAXIMUM;// ?? should the FLD go to maximum??
        this.resting = true;
        this.restingTimer = task.aot;
        // this.updateAttributes(task, true);
        this.setInfo();
    }

    assignTradedTask(task_name) {
        this.hasTraded = true;
        this.tradeTask = task_name;
        this.setInfo();
    }

    /**
     * @returns a random task
     */
    randomTask(task_name) {

        // here we can check the preference for the task?

        // traded task should be different than this task
        let result = ''
        let loop = true;
        while (loop) {
            // const index = Math.floor(Math.random() * this.preferences.length);
            let randObj = random(TASK_LIST);
            if (randObj.type !== task_name) {
                result = randObj.type;
                loop = false;
                break;
            }
        }
        // console.log(`result: ${result}`)
        return result;
    }
    /**
     * 
     * @param {Array} task 
     * @param {Array} agents 
     */
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
        // let taskName = task.type;
        this.updateCompletedTasks(task.type);
        this.updateFLD(agents);
        // this.FLD = ;
        // console.log(`${this.ID}_value: ${task.value}`);
        this.restingTime += task.value;// * task_executed == true ? 1 : -1;
        // console.log(this.restingTime);
        // console.log(`executed task: ${this.restingTime}, value: ${task.value}`);
        /**
         * the magik trick below let us to push the preferences
         * without copying the reference to the original array 
         */
        let insert = JSON.parse(JSON.stringify(this.preferences));// the trick
        this.preferenceArchive.push({
            preferences: insert,
            executed_task: task.type,
            resting_time: this.restingTime,
            feel_like_doing: this.FLD,
            traded: this.hasTraded === true ? this.tradeTask : ''
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
        let myObj = this.preferences;
        Object.keys(myObj).forEach(key => {
            let pref = myObj[key];
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
        });
        // for (const pref of this.preferences) {
        // }
        // console.log(this.preferenceArchive, counter, task_name);
    }
    /**
     * updates the completed task preference by adding +1
     * @param {String} task_name 
     */
    updateCompletedTasks(task_name) {
        this.totalTaskCompleted++;
        let myObj = this.preferences;
        Object.keys(myObj).forEach(key => {
            if (myObj[key].task_name === task_name) {
                myObj[key].completed++;
            }
        });
    }

    updateFLD(agents) {
        /**
          * this algorithm looks how much the other agents have been 
          * working. If the others are working more than this agent than
          * his FLD decreases slower, if he is working more than it 
          * decreses faster.
          * it could be possible to introduce the concept of groups here where 
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
    // /**
    //  * updates the task_preference in this.preferences by adding +1
    //  * @param {String} task_name 
    //  */
    // updateTaskPreference(task_name) {
    //     let myObj = this.preferences;
    //     Object.keys(myObj).forEach(key => {
    //         if(myObj[key].task_name === task_name){
    //             myObj[key].completed++;
    //         }
    //     });
    //     // for (const el of this.preferences) {
    //     //     if (el.task_name.includes(task_name)) {
    //     //         el.completed++;
    //     //         break;
    //     //     }
    //     // }
    // }

    /**
     * @param {String} task_name 
     * @return the preferences of that specific task
     */
    getPreferences(task_name) {
        let result = {};
        let myObj = this.preferences;
        Object.keys(myObj).forEach(key => {
            if (myObj[key].task_name === task_name) {
                result = myObj[key];
            }
        });
        return result;
    }

    /**
     * @returns the preferred task of an agent
     */
    preferredTask() {
        let max = 0;
        let myObj = this.preferences;
        let result = ''
        Object.keys(myObj).forEach(key => {
            let pref = myObj[key].task_preference;
            let name = myObj[key].task_name;
            if (pref > max) {
                max = pref;
                result = name;
            }
        });
        return result;
    }
    /**
     * @returns the preferences as an array of 10 elements
     */
    getPreferencesAsArray() {
        let arr = [];
        arr.push(this.FLD);
        arr.push(this.restingTime);
        Object.keys(this.preferences).forEach(val => {
            let keys = Object.keys(this.preferences[val]);
            let objAttribute = this.preferences[val];
            keys.forEach(key => {
                if (key === 'skill_level' || key === 'task_preference') arr.push(objAttribute[key]);
            });
        });
        return arr;
    }
    /**
     * @param {Array} arr Array of task objects
     * @returns an Array of objects with the preference for each task
     */
    makePreferences(arr) { // MAYBE NEEDSD REFACTORING MAKING IT AN OBJECT RATHER THAN A ARRAY OF OBJECTS
        const PREFERENCE_OFFSET = 30;

        let result = {};
        for (const el of arr) {
            let skill = randomMinMAx();
            result[el.type] = {
                task_name: el.type,
                completed: 0, // how many the task has been completed
                skill_level: skill,
                task_preference: this.calculatePreference(skill, PREFERENCE_OFFSET)
            }
        }
        // console.log(result);
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



