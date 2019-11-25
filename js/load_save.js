let storage_available = false;

if (storageAvailable('localStorage')) {
  storage_available = true;
}
else {
  // Too bad, no localStorage for us
  console.log("local storage not available, save and load functions won't work on this browser");
}

const traits_id = [
  'trait-0',
  'trait-1',
  'trait-2',
  'trait-3'
]

function save_traits() {
  const elt = document.getElementById('save-config')
  const config_name = elt.value;
  // here we need to extract the values of the menu
  const result = [];
  let index = 0;
  for (const id of traits_id) {
    const elt = document.getElementById(id);
    // here we extract the values we neeed
    const amount = parseInt(elt.children['amount'].value);
    const trait = elt.children['trait'].value; // this must stay a string
    const curiosity = parseFloat(elt.children['curiosity'].value);
    const perfectionism = parseFloat(elt.children['perfectionism'].value);
    const endurance = parseFloat(elt.children['endurance'].value);
    const goodwill = parseFloat(elt.children['goodwill'].value);
    const planning = get_values_hidden_menu(index);
    // and we push them inside the array
    result.push({
      id, amount, trait, curiosity, perfectionism, endurance, goodwill, planning
    });
    index++;
  }


  if (!localStorage.getItem(config_name)) {
    window.localStorage.setItem(config_name, JSON.stringify(result));
  } else {
    elt.value = 'choose another name!'
  }

  const select = document.getElementById('load-config');
  const option = document.createElement('option');
  option.setAttribute('class', 'btn')
  option.value = config_name;
  option.textContent = config_name;
  select.appendChild(option);
}

function load_traits(elt) {
  const val = elt.selectedOptions[0].value;
  const config = JSON.parse(window.localStorage.getItem(val));
  console.log(config);

  for (const item of config) {
    const elt = document.getElementById(item.id);
    // Object.keys(item).forEach(key =>{
    //     elt.children[key].value = item[key];
    // })
    elt.children['amount'].value = item.amount;
    elt.children['trait'].value = item.trait; // this must stay a string
    elt.children['curiosity'].value = item.curiosity;
    elt.children['perfectionism'].value = item.perfectionism;
    elt.children['endurance'].value = item.endurance;
    elt.children['goodwill'].value = item.goodwill;

    const inputs = elt.lastElementChild.children;
    for (const input of inputs) {
      for (const plan of item.planning) {
        if (input.value && input.value === plan) {
          input.checked = true;
        }
      }
    }
  }
  update_buttons();
}

function set_config_names() {
  const select = document.getElementById('load-config');
  for (let i = 0; i < window.localStorage.length; i++) {
    console.log(window.localStorage.key(i));
    const name = window.localStorage.key(i);
    const option = document.createElement('option');
    option.setAttribute('class', 'btn')
    option.value = name;
    option.textContent = name;
    select.appendChild(option)
  }

}

set_config_names()

function storageAvailable(type) {
  var storage;
  try {
    storage = window[type];
    var x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      (storage && storage.length !== 0);
  }
}