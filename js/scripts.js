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
    $('#show-menu').toggle('fast');

    clearInterval(tick);
  } else {
    $('#start-stop').text('STOP');
    if (batch_mode) {
      tick = setInterval(batch_executions, 0.1);
    } else {
      tick = setInterval(single_execution, 0.1);
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

// let recordData = document.getElementById('record-data')
// recordData.addEventListener('click', () => {
//   irisModel.recordData();
// });

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
  $('#show-menu').toggle('fast');
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

// const setSpeed = document.getElementById('model-speed');
// setSpeed.addEventListener('change', event => {
//   loops = setSpeed.value;
// })

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

function update_behavior_setting_menu(elt) {
  console.log(elt.value);
  const hidden = document.getElementsByClassName('hide')
  if (elt.value === 'time-spending') {
    // show hidden menu
    for (const el of hidden) {
      el.style.display = 'block';
    }
  } else {
    // hide it!
    for (const el of hidden) {
      el.style.display = 'none';
    }
  }
}


/**
 * @param {Number} index 
 * @returns the value of the hidden planning menu
 */
function get_values_hidden_menu(index) {
  const hidden = document.getElementsByClassName('hide')[index].children;
  const result = [];
  for (const child of hidden) {
    if (child.checked) {
      result.push(child.value);
    }
  }
  return result
}


/**
 * this function updates the name of the various behaviors in the menu
 */
function update_buttons() {
  const inputs = document.getElementsByClassName('traits-txt-input');
  for (let i = 0; i < inputs.length; i++) {
    const btn = document.getElementById('bev-' + (i + 1));
    btn.innerText = inputs[i].value;
  }
}
update_buttons();



/**
 * sets the the values o the select element in the visualization
 */
function set_selects() {
  const sel_1 = document.getElementById('agents-param-1');
  const sel_2 = document.getElementById('agents-param-2');
  for (const param of AGENT_PARAMS) {

    const option_1 = document.createElement('option');
    // option.setAttribute('class', 'btn');
    option_1.value = param;
    option_1.innerText = param;
    sel_1.appendChild(option_1);

    const option_2 = document.createElement('option');
    // option.setAttribute('class', 'btn');
    option_2.value = param;
    option_2.innerText = param;
    sel_2.appendChild(option_2);
  }
}

set_selects();

/**
 * sets the date in the web page
 * @param {Number} y years
 * @param {Number} m months
 * @param {Number} d days
 * @param {Number} h hours
 */
function set_date(y, m, d, h) {
  let currentDate = `<div class="date-el">years: ${y}</div>
    <div class="date-el">months: ${m}</div>
    <div class="date-el">days: ${d}</div>
    <div class="date-el">hours: ${h}</div>`;
  // console.log(currentDate);
  const date_el = document.getElementById('display-date');
  date_el.innerHTML = currentDate;
}

// suggestions tips

const help_tip = document.querySelector('div.help-tip')
document.onmousemove = mouse => {
  help_tip.style.top = mouse.y - 10 + 'px';
  help_tip.style.left = mouse.x + 10 + 'px';
}
const tooltips_el = document.querySelectorAll('[data-title]')
tooltips_el.forEach(tip => {
  tip.addEventListener('mouseover', elt => {
    help_tip.textContent = tip.dataset['title'];
    help_tip.style.display = 'block';
  })
  tip.addEventListener('mouseleave', elt => {
    help_tip.style.display = 'none';
  })
})