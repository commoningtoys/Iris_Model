/**
 * this function returns an Object with the information about
 * the task to be fed in the Task class
 * @param {Number} time_needed Duration in seconds or ticks it takes to 'carry out' the task.
 * @param {Number} how_often how often the task needs to be carried out every day
 * @param {String} name name of the task
 * @returns Object
 */
function makeTask(time_needed, how_often, name) {
    return {
        amount_of_time: time_needed,
        executions_per_day: how_often,
        type: name
    }
}



/**
 * clamps a value between a maximum and a minimum
 * @param {Number} val the value
 * @param {Number} min floor clamp
 * @param {Number} max ceil clamp
 * @returns the clamped value
 */
function clamp(val, min, max) {
    return Math.min(Math.max(min, val), max);
}

function randomMinMAx() {
    return MINIMUM + Math.floor(Math.random() * MAXIMUM);
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * @param {*} array 
*/
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}