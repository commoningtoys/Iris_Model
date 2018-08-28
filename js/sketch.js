const PLAYER_ID = 'PLAYER'

let singleView = true;
function WIDTH() { return innerWidth * 0.64 };

let agents = [];
let tasks = [];
let irisModel;
function setup() {
  createCanvas(WIDTH(), windowHeight - 4);
  irisModel = new IrisModel(10, 0, 2);
}

function draw() {
  background(51);

  for(let i = 0; i < 1; i++){
    irisModel.update();
    irisModel.show();
  }
  // noLoop();
}

function windowResized() {
  resizeCanvas(WIDTH(), innerHeight);
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