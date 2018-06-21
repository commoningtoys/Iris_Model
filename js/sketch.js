let agents = [];
function setup() {
  createCanvas(innerWidth, innerHeight);
  for (let i = 0; i < 10; i++)agents.push(new Agent(TASK_LIST, 10 + i * 11, height * 0.9))
}

function draw() {
  background(51);
  for (const agent of agents) {
    agent.show();
  }
}

function windowResized(){
  resizeCanvas(innerWidth, innerHeight);
}