const TIME_SCALE = 1; // never lower than 2
const DAY = 24 * TIME_SCALE;// 1 day
const MAXIMUM = 100; // we need this to clamp values for preferences
const MINIMUM = 1;
// make our tasks
/**
 * VERY IMPORTANT THE TASK CAN'T BE LESS THAN 1 HOUR FOR NOW
 */
const COOK = makeTask(1.5 * TIME_SCALE, 3, 'cook');
const CLEAN = makeTask(2 * TIME_SCALE, 4, 'clean');
const ADMIN = makeTask(2.5 * TIME_SCALE, 1, 'admin');
const SHOP = makeTask(1.5 * TIME_SCALE, 2, 'shop');
// and a list out of them
const TASK_LIST = [
    COOK,
    CLEAN,
    SHOP,
    ADMIN
];

