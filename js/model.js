class IrisModel {
    constructor(parent, behaviours, min_wage, num_task, num_players) {
        // console.log(behaviours);
        this.agents = [];
        this.tasks = [];
        /**
         * here below we fill our Agents array
         * 
         * first we extract all the behaviors that
         * have been passed from the object into an array
         */
        let behaviorList = [];
        let agentsNum = 0;
        Object.keys(behaviours).forEach(key => {
            console.log(key, behaviours[key]);
            for (let i = 0; i < behaviours[key]; i++) {
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
        this.plot = new Plot(parent, 20, 20);
        this.pointIndex = 0;
        this.colors = [
            color(0, 255, 0),
            color(255, 0, 255),
            color(0, 255, 255),
            color(255, 0, 0),
            color(255, 255, 0),
            color(0, 0, 255),
            color(0, 255, 100),
            color(255, 125, 0)
        ];

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
        // here we extract all the curious agents
        let curious = this.agents.filter(result => result.behavior === 'curious');
        // here we need to extract all the preferences values 
        // and calculate the median
        const len = curious.length;
        let result = {
            fld: [],
            rt: [],
            stress: [],
            aot: [],
            traded: [],
            brute_force: []
        }
        for (const agent of curious) {
            const fld = agent.preferenceArchive.map(result => result.feel_like_doing);
            const rt = agent.preferenceArchive.map(result => result.resting_time);
            const stress = agent.preferenceArchive.map(result => result.stress_level);
            const aot = agent.preferenceArchive.map(result => result.amount_of_time);
            const traded = agent.preferenceArchive.map(result => result.traded);
            const bruteForce = agent.preferenceArchive.map(result => result.brute_force);
            // sumArray(result.fld, fld);
            result.fld.push(fld);
        }

        // console.log(result.fld);
        // here we get the array with the lowest amount of elements
        const minLen = Math.min(...result.fld.map(result => result.length));
        let sum = [];
        for(let i = 0; i < result.fld.length; i++){
            for(let j = 0; j < minLen; j++){
                // console.log(i, j, result.fld[i], result.fld[0][j])
                if(sum[j] === undefined || sum[j] === null)sum[j] = 0;
                sum[j] += result.fld[i][j];
            }
        }
        // get the median
        for (let i = 0; i < sum.length; i++)sum[i] /= len;
        this.plot.show(sum[sum.length - 1], this.pointIndex);
        this.pointIndex++;
        this.agents.sort((a, b) => a.ID - b.ID);

        // here we have to build the filter to visualize the agents
        // for (let i = this.showFrom; i < this.showTo; i++) {
        //     // for (const agent of this.agents) {
        //     let agent = this.agents[i];
        //     if (singleView) agent.infographic();
        //     else drawInfos(agent);
        // }

        function drawInfos(agent) {
            strokeWeight(1);
            let infos = agent.getPreferencesAsObject();
            let i = 0;
            // rect(100, 100, 100, 100)
            noFill();
            stroke(255);
            for (let index = 0; index < Object.keys(infos).length; index++) {
                let diagramX = map(index, 0, Object.keys(infos).length, PADDING, width - PADDING);
                line(diagramX, height - PADDING, diagramX, height - COL_HEIGHT);
            }
            stroke(agent.color);
            beginShape();
            Object.keys(infos).forEach(val => {

                let posX = map(i, 0, Object.keys(infos).length, PADDING, width - PADDING);
                let posY;
                if (typeof infos[val] === 'boolean') {
                    // if is a boolean
                    let value = infos[val] === true ? 1 : 100;
                    posY = map(value, MINIMUM, MAXIMUM, height - PADDING, height - COL_HEIGHT);
                }
                else {
                    // if the value is a number
                    posY = map(infos[val], MINIMUM, MAXIMUM, height - PADDING, height - COL_HEIGHT);
                }
                // text(val, posX, height - COL_HEIGHT)
                vertex(posX, posY);
                i++;

            })
            endShape();
            // console.log(infos);
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
        console.log('RECORDING');
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
        $('#set-min-wage').text(val);
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