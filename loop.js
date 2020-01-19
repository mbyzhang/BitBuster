const maxNumbers = 10;

/*
const canvasHeight = 500;
const canvasWidth = 500;

const generalConstraints = {
    minX: 0,
    minY: 0,
    maxX: canvasHeight,
    maxY: canvasWidth
};

const offsetX = 0;
const offsetY = 0;

const defaultInputMultiplier = 2.0;
const defaultMoveMultiplier = 1.0;
const defaultCaptureRadius = 10.0;
*/

 
const canvasHeight = 1.3;
const canvasWidth = 1.3;

const generalConstraints = {
    minX: -canvasWidth / 2,
    minY: -canvasHeight / 2,
    maxX: canvasWidth / 2,
    maxY: canvasHeight / 2
};

const size = 0.05
const psize = 0.1
const offsetX = -size/2;
const offsetY = size/2;

const defaultInputMultiplier = 0.01;
const defaultMoveMultiplier = 0.005;
const defaultCaptureRadius = psize * 0.7;
const defaultBoxes = [[0, -psize], [0, psize]];


const fullHp = 200;

let hp;
let gameOver = false;
let inputMultiplier;
let moveMultiplier;
let captureRadius;

let numbers = [];
// [n, x, y, dir_x, dir_y]

let powerups = {
    slow: undefined, // slow numbers
    boost: undefined, // boost boxes
    freeze: undefined, // freeze numbers
    clear: undefined, // clear all numbers in the scene
    largerRadius: undefined,
    medicine: undefined // increase HP
}

let boxes;

let score = 0;

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
    const cumulatieveProbs = [0.35, 0.7, 0.75, 0.8, 0.85, 0.875, 0.925, 1.0];
    //                        0     1    S     B    F     C      R+     M

    let n = 0;
    const r = Math.random();
    for (let i = 0; i < cumulatieveProbs.length; ++i) {
        if (cumulatieveProbs[i] > r) {
            n = i;
            break;
        }
    }

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
        let matchingBoxes;
        if (n >= 2) {
            matchingBoxes = [boxes[0], boxes[1]];
        } else {
            matchingBoxes = [boxes[n]];
        }

        let result = true;

        for (box of matchingBoxes) {
            if (distanceBetween(number[1], number[2], box[0], box[1]) < threshold) {
                result = false;
                break;
            }
        }

        if (!result && cbkCollided != undefined) cbkCollided(number, matchingBoxes);

        return result;
    });
}

function updateHp(offset) {
    hp += offset;
    hp = Math.min(fullHp, Math.max(0, hp));
    console.log(`HP ${offset} -> ${hp}`);
    if (hp == 0) {
        gameOver = true;
        console.log("Game Over!");
    }
}

function updateScore(offset) {
    if (offset == undefined) score = 0;
    else score += offset;
    console.log(`Score -> ${score}`);
    return score;
}

