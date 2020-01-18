const maxNumbers = 10;
const canvasHeight = 1.3;
const canvasWidth = 1.3;

const generalConstraints = {
    minX: -canvasWidth / 2,
    minY: -canvasHeight / 2,
    maxX: canvasWidth / 2,
    maxY: canvasHeight / 2
};

const offsetX = -0.05;
const offsetY = 0.05;

const inputMultiplier = 0.01;
const moveMultiplier = 0.01;
const captureRadius = 0.0;

let numbers = [];
// [n, x, y, dir_x, dir_y]

let boxes = [[0, 0], [0, 0]];

let gameScore = 0;

const MODE_TOP = 0;
const MODE_BOTTOM = 1;
const MODE_LEFT = 2;
const MODE_RIGHT = 3;

function generateDir(mode) {
    let xTwoDir = false;
    let xInverted = false;
    let yTwoDir = false;
    let yInverted = false;

    switch (mode) {
        case MODE_TOP:
            xTwoDir = true;
            break;
        case MODE_BOTTOM:
            xTwoDir = true;
            yInverted = true;
            break;
        case MODE_LEFT:
            yTwoDir = true;
            break;
        case MODE_RIGHT:
            yTwoDir = true;
            xInverted = true;
            break;
    }

    let dirX = Math.random();
    let dirY = Math.random();

    if (xTwoDir) dirX = dirX * 2.0 - 1.0;
    if (yTwoDir) dirY = dirY * 2.0 - 1.0;
    if (xInverted) dirX *= -1.0;
    if (yInverted) dirY *= -1.0;

    let mod = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= mod;
    dirY /= mod;

    return [dirX, dirY];
}

function spawnNumber(constraints) {
    const n = Math.round(Math.random());

    let mode = Math.floor(Math.random() * 3.0);

    // -- NO BOTTOM --
    if (mode == MODE_BOTTOM) mode = MODE_RIGHT;
    // -- NO BOTTOM --
    let x, y;
    if (mode <= 1) { // on top or bottom
        x = Math.random() * (constraints.maxX - constraints.minX) + constraints.minX;
        y = (mode) ? constraints.maxY : constraints.minY;
    }
    else {
        x = (mode - 2) ? constraints.maxX : constraints.minX;
        y = Math.random() * (constraints.maxY - constraints.minY) + constraints.minY;   
    }
    const dir = generateDir(mode);
    return [n, x, y, dir[0], dir[1]];
}

function moveNumbers(numbersPositions, constraints, multiplier = 1.0, crossBottomCbk) {
    // -- NO BOTTOM --
    return numbersPositions.filter((num) => {
        const [n, x, y, dirX, dirY] = num;
        let newY = y + dirY * multiplier;
        const result = newY <= constraints.maxY;
        if (!result && crossBottomCbk != undefined) crossBottomCbk(num);
        return result;
    // -- NO BOTTOM --
    }).map((num) => {
        const [n, x, y, dirX, dirY] = num;
        let newX = x + dirX * multiplier;
        let newY = y + dirY * multiplier;
        let newDirX = dirX;
        let newDirY = dirY;
        if (newX < constraints.minX || newX > constraints.maxX) {
            newX = x;
            newDirX = -newDirX;
        }
        if (newY < constraints.minY || newY > constraints.maxY) {
            newY = y;
            newDirY = -newDirY;
        }
        return [n, newX, newY, newDirX, newDirY];
    });
}

let boxesPositionIndices = [[0, 0], [0, 1], [1, 0], [1, 1]];

function restrictBoxPosition(boxes, constraints) {
    return [0, 1].map(i => {
        const x = Math.max(constraints.minX, Math.min(constraints.maxX, boxes[i][0]));
        const y = Math.max(constraints.minY, Math.min(constraints.maxY, boxes[i][1]));
        return [x, y];
    });
}

function distanceBetween(x0, y0, x1, y1) {
    return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}

