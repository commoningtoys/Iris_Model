const TIME_SCALE = 10;
const DAY = 24 * TIME_SCALE;
const COOK = makeTask(1.5 * TIME_SCALE, 3, 'cook');
const CLEAN = makeTask(2 * TIME_SCALE, 4, 'clean');
const ADMIN = makeTask(2.5 * TIME_SCALE, 1, 'admin');
const SHOP = makeTask(1.5 * TIME_SCALE, 2, 'shop');
const TASK_LIST = [
    COOK,
    CLEAN,
    SHOP,
    ADMIN
];

