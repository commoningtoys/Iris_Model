class IrisModel {
    constructor(num_agents, num_players, num_task) {
        this.agents = [];
        this.tasks = [];
        this.GLOBAL_RESTING_TIME = this.calcGlobalRestTime(num_agents, num_task);
        // add agents
        for (let i = 0; i < num_agents; i++) {
            // let randomIndex = Math.floor(Math.random() * 4);
            let index = i % AGENT_BEHAVIORS.length;
            this.agents.push(new Agent(TASK_LIST, i + 1, false, AGENT_BEHAVIORS[index]));
        }
        // add players
        for (let i = 0; i < num_players || 0; i++) {
            this.agents.push(new Agent(TASK_LIST, i + 1, true))
        }
        // make the info for all of the agents
        for (const agent of this.agents) {
            agent.makeInfo(this.agents);
            agent.setInfo();
        }
        // add tasks
        let restingTimePerTask = Math.floor(this.GLOBAL_RESTING_TIME / (TASK_LIST.length * num_task))
        for (let i = 0; i < num_task; i++) {
            for (const task of TASK_LIST) {
                this.tasks.push(new Task(task, restingTimePerTask));
            }
        }
        this.timeUnit = TIME_SCALE;

        this.hours = 0;
        this.days = 0;
        this.weeks = 0;
        this.months = 0;
        this.years = 0;
        this.getTotalRestingTime();
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
        for (const agent of this.agents) {
            agent.show();
            agent.update();
            // drawInfos(agent);
            // agent.setInfo();
        }

        for (const task of this.tasks) {
            // task.show();
            task.updateUrgency(this.agents);
        }

        this.timeUnit++;
        this.setModelTime();
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
        console.log(agent);
        agent.playerTrades(el.text());
        loop();
        $('.player-interface').toggle();
        // console.log($('.player-interface')[0].attributes[1].value);
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