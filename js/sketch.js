let agents = [];
let tasks = [];
function setup() {
  createCanvas(innerWidth, innerHeight);
  for (let i = 0; i < 10; i++)agents.push(new Agent(TASK_LIST, 10 + i * 11, height * 0.9));
  let i = 0;
  for (const task of TASK_LIST) {
    tasks.push(new Task(task, 20 + (i * 12), height * 0.65));
    i++;
  }
}

function draw() {
  background(51);
  for (const agent of agents) {
    agent.show();
  }

  for (const task of tasks) {
    task.show();
    task.updateUrgency();
  }
}

function windowResized(){
  resizeCanvas(innerWidth, innerHeight);
}