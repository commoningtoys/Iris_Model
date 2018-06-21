/**
 * this function returns an Object with the information about
 * the task to be fed in the Task class
 * @param {Number} amountOfTime Duration in seconds or ticks it takes to 'carry out' the task.
 * @param {Number} howOften how often the task needs to be carried out every day
 * @param {String} name name of the task
 * @returns Object
 */
function makeTask(amountOfTime, howOften, name) {
    return {
        amount_of_time: amountOfTime,
        executions_per_day: howOften,
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