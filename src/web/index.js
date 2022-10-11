import './assets/styles/style.scss';
import { Cube, SIDES } from '../Cube';
import { enableMouseDrag, CubeView, appendTemplate } from '../WebUtils';
(function () {
        window.addEventListener('load', function () {
                // (-20, 30)
                var initial_x_rotation = -20,
                        initial_y_rotation = 30,
                        size = $_SIZE;
                var cubeView = new CubeView(document.body, size, initial_x_rotation, initial_y_rotation);
                enableMouseDrag(cubeView, initial_x_rotation, initial_y_rotation);
                var cube = new Cube(size, function (color, position) {
                        return cubeView.AddTile(color, position);
                });
                cubeView.AttachRotator();
                window.cube = cube;
                cube.action.subscribe(function (event) {
                        cubeView.DoAnimation(event, cube);
                });
                var createPlayer = function (action) {
                        var playlist = [];
                        window.playlist = playlist;
                        var playing = false;
                        var play = function () {
                                var ele = playlist.shift();
                                if (ele) {
                                        playing = true;
                                        action.apply(undefined, ele);
                                        setTimeout(function () {
                                                playing = false;
                                                play();
                                        }, 600);
                                }
                        };
                        return {
                                play: function (a) {
                                        if (playlist.length === 0 && !playing) {
                                                playlist.push([a]);
                                                play();
                                        } else {
                                                playlist.push([a]);
                                        }
                                },
                        };
                };
                appendTemplate(require('./footer.pug')(), this.document.body);
                var helpNode = appendTemplate(require('./help.pug')(), this.document.body);
                var lastSliceIndex = size - 1;
                var prefixKey = 0;
                var player = createPlayer(function (action) {
                        window.requestAnimationFrame(function () {
                                switch (action) {
                                        case 'l':
                                                cube.xAntiClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'r':
                                                cube.xClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'u':
                                                cube.yClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'd':
                                                cube.yAntiClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'f':
                                                cube.zClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'b':
                                                cube.zAntiClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'L':
                                                cube.xClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'R':
                                                cube.xAntiClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'U':
                                                cube.yAntiClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'D':
                                                cube.yClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'F':
                                                cube.zAntiClockWise(0 + prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                        case 'B':
                                                cube.zClockWise(lastSliceIndex - prefixKey, true);
                                                prefixKey = 0;
                                                break;
                                }
                        });
                });
                document.body.onkeydown = function (e) {
                        if (e.key.toLocaleLowerCase() === 'h') {
                                if (helpNode.style.display === 'none') {
                                        helpNode.style.display = 'flex';
                                } else {
                                        helpNode.style.display = 'none';
                                }
                                return;
                        }
                        if (!isNaN(+e.key)) prefixKey = +e.key;
                        player.play(e.key);
                };
        });
})();
