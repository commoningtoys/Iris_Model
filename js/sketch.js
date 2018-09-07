const PLAYER_ID = 'PLAYER'

let singleView = true;
function WIDTH() {
  const info = document.getElementById('info-window');
  const w = info.getBoundingClientRect().width;
  return innerWidth - w;
};
// function HEIGHT() { return PADDING + (agentNum * (INFO_HEIGHT + PADDING)) }
let agents = [];
let tasks = [];
let irisModel;


function setup() {
  createCanvas(WIDTH(), innerHeight);
  irisModel = new IrisModel(AGENT_NUM, 0, Math.floor(AGENT_NUM / 5));
  textSize(9);
}

function draw() {
  // background(51);


  let loops = 10; // chnage this number with an integer (1 - 100) to accelerate the model.


  for (let i = 0; i < loops; i++) {
    irisModel.update();
  }
  if(frameCount % 15 == 0)irisModel.show();
  document.getElementById('whatFrameRate').innerHTML = 'Frame rate: <br>' + frameRate();
  // noLoop();
}

function windowResized() {
  resizeCanvas(WIDTH(), innerHeight);
  let info = document.getElementById('info-window')
  console.log(info.getBoundingClientRect().width);
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