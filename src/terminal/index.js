const chalk = require('chalk');
var term = require('terminal-kit').terminal;
var Cube = require('../Cube');
var size = 5;
var cube = new Cube.Cube(size);
var art = require('../Art');
const { SIDES } = require('../Cube');
var drawCubeLet = function (cubelet) {
    var lines = [];
    var a;
    //   a += drawLine(size);
    for (var row = 0; row < size; row++) {
        a = '';
        for (var col = 0; col < size; col++) {
            switch (cubelet.face[row][col].color) {
                case 'f':
                    a += chalk.bgWhite.black('_|');
                    break;
                case 'b':
                    a += chalk.bgYellowBright.black('_|');
                    break;
                case 'l':
                    a += chalk.bgGreen.white('_|');
                    break;
                case 'r':
                    a += chalk.bgBlue.white('_|');
                    break;
                case 'u':
                    a += chalk.bgKeyword('orange').black('_|');
                    break;
                case 'd':
                    a += chalk.bgRed.white('_|');
                    break;
                case 'k':
                    a += chalk.bgCyan.white('_|');
                    break;
            }
        }
        lines.push(a);
        // a += drawLine(size);
    }
    return art(lines);
};

var printCube = function (_cube) {
    return art()
        .add(drawCubeLet(_cube.model[SIDES.UP]), 10)
        .vadd(
            drawCubeLet(_cube.model[SIDES.LEFT])
                .add(drawCubeLet(_cube.model[SIDES.FRONT]))
                .add(drawCubeLet(_cube.model[SIDES.RIGHT]))
                .add(drawCubeLet(_cube.model[SIDES.BACK]))
        )
        .vadd(drawCubeLet(_cube.model[SIDES.DOWM]), 10)
        .export();
};

function terminate() {
    term.grabInput(false);
    setTimeout(function () {
        process.exit(0);
    }, 100);
}

term.grabInput({ mouse: 'button' });
term.fullscreen(true);

console.log(printCube(cube));
term.on('key', function (name, matches, data) {
    if (name === 'CTRL_C') {
        terminate();
    } else if (name === 'x') {
        term.moveTo(1, 1);
        cube.xClockWise(4);
        console.log(printCube(cube));
    } else if (name === 'X') {
        term.moveTo(1, 1);
        cube.xAntiClockWise(4);
        console.log(printCube(cube));
    } else if (name === 'y') {
        term.moveTo(1, 1);
        cube.yClockWise(0);
        console.log(printCube(cube));
    } else if (name === 'Y') {
        term.moveTo(1, 1);
        cube.yAntiClockWise(0);
        console.log(printCube(cube));
    } else if (name === 'z') {
        term.moveTo(1, 1);
        cube.zClockWise(0);
        console.log(printCube(cube));
    } else if (name === 'Z') {
        term.moveTo(1, 1);
        cube.zAntiClockWise(0);
        console.log(printCube(cube));
    }
});