function getNumbersNotCollided(numbersPositions, boxes, threshold = 20.0, cbkCollided) {
    return numbersPositions.filter(number => {
        const n = number[0];
        const matchingBox = boxes[n];

        if (cbkCollided != undefined) cbkCollided(number, matchingBox);

        return distanceBetween(number[1], number[2], matchingBox[0], matchingBox[1]) >= threshold;
    });
}

function getFrame() {
    let userInput = getUserInput(); // [ [ 0, 0 ], [0, 0] ]

    boxesPositionIndices.forEach(i => {
        let [a, b] = i;
        boxes[a][b] += userInput[a][b] * inputMultiplier;
    })

    boxes = restrictBoxPosition(boxes, generalConstraints);

    if (numbers.length < maxNumbers)
        numbers.push(spawnNumber(generalConstraints));

    numbers = moveNumbers(numbers, generalConstraints, moveMultiplier, (number) => {
        console.log(`Number dropped out of the scene`);
    });

    numbers = getNumbersNotCollided(numbers, boxes, captureRadius, (number, box) => {
        //console.log(`Collision detected between number ${number} and box ${box}`);
    });

    //console.log(numbers);
    render(numbers.map(num => [num[0], num[1] + offsetX, num[2] + offsetY]), boxes);
    window.requestAnimationFrame(getFrame);
}

let currentUserInput = [[0, 0], [0, 0]];

function getUserInput() {
    //let lastInput = [...currentUserInput];
    //currentUserInput = [[0, 0], [0, 0]];
    //return lastInput;
    return currentUserInput;
}

function initUserInput() {
    const keyMapping = [
        {
            key: 37,
            box: 0,
            move: [-1, 0]
        },
        {
            key: 38,
            box: 0,
            move: [0, -1]
        },
        {
            key: 39,
            box: 0,
            move: [1, 0]
        },
        {
            key: 40,
            box: 0,
            move: [0, 1]
        },

        {
            key: 65,
            box: 1,
            move: [-1, 0]
        },
        {
            key: 87,
            box: 1,
            move: [0, -1]
        },
        {
            key: 68,
            box: 1,
            move: [1, 0]
        },
        {
            key: 83,
            box: 1,
            move: [0, 1]
        }
    ];

    const allKeys = keyMapping.map(x => x.key);

    let pressedKeys = {};

    window.addEventListener("keydown", (e) => {
        let keycode = window.event.keycode || e.which;

        // 37 -> left
        // 38 -> up
        // 39 -> right
        // 40 -> down
        // 
        // 65 -> left_e
        // 87 -> up_w
        // 68 -> right_d
        // 83 -> down_s

        if ((idx = allKeys.indexOf(keycode)) != -1) {
            e.preventDefault();
            pressedKeys[idx] = true;
            processEventChange(idx, 0);
        }
    }, false);

    window.addEventListener("keyup", (e) => {
        let keycode = window.event.keycode || e.which;
        if ((idx = allKeys.indexOf(keycode)) != -1) {
            e.preventDefault();
            pressedKeys[idx] = false;
            processEventChange(idx, 1);
            
        }
    }, false);

    function processEventChange(idx, event) {
        let map = keyMapping[idx];
        if (event == 0) { // keydown
            currentUserInput[map.box] = map.move;
        }
        else {
            for (let [key, value] of Object.entries(pressedKeys)) {
                tmap = keyMapping[key];
                if (value && map.box == tmap.box) {
                    currentUserInput[tmap.box] = tmap.move;
                    return;
                }
            }

            // no key pressed
            currentUserInput[map.box] = [0, 0];
        }
    }
}

/*
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.font = "12px Arial";


function render(numbers, boxes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //console.log("-----------------------------");
    //console.log(numbers);
    //console.log(boxes);


    numbers.forEach(i => {
        ctx.fillText(i[0], i[1], i[2]);
    });

    boxes.forEach((val, idx) => {
        ctx.fillText("b" + idx, val[0], val[1]);
    })


    // to be added
}
*/

function main() {
    initUserInput();
    initGl();
    
    window.requestAnimationFrame(getFrame);
}

main();