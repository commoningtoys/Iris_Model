

function WIDTH() { return innerWidth * 0.64 };

let agents = [];
let tasks = [];
function setup() {
  createCanvas(WIDTH(), windowHeight - 4);
  for (let i = 0; i < 5; i++)agents.push(new Agent(TASK_LIST, i + 1, false));
  agents.push(new Agent(TASK_LIST, AGENT_NUM + 1, true));
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

function mouseClicked(){
  // window.getAttention();
  // console.log(self);
}