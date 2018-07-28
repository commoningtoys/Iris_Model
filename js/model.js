class IrisModel {
    constructor(num_agents, num_players, num_task) {
        this.agents = [];
        this.tasks = [];
        // add agents
        for (let i = 0; i < num_agents; i++) {
            this.agents.push(new Agent(TASK_LIST, i + 1, false));
        }
        // add players
        for(let i = 0; i < num_players || 0; i++){
            this.agents.push(new Agent(TASK_LIST, i + 1, true))
        }
        // add tasks
        for(let i = 0; i < num_task; i++){
            for (const task of TASK_LIST) {
                this.tasks.push(new Task(task));
            }
        }
    }

    update(){
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