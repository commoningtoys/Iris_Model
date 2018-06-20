const COOK = makeTask(10, 3, 'cook');
const CLEAN = makeTask(15, 4, 'clean');
const ADMIN = makeTask(20, 1, 'admin');
const SHOP = makeTask(15, 2, 'shop');
const TASK_LIST = [
    COOK,
    CLEAN,
    SHOP,
    ADMIN
];
const DAY = 2400;
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