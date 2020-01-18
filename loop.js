
const maxNumNumbers = 50;
const canvasHeight = 500;
const canvasWidth = 500;

const generalConstraints = {
    minX: 0, 
    minY: 0, 
    maxX: canvasWidth,
    maxY: canvasHeight
};

const inputMultiplier = 1.0;

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

    switch (mode){
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

    const mode = Math.floor(Math.random() * 4.0);
    let x, y;
    if (mode <= 1) { // on top or bottom
        x = Math.random() * (constraints.maxX - constraints.minX) + constraints.minX;
        y = (mode)? constraints.maxY : constraints.minY;
    }
    else {
        x = (mode - 2)? constraints.maxX : constraints.minX;
        y = Math.random() * (constraints.maxY - constraints.minY) + constraints.minY;
    }
    const dir = generateDir(mode);
    return [n, x, y, dir[0], dir[1]];
}

function moveNumbers(numbersPositions, constraints, multiplier = 1.0, outOfConstraintCbk) {
    return numbersPositions.map((num) => {
        const [n, x, y, dirX, dirY] = num;
        let newX = x + dirX * multiplier;
        let newY = y + dirY * multiplier;
        let newDirX = dirX;
        let newDirY = dirY;
        if (newX < constraints.minX || newX > constraints.maxX) {
            newX -= dirX;
            newDirX = -newDirX;
        }
        if (newY < constraints.minY || newY > constraints.maxY) {
            newY -= dirY;
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

function getNumbersNotCollided(numbersPositions, boxes, threshold = 10.0, cbkCollided) {
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

    if (numbers.length < 20)
        numbers.push(spawnNumber(generalConstraints));

    numbers = moveNumbers(numbers, generalConstraints, 1.0);

    numbers = getNumbersNotCollided(numbers, boxes, 10, (number, box) => {
        //console.log(`Collision detected between number ${number} and box ${box}`);
    });

    render(numbers, boxes);
    window.requestAnimationFrame(getFrame);
}

function getUserInput() {
    return [[0, 0], [0, 1]];
}


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

window.requestAnimationFrame(getFrame);