function getFrame(t) {
    if (!gameOver) {
        const userInput = getUserInput(); // [ [ 0, 0 ], [0, 0] ]
        const timeMultiplier = Math.min(3.0, Math.max(1.0, t / 600000.0));

        boxesPositionIndices.forEach(i => {
            let [a, b] = i;
            boxes[a][b] += userInput[a][b] * inputMultiplier * timeMultiplier;
        })

        boxes = restrictBoxPosition(boxes, generalConstraints);

        if (numbers.length < maxNumbers)
            numbers.push(spawnNumber(generalConstraints));

        numbers = moveNumbers(numbers, generalConstraints, moveMultiplier * timeMultiplier, (number) => {
            if (number[0] >= 2) return;
            updateHp(-5);
            console.log(`Number dropped out of the scene`);
        });

        let clearNumbers = false;
        numbers = getNumbersNotCollided(numbers, boxes, captureRadius, (number, box) => {
            const type = number[0];

            let clearPowerup = (handler) => {
                if (handler != undefined) clearTimeout(handler);
            };

            const powerupDuration = 5000.0;

            switch (type) {
                case 0:
                case 1:
                    updateHp(1);
                    updateScore(10);
                    break;
                case 2: // slow
                    console.log("SLOW activated!");
                    clearPowerup(powerups.slow);
                    clearPowerup(powerups.freeze);
                    powerups.freeze = undefined;
                    moveMultiplier = defaultMoveMultiplier * 0.5;
                    powerups.slow = setTimeout(() => {
                        moveMultiplier = defaultMoveMultiplier;
                        powerups.slow = undefined;
                        console.log("SLOW deactivated!");
                    }, powerupDuration);
                    break;
                case 3: // boost
                    console.log("BOOST activated");
                    clearPowerup(powerups.boost);
                    inputMultiplier = defaultInputMultiplier * 4.0;
                    powerups.boost = setTimeout(() => {
                        inputMultiplier = defaultInputMultiplier;
                        powerups.boost = undefined;
                        console.log("BOOST deactivated");
                    }, powerupDuration);
                    break;
                case 4: // freeze
                    console.log("FREEZE activated!");
                    clearPowerup(powerups.freeze);
                    clearPowerup(powerups.slow);
                    powerups.slow = undefined;
                    moveMultiplier = 0.0;
                    powerups.freeze = setTimeout(() => {
                        moveMultiplier = defaultMoveMultiplier;
                        powerups.freeze = undefined;
                        console.log("FREEZE deactivated!");
                    }, powerupDuration);
                    break;
                case 5: // clear
                    console.log("CLEAR activated!");
                    clearNumbers = true;
                    break;
                case 6: // largerRadius
                    console.log("RADIUS+ activated!");
                    clearPowerup(powerups.largerRadius);
                    captureRadius = defaultCaptureRadius * 4.0;
                    powerups.largerRadius = setTimeout(() => {
                        captureRadius = defaultCaptureRadius;
                        powerups.largerRadius = undefined;
                        console.log("RADIUS+ deactivated!");
                    }, powerupDuration);
                    break;
                case 7: // medicine
                    updateHp(20);
                    break;
            }
            //console.log(`Collision detected between number ${number} and box ${box}`);
        });

        if (clearNumbers) numbers = [];
    }

    //console.log(numbers);
    render(numbers.map(num => [num[0], num[1] + offsetX, num[2] + offsetY]), boxes, hp, score, gameOver, size, psize);
    window.requestAnimationFrame(getFrame);
}

let currentUserInput = [[0, 0], [0, 0]];

function getUserInput() {
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

    window.addEventListener("click", (e) => {
        if (gameOver) {
            initGameState();
        }
    })

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

function getPrettyNumberName(n) {
    return ["0", "1", "S", "B", "F", "C", "R+", "M", "UNDEF", "UNDEF"][n];
}

/*
var canvas, ctx;

const textureLookup = ["icons/0.png", "icons/1.png", "icons/slow.png", "icons/thunder.png", "icons/snow.png", "icons/bomb.png", "icons/strong.png", "icons/pill.png"];

let textureImages = [];

function initCanvas() {
    canvas = document.getElementById("glcanvas");
    ctx = canvas.getContext("2d");
    ctx.font = "12px Arial";
    textureLookup.forEach(url => {
        let img = new Image;
        img.src = url;
        textureImages.push(img);
    });
}

function render(numbers, boxes, hp, score, gameOver = false) {
    const hpPos = [20, 20];
    const scorePos = [canvasWidth - 70, 20];
    const gameOverPos = [canvasWidth / 2, canvasHeight / 2];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    numbers.forEach(i => {
        ctx.drawImage(textureImages[i[0]], i[1], i[2], 16, 16);
        //ctx.fillText(getPrettyNumberName(i[0]), i[1], i[2]);
    });

    boxes.forEach((val, idx) => {
        ctx.fillText("b" + idx, val[0], val[1]);
    });

    ctx.fillText(`HP: ${hp}`, hpPos[0], hpPos[1]);
    ctx.fillText(`Score: ${score}`, scorePos[0], scorePos[1]);

    if (gameOver) ctx.fillText("Game Over!\nClick to Restart", gameOverPos[0], gameOverPos[1]);

}
*/

function initGameState() {
    numbers = [];
    boxes = defaultBoxes;
    hp = fullHp / 2;
    score = 0;
    inputMultiplier = defaultInputMultiplier;
    moveMultiplier = defaultMoveMultiplier;
    captureRadius = defaultCaptureRadius;
    gameOver = false;
}

function main() {
    initUserInput();
    //initCanvas();
    initGameState();
    initGl();

    window.requestAnimationFrame(getFrame);
}

main();