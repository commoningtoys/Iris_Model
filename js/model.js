class IrisModel {
    constructor(behaviors, min_wage, num_task, num_players) {
        // console.log(behaviors);
        this.agents = [];
        this.tasks = [];
        this.behaviors = behaviors;
        /**
         * here below we fill our Agents array
         * 
         * first we extract all the behaviors that
         * have been passed from the object into an array
         */
        let behaviorList = [];
        let agentsNum = 0;
        Object.keys(behaviors).forEach(key => {
            console.log(key, behaviors[key]);
            for (let i = 0; i < behaviors[key]; i++) {
                behaviorList.push(key);
                agentsNum++;
            }
        });
        /**
         * in order to have them more omogenous distributed we 
         * shuffle the array containing the bahaviors
         * and than we fill the agents array and we assign their behaviors
         */
        shuffleArray(behaviorList);
        let index = 0;
        for (const behavior of behaviorList) {
            this.agents.push(new Agent(TASK_LIST, index, false, behavior));
            index++;
        }
        // add players
        for (let i = 0; i < num_players || 0; i++) {
            this.agents.push(new Agent(TASK_LIST, agentsNum + i, true, 'curious'))
            agentsNum++;
        }
        // here we set the max value of the slider that shows the agents
        const slider = document.getElementById('view')
        slider.max = agentsNum;

        this.GLOBAL_RESTING_TIME = this.calcGlobalRestTime(agentsNum, num_task);
        // make the info for all of the agents
        for (const agent of this.agents) {
            agent.makeInfo(this.agents);
            agent.setInfo();
        }
        // add tasks
        let restingTimePerTask = Math.floor(this.GLOBAL_RESTING_TIME / (TASK_LIST.length * num_task))
        for (let i = 0; i < num_task; i++) {
            for (const task of TASK_LIST) {
                this.tasks.push(new Task(task, restingTimePerTask, min_wage));
            }
        }
        this.counter = 0;

        this.timeUnit = 0;

        this.hours = 0;
        this.days = 0;
        this.weeks = 0;
        this.months = 0;
        this.years = 0;
        this.getTotalRestingTime();

        /**
         * PLOT
         */

        this.colors = {
            // skill: color(0, 255, 0),
            // preference: color(255, 0, 255),
            fld: color(0, 255, 255),
            rt: color(255, 0, 0),
            stress: color(255, 255, 0),
            aot: color(45, 105, 245),
            traded: color(0, 255, 100, 150),
            brute_force: color(255, 125, 0, 150)
        };

        // this.plot = new Plot(parent, 20, 20, this.colors);
        this.pointIndex = 0;

        this.numShowAgents = 5;
        this.showFrom = 0;
        this.showTo = this.numShowAgents;

        this.recordAgentsData = false;
        this.recordDataCounter = 0;
        this.dataCollected = 0;
    }
    /**
     * calculates the global amount of time the agents have for resting
     * it doubles the amount of time needed to finish all the tasks by an agent
     * multiplied by two and by all the agents
     * @param {Number} num_agents 
     * @param {Number} num_task 
     * @returns the global amount of time the agents have to rest
     */
    calcGlobalRestTime(num_agents, num_task) {
        let amountOfTime = 0;
        for (let i = 0; i < num_task; i++) {
            let time = TASK_LIST.map(result => result.amount_of_time);//returns an array of amount of time
            amountOfTime += time.reduce((a, b) => a + b);
        }
        amountOfTime /= 2;
        amountOfTime *= num_agents;
        console.log(amountOfTime);
        return amountOfTime;
    }
    update() {
        // for(let i = 0; i < 10; i++){
        for (const agent of this.agents) {
            // let agent = this.agents[i];
            agent.update();
            // drawInfos(agent);
            // agent.setInfo();
        }

        for (const task of this.tasks) {
            // task.show();
            task.updateUrgency(this.agents);
        }
        // this needs refactoring
        if (this.counter % TIME_SCALE == 0) {
            this.timeUnit++;

            this.setModelTime();
        }
        this.counter++;
        // console.log(this.counter, this.timeUnit);
        // if we are recording the data, we show how much has been collected
        if (this.recordAgentsData) {
            for (const agent of this.agents) {
                this.dataCollected += agent.data.length;
            }
            $('#data-collected').text(this.dataCollected);
        }
    }
    show() {
        // console.log('show')
        /**
         * here we sort the agents array that was shuffled 
         * during the choose agent process of task.js
         */
        background(51);
        /**
            let fld = this.preferenceArchive.map(result => result.feel_like_doing);
            let rt = this.preferenceArchive.map(result => result.resting_time);
            let stress = this.preferenceArchive.map(result => result.stress_level);
            let aot = this.preferenceArchive.map(result => result.amount_of_time);
            let traded = this.preferenceArchive.map(result => result.traded);
            // console.log(traded);
            let bruteForce = this.preferenceArchive.map(result => result.brute_force);
         */
        const medianValuesByBehavior = {};
        for (const behavior of AGENT_BEHAVIORS) {
            const median = {};
            // here we extract the preferences of the agents by behavior
            const extractedAgents = this.agents.filter(result => result.behavior === behavior);
            if (extractedAgents.length == 0) continue;// if there is no extracted agent, than we skip to the next behavior
            // here we get the lenght of our data set
            const len = extractedAgents.length;
            const agentsData = {
                fld: [],
                rt: [],
                stress: [],
                aot: [],
                traded: [],
                brute_force: []
            }
            // here we extract all the preferences values 
            for (const agent of extractedAgents) {
                const fld = agent.preferenceArchive.map(result => result.feel_like_doing);
                const rt = agent.preferenceArchive.map(result => result.resting_time);
                const stress = agent.preferenceArchive.map(result => result.stress_level);
                const aot = agent.preferenceArchive.map(result => result.amount_of_time);
                const traded = agent.preferenceArchive.map(result => result.traded);
                const bruteForce = agent.preferenceArchive.map(result => result.brute_force);
                // sumArray(result.fld, fld);
                agentsData.fld.push(fld);
                agentsData.rt.push(rt);
                agentsData.stress.push(stress);
                agentsData.aot.push(aot);
                agentsData.traded.push(traded);
                agentsData.brute_force.push(bruteForce);
            }
            // const median = {};
            // and calculate the median
            Object.keys(agentsData).forEach(key => {
                // console.log(result.fld);
                // here we get the array with the lowest amount of elements
                // to calculate the median we need all the arrays to be the same length
                // threfore we compute the minimum length of all the arrays
                // console.log(agentsData);
                const minLen = Math.min(...agentsData[key].map(result => result.length));
                // console.log(minLen);
                let sum = Array(minLen).fill(0);
                // console.log(sum);
                for (let i = 0; i < agentsData[key].length; i++) {
                    for (let j = 0; j < minLen; j++) {
                        // console.log(i, j, agentsData.fld[i], agentsData.fld[0][j])
                        // if (sum[j] === undefined || sum[j] === null) sum[j] = 0;
                        if (key === 'traded' || key === 'brute_force') {
                            sum[j] += agentsData[key][i][j] == true ? 1 : 0;
                        } else {
                            sum[j] += agentsData[key][i][j];
                        }
                    }
                }
                // console.log(result.fld);
                // get the median
                if (key === 'traded' || key === 'brute_force') { } else {
                    for (let i = 0; i < sum.length; i++)sum[i] /= len;
                }
                median[key] = sum;
            });
            // median.number_of_agents = len;
            // median['agents'] = len;
            // console.log(median, behavior);
            medianValuesByBehavior[behavior] = median;
        }
        // console.log(medianValuesByBehavior);
        this.infographic(medianValuesByBehavior);
        // console.log(medianValuesByBehavior);
        // this.plot.show(median, this.pointIndex);
        this.pointIndex++;
        this.agents.sort((a, b) => a.ID - b.ID);

        // here we have to build the filter to visualize the agents
        // for (let i = this.showFrom; i < this.showTo; i++) {
        //     // for (const agent of this.agents) {
        //     let agent = this.agents[i];
        //     if (singleView) agent.infographic();
        //     else drawInfos(agent);
        // }
    }
    infographic(data) {
        const INFO_WIDTH = (width - ((2 * LEFT_GUTTER) + (2 * PADDING))) / 2;
        const INFO_HEIGHT = (height - (3 * PADDING)) / 2;
        let infoX = LEFT_GUTTER;
        let infoY = PADDING;
        let i = 0;
        Object.keys(data).forEach(key => {
            // console.log(data[key], key)
            infoX = LEFT_GUTTER + ((width / 2) * (i % 2));
            if (i > 1) {
                // infoX = LEFT_GUTTER;
                infoY = 2 * PADDING + INFO_HEIGHT;
            }
            fill(0);
            noStroke();
            rect(infoX, infoY, INFO_WIDTH, INFO_HEIGHT);
            fill(255);
            textAlign(CENTER, CENTER)
            text(`${key}: ${this.behaviors[key]} agents`, infoX, infoY - PADDING, INFO_WIDTH, PADDING);
            let lines = 0;
            Object.keys(this.colors).forEach(pref => {
                textAlign(RIGHT, CENTER);
                fill(this.colors[pref])
                text(pref, infoX - 10, (infoY + 50) + (lines * TEXT_SIZE));
                lines++;
            })
            const preferences = data[key];
            Object.keys(preferences).forEach(pref => {
                if (pref === 'traded' || pref === 'brute_force') {
                    // console.log(pref);
                    drawLine(preferences[pref], infoX, infoY, this.colors[pref], pref)
                } else {
                    printGraphic(preferences[pref], infoX, infoY, this.colors[pref]);
                }
            })
            i++;
        })

        function printGraphic(arr, x, y, col) {
            // let colNumber = col_number || 0;
            // let totCol = tot_col || 1;
            // noStroke();
            // fill(col);
            // text(str, PADDING / 2, posY(MAXIMUM, row_number));
            noFill();
            stroke(col);
            strokeWeight(1);
            let i = 0;
            push();
            translate(x, y)
            beginShape();
            for (const val of arr) {
                let currX = map(i, 0, arr.length, 0, INFO_WIDTH);//posX(i, arr.length, colNumber, totCol);
                let currY = INFO_HEIGHT - map(val, 0, MAXIMUM, 0, INFO_HEIGHT);//posY(val, row_number);
                vertex(currX, currY);
                i++;
            }
            endShape();
            pop();
        }

        function drawLine(arr, x, y, col, type, type2) {
            strokeWeight(1);
            stroke(col);
            push()
            translate(x, y)
            let index = 0;
            for (const val of arr) {
                // if (val) {
                const max = INFO_WIDTH / DATA_POINTS;
                let r = map(val, 0, 10, 0, max);
                let h = 3 + map(val, 0, 15, 1, INFO_HEIGHT * 0.2)
                // console.log(INFO_WIDTH / DATA_POINTS, INFO_WIDTH, DATA_POINTS, val)
                const currX = map(index, 0, arr.length, 0, INFO_WIDTH);
                let currY;
                let positionY;
                if (type === 'traded') {
                    // ellipse(currX + (r / 2), INFO_HEIGHT * 0.33333, r);
                    // rect(currX + (r / 2), INFO_HEIGHT * 0.33333, 1, -h);
                    line(currX, (INFO_HEIGHT * 0.33333) - (h / 2), currX, (INFO_HEIGHT * 0.33333) + (h / 2));
                } else {
                    // ellipse(currX + ((r * 10)/ 2), INFO_HEIGHT * 0.66666, r * 10);
                    // rect(currX + ((r * 10) / 2), INFO_HEIGHT * 0.66666, 1, -h);
                    line(currX, (INFO_HEIGHT * 0.66666) - (h / 2), currX, (INFO_HEIGHT * 0.66666) + (h / 2));
                }

                // line(currX, positionY, currX, currY); //posY(MINIMUM, ROW_NUMBER), posX(MAXIMUM, MAXIMUM), posY(MINIMUM, ROW_NUMBER)
                index++;
                // }
            }
            pop();
        }
    }

    setModelTime() {
        if (this.timeUnit > 0 && this.timeUnit % TS_FRACTION == 0) {
            this.hours++;
        }
        if (this.hours > 0 && this.hours % 24 == 0) {
            this.days++;
            this.hours = 0;
        }
        if (this.days > 0 && this.days % 30 == 0) {
            this.months++;
            this.days = 0;
        }
        if (this.months > 0 && this.months % 12 == 0) {
            this.years++;
            this.months = 0;
            this.weeks = 0;
        }
        let currentDate = `years: ${this.years}<br>months: ${this.months}<br>days: ${this.days}<br>hours: ${this.hours}`;
        // console.log(currentDate);
        document.getElementById('display-date').innerHTML = currentDate;
    }

    getTotalRestingTime() {
        let sumAgent = 0;
        for (const agent of this.agents) {
            sumAgent += agent.restingTime;
        }
        let sumTask = 0;
        for (const task of this.tasks) {
            sumTask += task.GRT;
        }
        console.log(`agent resting time: ${sumAgent}, task GRT: ${sumTask} GLOBAL ${this.GLOBAL_RESTING_TIME}`);
    }

    recordData() {
        console.log('RECORDING...');
        this.recordAgentsData = !this.recordAgentsData;
        if (this.recordAgentsData) {
            for (const agent of this.agents) {
                agent.data = []; // empty the data set
                agent.recordData = true;
            }
            $('#record-data').html('<span id="data-collected"></span> entries<br>(click again to save)');
        } else {
            $('#record-data').text('RECORD DATA');
            for (const agent of this.agents) {
                agent.recordData = false;
            }
            saveRAWData(this.agents, this.recordDataCounter);
            this.dataCollected = 0;
            this.recordDataCounter++;
        }
    }

    setMinWage(val) {
        console.log(val);
        for (const task of tasks) {
            task.minWage = val;
        }
        
    }
    setAgentsBehavior(behavior) {
        console.log(behavior);
        for (const agent of this.agents) {
            agent.behavior = behavior;
            agent.makeInfo(this.agents);
            agent.setInfo();
        }
    }
    setView(val) {
        console.log(val);

        this.showFrom = val - 2;
        this.showTo = val + 3;
        if (this.showFrom < 0) this.showFrom = 0;
        if (this.showTo > this.agents.length) this.showTo = this.agents.length;
    }
    /**
     * player interactions below
     */
    playerExecuteTask() {
        // console.log('YES');
        let task_name = $('#task-name').text();
        // console.log(task_name);
        let agent = this.returnPlayerAgent();
        console.log(agent);
        agent.playerWorks(this.agents);
        // let task = tasks.filter(obj => obj.type === task_name);
        // task = task.filter(obj => {
        //   for(const a of obj.agentsPool){
        //     a.ID === PLAYER_ID;
        //     return obj;
        //     // break
        //   }
        // })
        // loop();
        $('.player-interface').toggle();
    }

    playerTradeTask() {
        let el = $('select#other-tasks option:selected');
        let agent = this.returnPlayerAgent();
        // console.log(agent);
        agent.playerTrades(el.text());
        loop();
        $('.player-interface').toggle();
        // console.log($('.player-interface')[0].attributes[1].value);
    }

    playerRest() {
        console.log('REST');
        const agent = this.returnPlayerAgent();
        agent.playerRests()
        loop();
        $('.player-interface').toggle();
    }

    startPlayerTime() {
        console.log('start');
        let agent = this.returnPlayerAgent();
        agent.playerTimer = 0;
        agent.playerWorking = true;
        console.log(agent.playerWorking);
        loop();
    }

    stopPlayerTime() {
        console.log('stop');
        let agent = this.returnPlayerAgent();
        // updateAttributes(task, agents, brute_forced, _amount_of_time)
        agent.updateAttributes(agent.playerTaskToExecute, this.agents, false, agent.playerTimer);
        agent.playerWorking = false;
        agent.working = false;
        if (agent.hasTraded) {
            agent.hasTraded = false;
            agent.tradeTask = '';
        }
        agent.setInfo();
        setTimeout(() => {
            $('.player-work').hide('fast')
        }, 500)
    }

    returnPlayerAgent() {
        return this.agents.filter(obj => obj.ID === document.getElementById('yes').value)[0];
    }
}