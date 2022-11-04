import { CubeModel, SIDES } from '../CubeModel';
import { enableMouseDrag, CubeView } from '../WebUtils';
var size = $_SIZE;
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
function GetCube(ele) {
        // (-20, 30)
        var initial_x_rotation = -20,
                initial_y_rotation = 30;
        var cubeView = new CubeView(ele, size, initial_x_rotation, initial_y_rotation);
        enableMouseDrag(cubeView, initial_x_rotation, initial_y_rotation);
        var cube = new CubeModel(size, function (color, position) {
                return cubeView.AddTile(color, position);
        });
        cubeView.AttachRotator();
        cube.action.subscribe(function (event) {
                cubeView.DoAnimation(event, cube);
        });
        var lastSliceIndex = size - 1;
        var prefixKey = 0;
        var player = createPlayer(function (action) {
                if (!isNaN(+action)) {
                        prefixKey = +action;
                        return;
                }
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
        return { cube, player };
}
export { GetCube };
