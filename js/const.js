/**
 * Change the TIME_SCALE variable to change the speed of the 
 * model 
 * 
 * increase the value to make model slower
 */
const TIME_SCALE = 1; // each time unit is equivalent to 10 minutes 

const TS_FRACTION = 1;
const DAY = 24 * TIME_SCALE * TS_FRACTION;// 1 day
const MAXIMUM = 100; // we need this to clamp values for preferences
const MINIMUM = 1;
const AGENT_NUM = 10;
const DATA_POINTS = 300;
// animation const
const TEXT_SIZE = 20;
const LEFT_GUTTER = 80;
const PADDING = 30;
const COL = 10;
const ROWS = 5;
const COL_HEIGHT = innerHeight - 100;
const INFO_HEIGHT = 55;
// make our tasks
/**
 * VERY IMPORTANT THE TASK CAN'T BE LESS THAN 1 HOUR FOR NOW
 * the names can be changed again
 */

// and a list out of them
let TASK_LIST = [
    makeTask(2 * TIME_SCALE, 3, 'food_dept_mngmt'),
    makeTask(2 * TIME_SCALE, 4, 'kitchen_maintenance'),
    makeTask(3 * TIME_SCALE, 1, 'social_work'),
    makeTask(2 * TIME_SCALE, 2, 'facility_duties'),
];
// agent states 
const AGENT_BEHAVIORS = [
    'curious',
    'perfectionist',
    'geniesser',
    'capitalist'
]
const AGENT_TRAITS = [
    {
        trait: 'curious',
        curiosity: 1.0,
        perfectionism: 0,
        endurance: 0.5,
        goodwill: 0
    },
    {
        trait: 'perfectionist',
        curiosity: 0,
        perfectionism: 1.0,
        endurance: 0.7,
        goodwill: 0
    },
    {
        trait: 'lazy',
        curiosity: 1.0,
        perfectionism: 0,
        endurance: 0.2,
        goodwill: 0
    },
    {
        trait: 'goodwiller',
        curiosity: 0.1,
        perfectionism: 0,
        endurance: 0.8,
        goodwill: 1.0
    },
]

