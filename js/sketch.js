// const PLAYER_ID = 'PLAYER';

// let singleView = true;
// function HEIGHT() { return PADDING + (agentNum * (INFO_HEIGHT + PADDING)) }
// let agents = [];
// let tasks = [];
let irisModel = null;
let loops = 1;
let players = 0;
let check_values = true;


init_menu();

function setup() {
  createCanvas(WIDTH(), HEIGHT());
  // let behaviors = {
  //   curious: 1,
  //   perfectionist: 1,
  //   geniesser: 1,
  //   capitalist: 1
  // };

  // let min_wage = 1;
  // let tasks_num = 1;
  // players = 0; // here you set the players for the game
  // irisModel = new IrisModel(behaviors, min_wage, tasks_num, players);
  // textSize(TEXT_SIZE);
  // noLoop();
}

function draw() {

  if (irisModel != null) {
    for (let i = 0; i < loops; i++) {
      irisModel.update();
    }
    if (frameCount % 15 == 0) irisModel.show();
    document.getElementById('whatFrameRate').innerHTML = 'Frame rate: <br>' + frameRate();
  }
}

function windowResized() {
  resizeCanvas(WIDTH(), HEIGHT());
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
/**
 * here we add all the event listeners for the menu
 */

let start_stop = true;
$('#start-stop').click(() => {
  console.log('start-stop')
  start_stop = !start_stop;
  if (start_stop) {
    $('#start-stop').text('RESTART');
    noLoop();
  } else {
    $('#start-stop').text('STOP');
    loop();
  }
});

let recordData = document.getElementById('record-data')
recordData.addEventListener('click', () => {
  irisModel.recordData();
});

let showSideBar = true;
$('#show-sidebar').click(() => {
  showSideBar = !showSideBar;
  $('#show-sidebar').text(showSideBar == false ? 'SHOW SIDEBAR' : 'HIDE SIDEBAR');
  $('#info-window').toggle('fast', () => {
    // whe the window is closed resize the sketch
    resizeCanvas(WIDTH(), HEIGHT());
    let info = document.getElementById('info-window')
    console.log(info.getBoundingClientRect().width);
  });
});

$('#show-menu').click(() => {
  $('.menu').toggle('fast');
})

$('#close-menu').click(() => {
  $('.menu').toggle('fast');
})

$('#select-behavior').click(el => {
  // console.log($("#select-behavior option:selected").val());
  const behavior = $("#select-behavior option:selected").val();
  // irisModel.setAgentsBehavior(behavior);
  const agentsNumber = document.getElementById('how-many-agents');
  const inputCustom = document.getElementsByClassName('custom-behavior');
  // const behavior = $("#select-behavior option:selected").val();
  // here we reset the values of the behaviors to 0
  for (const el of inputCustom) {
    el.value = 0;
  }
  // here we update them to all *behavior*
  switch (behavior) {
    case 'curious':
      inputCustom.curious.value = agentsNumber.innerText;
      break;
    case 'perfectionist':
      inputCustom.perfectionist.value = agentsNumber.innerText;
      break;
    case 'geniesser':
      inputCustom.geniesser.value = agentsNumber.innerText;
      break;
    case 'capitalist':
      inputCustom.capitalist.value = agentsNumber.innerText;
      break;
  }
})

const setSpeed = document.getElementById('model-speed');
setSpeed.addEventListener('change', event => {
  loops = setSpeed.value;
})

const minWage = document.getElementById('min-wage');
minWage.addEventListener('change', event => {
  $('#set-min-wage').text(minWage.value);
})

$('.custom-behavior').change(() => {
  let sum = 0;
  const agentsNumber = document.getElementById('how-many-agents');
  const taskNumber = document.getElementById('how-many-task');
  const inputCustom = document.getElementsByClassName('custom-behavior');
  for (const el of inputCustom) {
    sum += parseInt(el.value);
  }
  console.log(sum);
  agentsNumber.innerText = sum;
  taskNumber.value = Math.floor(sum / 5);
});

$('#stress-increment').change(el => {
  console.log($('#stress-increment').val())
  irisModel.set_stress_increment($('#stress-increment').val());
  $('#set-stress-increment').text($('#stress-increment').val())
})

$('#stress-decrement').change(el => {
  console.log($('#stress-decrement').val())
  irisModel.set_stress_increment($('#stress-decrement').val());
  $('#set-stress-decrement').text($('#stress-decrement').val())
})

function init_model() {
  console.log('start')
  if (check_values) {// if the input given in the menu are correct than start the model


    // here we need to extract the values of the menu
    const traits_input = document.getElementsByClassName('traits-input');
    const traits_list = [];
    for (const elt of traits_input[0].children) {
      // console.log(elt);
      // here we extract the values we neeed
      const amount = parseInt(elt.children['amount'].value);
      const trait_name = elt.children['trait'].value; // this must stay a string
      const cur_val = parseFloat(elt.children['curiosity'].value);
      const perf_val = parseFloat(elt.children['perfectionism'].value);
      const endu_val = parseFloat(elt.children['endurance'].value);
      const good_val = parseFloat(elt.children['goodwill'].value);
      // and we push them inside the array
      for (let i = 0; i < amount; i++)traits_list.push(make_trait(trait_name, cur_val, perf_val, endu_val, good_val));

    }
    // next we shuffle the array to distribute all the traits randomly
    shuffleArray(traits_list);
    console.log(traits_list);
    // const agents = [];
    // let idx = 0;
    // for (const trait of traits_list) {
    //   agents.push(new Agent(idx, false, trait))
    //   idx++;
    // }

    const min_wage = parseInt(document.getElementById('min-wage').value);
    const tasks_num = parseInt(document.getElementById('how-many-task').value);
    const players = 0; // for now
    console.log(min_wage, tasks_num);

    irisModel = new IrisModel(traits_list, min_wage, tasks_num, players);
    $('.menu').toggle('fast');
  }
  // const customBehavior = document.getElementsByClassName('custom-behavior');
  // const minWage = document.getElementById('min-wage');
  // const tasksNum = document.getElementById('how-many-task');
  // const behaviors = {
  //   curious: parseInt(customBehavior.curious.value),
  //   perfectionist: parseInt(customBehavior.perfectionist.value),
  //   geniesser: parseInt(customBehavior.geniesser.value),
  //   capitalist: parseInt(customBehavior.capitalist.value)
  // }

  // const min_wage = parseInt(minWage.value);
  // const tasks_num = parseInt(tasksNum.value);
  // players = parseInt(document.getElementById('num-players').value);
  // irisModel = new IrisModel(behaviors, min_wage, tasks_num, players);
  // $('.menu').toggle('fast');
}

function init_menu() {
  const traits_input = document.getElementsByClassName('traits-input');
  // console.log(traits_input)
  // here we get all the amount inputs
  const amounts_inputs = []
  for (const child of traits_input[0].children) amounts_inputs.push(child.children['amount']);
  // console.log(amounts_inputs);
  for (const elt of traits_input[0].children) {
    // console.log('parent', elt.children);
    const input_labels = ['curiosity', 'endurance', 'goodwill', 'perfectionism'];
    const inputs = [];
    // here we get all the inputs
    for (const term of input_labels) {
      inputs.push(elt.children[term])
    }
    // here we squish all the values between 0 and 1
    for (const term of input_labels) {
      elt.children[term].addEventListener('change', (event) => {
        // let sum = 0;
        // const values = 
        // for (const input of inputs) {
        //   sum += parseFloat(input.value);
        // }
        // for (const input of inputs) {
        //   input.value = parseFloat(input.value) / sum;
        // }
        const input = elt.children[term];
        input.value = get_decimal_value(input.value);
      })
    }

    // here we assign the eventListener to the amount inputs
    elt.children['amount'].addEventListener('change', () => {
      let sum = 0;
      const amt_inpt = amounts_inputs;
      for (const el of amt_inpt) {
        sum += parseInt(el.value);
      }
      const start_stop = document.getElementById('model-start')
      const agent_num = document.getElementById('how-many-agents');
      agent_num.innerText = sum;
      if (sum > 100) {
        check_values = false;
        agent_num.style.color = '#f00'
        agent_num.style.fontWeight = 'bolder'
        start_stop.innerText = '✋🏻SET THE AGENT NUMBER TO A VALUE BETWEEN 1 – 100✋🏻';
      } else {
        check_values = true;
        agent_num.style.color = '#0f0'
        agent_num.style.fontWeight = '100'
        start_stop.innerText = 'START!'
      }
    })
  }
}

function get_decimal_value(val) {
  console.log(val);
  val = parseFloat(val);
  if(val <= 1)return val;
  else {
    // if the value is bigger than one than we round it
    val = parseInt(val);
    const dec = val.toString();
    // console.log(dec)
    const result = val / Math.pow(10, dec.length);
    // console.log(result);
    return result
  }
}
