const PLAYER_ID = 'PLAYER'

let singleView = true;
function WIDTH() { return innerWidth * 0.64 };
function HEIGHT() { return PADDING + (agentNum * (INFO_HEIGHT + PADDING)) }
let agents = [];
let tasks = [];
let irisModel;
let agentNum = 10;
function setup() {
  createCanvas(WIDTH(), HEIGHT());
  irisModel = new IrisModel(agentNum, 0, 2);
}

function draw() {
  background(51);

  for (let i = 0; i < 10; i++) {
    irisModel.update();
    irisModel.show();
  }
  // noLoop();
}

function windowResized() {
  resizeCanvas(WIDTH(), HEIGHT());
}

// function mouseClicked(){
//   irisModel.update();
// }

function drawInfos(agent) {
  let infos = agent.getPreferencesAsArray();
  noFill();
  beginShape();
  stroke(0, 255, 255, 70)
  let i = 0;
  for (const info of infos) {
    let posX = map(i, 0, infos.length, PADDING, width - PADDING);
    let posY = map(info, MINIMUM, MAXIMUM, height - PADDING, height - COL_HEIGHT);
    vertex(posX, posY);
    i++;
  }
  endShape();
  // console.log(infos);
}