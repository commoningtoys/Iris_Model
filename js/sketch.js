let irisModel = null;
let loops = 50;
let players = 0;
let check_values = true;
let batch_mode = false;
let execution_is_finished = true;
let execution_combinations;

let tick;

init_menu();
let cnv;
function setup() {
  // cnv = createCanvas(WIDTH(), HEIGHT());
  noCanvas();
  // frameRate(200);
}

function draw() {
  if (!batch_mode) {


  }

  // document.getElementById('whatFrameRate').innerHTML = 'Frame rate: <br>' + frameRate();
}



// function windowResized() {
//   resizeCanvas(WIDTH(), HEIGHT());
// }



function init_model() {

  clearInterval(tick);
  start_stop = false;

  // console.log('start')
  // if (check_values) {// if the input given in the menu are correct than start the model

  const traits_list = extract_traits();
  const min_wage = parseInt(document.getElementById('min-wage').value);
  const tasks_num = parseInt(document.getElementById('how-many-task').value);
  const players = 0; // for now
  const model_type = get_model_type();
  const monthly_hours = parseInt(document.getElementById('monthly-hours').value);
  irisModel = new IrisModel(traits_list, min_wage, tasks_num, model_type, monthly_hours);

  const stop_model = parseInt(document.getElementById('stop-model').value)

  irisModel.end_after(stop_model);

  $('.menu').toggle('fast');
  document.querySelector('.info').style.visibility = 'visible'
  // $('#info-window').show('fast', () => {
  //   // whe the window is closed resize the sketch
  //   resizeCanvas(WIDTH(), HEIGHT());
  // });
  tick = setInterval(single_execution, 0.1);
  // } 
}

function single_execution() {
  if (irisModel != null) {
    for (let i = 0; i < loops; i++) {
      irisModel.update();
    }
    if (frameCount % 15 == 0) {
      irisModel.update_data();
      // irisModel.plot_data();
    }

  }
}

function get_model_type() {
  let inputs = document.getElementById('model-type');
  inputs = $(inputs).find('input')
  let result;
  for (const input of inputs) {
    if (input.checked) {
      console.log(input.value);
      result = input.value;
    }
  }
  return result;
}

function extract_traits() {
  // here we need to extract the values of the menu
  const result = [];
  const traits_input = document.getElementsByClassName('traits-input');
  let index = 0;
  for (const elt of traits_input[0].children) {
    // here we extract the values we neeed
    const amount = parseInt(elt.children['amount'].value);
    const trait_name = elt.children['trait'].value; // this must stay a string
    const cur_val = parseFloat(elt.children['curiosity'].value);
    const perf_val = parseFloat(elt.children['perfectionism'].value);
    const endu_val = parseFloat(elt.children['endurance'].value);
    const good_val = parseFloat(elt.children['goodwill'].value);
    // console.log(elt.children);
    const planning = get_values_hidden_menu(index);
    // lets make the amount a global variable
    AGENT_NUM = amount;
    // and we push them inside the array
    for (let i = 0; i < amount; i++)result.push(make_trait(trait_name, cur_val, perf_val, endu_val, good_val, planning));
    index++;
  }
  
  return result;
}
/**
 * this function fills the executions combination array with
 * all the possible combiation of agents in groups of 1, 2, 3 and 4 agents
 */
function init_batch() {

  batch_mode = true;
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
  execution_combinations = combination_of_array_elements(traits_list);
  $('.menu').toggle('fast');

  $('#info-window').toggle('fast', () => {
    // whe the window is closed resize the sketch
    resizeCanvas(WIDTH(), HEIGHT());
  });

  tick = setInterval(batch_executions, 0.1);//apparently it can't be faster than 5ms
}

function batch_executions() {
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
    if (irisModel.terminated) {
      execution_is_finished = true;
    }
    irisModel.update();
  }
}

/**
 * the function below executes all the combinations of agents with different numbers of tasks
 */

const max_task = 8;
const max_agents = 100;
let task_amount_counter = 1;
let combinations_counter = 0;
let combination_elts_length = 0;
let combination_elts_counter = 0;
let batch_save_txt = '';
let tot_batch_counter = 0;
function initialize_batch() {
  // get the combinations type: 1, 2, 3, or types of agents
  const curr_combinations = Object.keys(execution_combinations)[combinations_counter];
  // create  a text file with reference to this batch
  batch_save_txt = nf(tot_batch_counter, 4) + '_' + curr_combinations + '_task#' + task_amount_counter;
  console.log(batch_save_txt);
  // extract the combination 
  const combination_list = execution_combinations[curr_combinations];
  // execute all the elements of the list
  const agent_traits = combination_list[combination_elts_counter];
  const amount = max_agents / agent_traits.length;
  const traits_list = [];
  for (let i = 0; i < max_agents; i += amount) {
    const index = Math.floor(i / amount);
    for (let j = 0; j < amount; j += 1) {
      const traits = agent_traits[index]
      traits_list.push(make_trait(traits.trait, traits.curiosity, traits.perfectionism, traits.endurance, traits.goodwill))
    }
  }
  // initialize model
  const min_wage = parseInt(document.getElementById('min-wage').value);
  irisModel = new IrisModel(traits_list, min_wage, task_amount_counter, 0);
  task_amount_counter++;
  // slowly increase the values to be able to execute all the combinations with different ratios of agents | tasks
  if (task_amount_counter > max_task) {
    task_amount_counter = 1;
    combination_elts_counter++;
  }
  if (combination_elts_counter >= combination_list.length) {
    combination_elts_counter = 0;
    combinations_counter++;
  }
  if (combinations_counter >= 4) {
    console.log('terminate batch...')
    start_stop_model();
  }
  tot_batch_counter++;
}

