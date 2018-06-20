class Agent {
    constructor(tasksList) {
        this.restingTime = 1 + Math.floor(Math.random() * 10);
        this.preferences = makePreferences(tasksList);
        console.log(this.preferences);
        this.laziness = 1 + Math.floor(Math.random() * 5);
        this.solidarity = 1 + Math.floor(Math.random() * 10);
        this.ability = false;
        this.occupied = false;
    }
    trade(taskName) {
        // use the task to update his skill
        if (Math.random() < 0.5) return true;
        else return false;
    }
}

/**
 * @param {Array} arr Array of task objects
 * @returns an Array of objects with the preference for each task
 */
function makePreferences(arr) {
    const PREFERENCE_OFFSET = 2;
    let result = [];
    for (const el of arr) {
        let skill = 1 + Math.floor(Math.random() * 10);
        result.push({
            completed: 0, // how many the task has been completed
            skill_level: skill,
            task_name: el.type,
            task_preference: calculatePreference(skill, PREFERENCE_OFFSET)
        })
    }
    return result;
}
/**
 * computes the preference based on skill ann preference offset
 * @param {Number} skill 
 * @param {Number} offset 
 * @returns the result of the calculation
 */
function calculatePreference(skill, offset) {
    let result = 0;
    result = skill + (-offset + Math.floor(Math.random() * offset))
    if (result < 1) result = 1;
    if (result > 10) result = 10
    return result;
}