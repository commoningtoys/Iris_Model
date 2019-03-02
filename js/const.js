/**
 * Change the TIME_SCALE variable to change the speed of the 
 * model 
 * 
 * increase the value to make model slower
 */
const TIME_SCALE = 1; // each time unit is equivalent to 10 minutes 

const TS_FRACTION = 6;
const DAY = 24 * TIME_SCALE * TS_FRACTION;// 1 day
const MAXIMUM = 100; // we need this to clamp values for preferences
const MINIMUM = 1;
const AGENT_NUM = 10;
const DATA_POINTS = 1000;
// animation const
const TEXT_SIZE = 12;
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
const COOK = makeTask(12 * TIME_SCALE, 3, 'food_dept_mngmt');
const CLEAN = makeTask(15 * TIME_SCALE, 4, 'kitchen_maintenance');
const ADMIN = makeTask(18 * TIME_SCALE, 1, 'social_work');
const SHOP = makeTask(12 * TIME_SCALE, 2, 'facility_duties');
// and a list out of them
const TASK_LIST = [
    ADMIN,
    CLEAN,
    COOK,
    SHOP
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
        curiosity: 1,
        perfectionism: 0,
        resilience: 1,
        accumulate: 0
    },
    {
        trait: 'perfectionist',
        curiosity: 0,
        perfectionism: 1,
        resilience: 1,
        accumulate: 0
    },
    {
        trait: 'geniesser',
        curiosity: 1,
        perfectionism: 0,
        resilience: 0,
        accumulate: 0
    },
    {
        trait: 'capitalist',
        curiosity: 0.5,
        perfectionism: 0,
        resilience: 1,
        accumulate: 1
    },
]

