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

/**
 * this function initializes the menu with all the listeners
 */
function init_menu() {
  const traits_input = document.getElementsByClassName('traits-input');
  // here we get all the amount inputs
  const amounts_inputs = []
  for (const child of traits_input[0].children) amounts_inputs.push(child.children['amount']);
  for (const elt of traits_input[0].children) {
    const input_labels = ['curiosity', 'endurance', 'goodwill', 'perfectionism'];
    const inputs = [];
    // here we get all the inputs
    for (const term of input_labels) {
      inputs.push(elt.children[term])
    }
    // here we squish all the values between 0 and 1
    for (const term of input_labels) {
      elt.children[term].addEventListener('change', (event) => {
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