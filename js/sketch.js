let irisModel = null;
let loops = 50;
let players = 0;
let check_values = true;
let batch_mode = false;
let execution_is_finished = true;
let execution_combinations;

init_menu();
let cnv;
function setup() {
  cnav = createCanvas(WIDTH(), HEIGHT());
}

function draw() {

  if (batch_mode) {
    // console.log('batch!')
    if (execution_is_finished) {
      // reset model with new inputs
      initialize_batch()
      // set model to batch mode
      irisModel.set_batch_executions(true);
      // set termination of the model
      irisModel.end_after(24);
      execution_is_finished = false;
    } else {
      // execution_is_finished = true;
      for (let i = 0; i < 100; i++) {
        // if the model is done exit the loop and start new batch
        if (irisModel.terminated) {
          execution_is_finished = true;
          break;
        }
        irisModel.update();
      }
    }
  } else {
    if (irisModel != null) {
      for (let i = 0; i < loops; i++) {
        irisModel.update();
      }
      // if (frameCount % 15 == 0) irisModel.show();
      document.getElementById('whatFrameRate').innerHTML = 'Frame rate: <br>' + frameRate();
    }
  }

  document.getElementById('whatFrameRate').innerHTML = 'Frame rate: <br>' + frameRate();
}

function windowResized() {
  resizeCanvas(WIDTH(), HEIGHT());
  let info = document.getElementById('info-window')
  console.log(info.getBoundingClientRect().width);
}

/**
 * here we add all the event listeners for the menu
 */

let start_stop = false;
$('#start-stop').click(start_stop_model);

function start_stop_model() {
  console.log('start-stop');
  start_stop = !start_stop;
  if (start_stop) {
    $('#start-stop').text('RESTART');
    noLoop();
  } else {
    $('#start-stop').text('STOP');
    loop();
  }
}

let recordData = document.getElementById('record-data')
recordData.addEventListener('click', () => {
  irisModel.recordData();
});

let showSideBar = true;
$('#show-sidebar').click(() => {
  showSideBar = !showSideBar;
  $('#show-sidebar').text(showSideBar == true ? 'SHOW SIDEBAR' : 'HIDE SIDEBAR');
  $('#info-window').toggle('fast', () => {
    // whe the window is closed resize the sketch
    resizeCanvas(WIDTH(), HEIGHT());
    let info = document.getElementById('info-window')
    // console.log(info.getBoundingClientRect().width);
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



    const traits_list = extract_traits();
    const min_wage = parseInt(document.getElementById('min-wage').value);
    const tasks_num = parseInt(document.getElementById('how-many-task').value);
    const players = 0; // for now
    console.log(min_wage, tasks_num);

    irisModel = new IrisModel(traits_list, min_wage, tasks_num, players);

    const stop_model = parseInt(document.getElementById('stop-model').value)

    irisModel.end_after(stop_model);

    $('.menu').toggle('fast');

    $('#info-window').toggle('fast', () => {
      // whe the window is closed resize the sketch
      resizeCanvas(WIDTH(), HEIGHT());
    });
  }
}
function extract_traits() {
  // here we need to extract the values of the menu
  const result = [];
  const traits_input = document.getElementsByClassName('traits-input');

  for (const elt of traits_input[0].children) {
    // here we extract the values we neeed
    const amount = parseInt(elt.children['amount'].value);
    const trait_name = elt.children['trait'].value; // this must stay a string
    const cur_val = parseFloat(elt.children['curiosity'].value);
    const perf_val = parseFloat(elt.children['perfectionism'].value);
    const endu_val = parseFloat(elt.children['endurance'].value);
    const good_val = parseFloat(elt.children['goodwill'].value);
    // and we push them inside the array
    for (let i = 0; i < amount; i++)result.push(make_trait(trait_name, cur_val, perf_val, endu_val, good_val));

  }
  console.log(result);
  return result;
}

function batch_executions() {
  batch_mode = true;
  // batch execution is alwazs with n agents maybe 100
  const traits_list = [];
  const traits_input = document.getElementsByClassName('traits-input');

  for (const elt of traits_input[0].children) {
    // here we extract the values we neeed
    const amount = parseInt(elt.children['amount'].value);
    const trait_name = elt.children['trait'].value; // this must stay a string
    const cur_val = parseFloat(elt.children['curiosity'].value);
    const perf_val = parseFloat(elt.children['perfectionism'].value);
    const endu_val = parseFloat(elt.children['endurance'].value);
    const good_val = parseFloat(elt.children['goodwill'].value);
    // and we push them inside the array
    traits_list.push(make_trait(trait_name, cur_val, perf_val, endu_val, good_val));

  }
  console.log(traits_list);
  execution_combinations = combination_of_array_elements(traits_list);
  console.log(execution_combinations)
  // first execute all the single traits with n agents
  // executions need to be done with minimum and maximum amount of ratio between agents and tasks
  $('.menu').toggle('fast');

    $('#info-window').toggle('fast', () => {
      // whe the window is closed resize the sketch
      resizeCanvas(WIDTH(), HEIGHT());
    });
}

const max_task = 8;
const max_agents = 50;
let task_amount_counter = 1;
let combinations_counter = 0;
let combination_elts_length = 0;
let combination_elts_counter = 0;
let batch_save_txt = '';
let tot_batch_counter = 0;
function initialize_batch() {

  // console.log('batch!');
  // get the combinations as an array
  const curr_combinations = Object.keys(execution_combinations)[combinations_counter];
  // console.log(`current combinations is with ${curr_combinations} items and this task numbers ${task_amount_counter}`)
  batch_save_txt = nf(tot_batch_counter, 4)+ '_' + curr_combinations + '_task#' + task_amount_counter;
  console.log(batch_save_txt);
  const combination_list = execution_combinations[curr_combinations];
  // console.log(combination_list);
  // execute all the elements of the list
  // console.log(`combinations counter ${combination_elts_counter}`)
  const agent_traits = combination_list[combination_elts_counter];
  const amount = max_agents / agent_traits.length;
  // console.log(`amount ${amount}`);
  // console.log(agent_traits);
  const traits_list = [];
  for (let i = 0; i < max_agents; i += amount) {
    const index = Math.floor(i / amount);
    for (let j = 0; j < amount; j += 1) {
      const traits = agent_traits[index]
      traits_list.push(make_trait(traits.trait, traits.curiosity, traits.perfectionism, traits.endurance, traits.goodwill))
    }
    // console.log(`index ${index}`);
  }
  // console.log(traits_list);
  const min_wage = parseInt(document.getElementById('min-wage').value);
  irisModel = new IrisModel(traits_list, min_wage, task_amount_counter, 0);
  task_amount_counter++
  if (task_amount_counter > max_task) {
    task_amount_counter = 1;
    combination_elts_counter++;
  }
  if (combination_elts_counter >= combination_list.length) {
    combination_elts_counter = 0;
    combinations_counter++;
    // console.log(`next ${combinations_counter}`);
  }
  if (combinations_counter >= 4) {
    console.log('terminate batch...')
    start_stop_model();
  }
  tot_batch_counter++;
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
  if (val <= 1) return val;
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
