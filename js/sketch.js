

function  WIDTH(){return innerWidth * 0.64};

let agents = [];
let tasks = [];
function setup() {
  createCanvas(WIDTH(), windowHeight - 4);
  for (let i = 0; i < AGENT_NUM; i++)agents.push(new Agent(TASK_LIST, i + 1, 10 + i * 11, height * 0.9));
  for (const agent of agents) {
    agent.setAgents(agents);
  }
  let i = 0;
  for(let j = 0; j < 10; j++){
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
    agent.update(agents, tasks);
  }

  for (const task of tasks) {
    task.show();
    task.updateUrgency(agents);
  }
}

function windowResized(){
  resizeCanvas(WIDTH(), innerHeight);
}