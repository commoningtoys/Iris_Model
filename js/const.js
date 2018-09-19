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
// animation const
const LEFT_GUTTER = 80;
const PADDING = 15;
const COL = 10;
const ROWS = 5;
const COL_HEIGHT = innerHeight - 100;
const INFO_HEIGHT = 55;
// make our tasks
/**
 * VERY IMPORTANT THE TASK CAN'T BE LESS THAN 1 HOUR FOR NOW
 */
const COOK = makeTask(12 * TIME_SCALE, 3, 'cook');
const CLEAN = makeTask(15 * TIME_SCALE, 4, 'clean');
const ADMIN = makeTask(18 * TIME_SCALE, 1, 'admin');
const SHOP = makeTask(12 * TIME_SCALE, 2, 'shop');
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

