const PLAYER_ID = 'PLAYER'

function WIDTH() { return innerWidth * 0.64 };

let agents = [];
let tasks = [];
let irisModel;
function setup() {
  createCanvas(WIDTH(), windowHeight - 4);
  irisModel = new IrisModel(20, 0, 1);
}

function draw() {
  background(51);
  for (let i = 0; i < COL; i++) {
    let posX = map(i, 0, COL, PADDING, width - PADDING);
    stroke(255);
    line(posX, height - PADDING, posX, height - COL_HEIGHT);
  }

  irisModel.update();
}

function windowResized() {
  resizeCanvas(WIDTH(), innerHeight);
}


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