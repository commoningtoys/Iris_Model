const PLAYER_ID = 'PLAYER'

function WIDTH() { return innerWidth * 0.64 };

let agents = [];
let tasks = [];
function setup() {
  createCanvas(WIDTH(), windowHeight - 4);
  for (let i = 0; i < 10; i++)agents.push(new Agent(TASK_LIST, i + 1, false));
  agents.push(new Agent(TASK_LIST, PLAYER_ID, true));
  // for (const agent of agents) {
  //   agent.setAgents(agents);
  // }
  let i = 0;
  for (let j = 0; j < 1; j++) {
    for (const task of TASK_LIST) {
      tasks.push(new Task(task, 20 + (i * 12), height * 0.65));
      i++;
    }
  }
}

function draw() {

  background(51);
  for (const agent of agents) {
    agent.show();
    agent.update();
    // agent.setInfo();
  }

  for (const task of tasks) {
    // task.show();
    task.updateUrgency(agents);
  }
}

function windowResized() {
  resizeCanvas(WIDTH(), innerHeight);
}

function mouseClicked() {
  // window.getAttention();
  // console.log(self);
}

function playerExecuteTask() {
  // console.log('YES');
  let task_name = $('#task-name').text();
  // console.log(task_name);
  let agent = agents.filter(obj => obj.ID === PLAYER_ID);
  agent[0].playerWorks(agents);
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

function playerTradeTask() {
  let el = $('select#other-tasks option:selected');
  let agent = agents.filter(obj => obj.ID === PLAYER_ID);
  // console.log(el.text());
  agent[0].playerTrades(el.text());
  loop();
  $('.player-interface').toggle();
  // console.log($('.player-interface')[0].attributes[1].value);
}

function startPlayerTime(){
  console.log('start');
  let agent = returnPlayerAgent(PLAYER_ID);
  agent.playerTimer = 0;
  agent.playerWorking = true;
  console.log(agent.playerWorking);
  loop();
}

function stopPlayerTime(){
  console.log('stop');
  let agent = returnPlayerAgent(PLAYER_ID);
  agent.playerWorking = false;
  agent.working = false;
  if(agent.hasTraded){
    agent.hasTraded = false;
    agent.tradeTask = '';
  }
  agent.setInfo();
  setTimeout(()=>{
    $('.player-work').hide('fast')
  }, 500)
}

function returnPlayerAgent(player){
  return agents.filter(obj => obj.ID === player)[0];
}