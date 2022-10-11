/** @module WebUtils */

/**
 * The cube is made of `6 x size x size` number of tiles. Just that and not any
 * specific container for each face. In this way it is easier to rotate any
 * group of such tiles around any axis needed. Each tile is made of 3 cascaded
 * elements.
 *
 * 1. Face
 * 2. Tile
 * 3. Tile-in
 *
 * `face` is the outer most element. all the tiles prefixed with same prefix
 * belongs to a single face. e.g. all tiles prefixed with f will belongs to the
 * front face.
 *
 * `tile` is the middle element. it is raised a bit along z axis to give the
 * tiles a 3d texture. It can any kind of fancy if needed.
 *
 * `tile-in` is the inner most element. It will have color or image. on rotation
 * of face, this is the tile which will be rotated.
 */
var WebUtils = (module.exports = {
        /**
         * Cube can be rotated with mouse drag.
         *
         * @param {Object} cubeView - View Object of cube
         * @param {number} initial_x_rotation - Rotation around x axis in degree
         * @param {number} initial_y_rotation - Rotation around y axis in degree
         */
        enableMouseDrag: function (cubeView, initial_x_rotation, initial_y_rotation) {
                var xaxis = initial_x_rotation || 0,
                        yaxis = initial_y_rotation || 0;
                var pressed = false;
                var dsource;
                var rotRat = 360 / 1000;
                cubeView.container.addEventListener('mousedown', function (e) {
                        pressed = true;
                        dsource = {
                                x: e.clientX,
                                y: e.clientY,
                        };
                });
                cubeView.container.addEventListener('mouseup', function () {
                        pressed = false;
                });
                cubeView.container.addEventListener('mouseleave', function () {
                        pressed = false;
                });
                cubeView.container.addEventListener('mousemove', function (e) {
                        var delta;
                        if (pressed) {
                                delta = {
                                        x: e.clientX - dsource.x,
                                        y: e.clientY - dsource.y,
                                };
                                yaxis += delta.x * rotRat;
                                xaxis -= delta.y * rotRat;
                                if (xaxis > 50) {
                                        xaxis = 50;
                                }
                                if (xaxis < -50) {
                                        xaxis = -50;
                                }
                                dsource = {
                                        x: e.clientX,
                                        y: e.clientY,
                                };
                                cubeView.cube.style.transform = genRotationStyle(xaxis, yaxis);
                        }
                });
        },
        /**
         * It appends the given html string to a given node
         *
         * @param {string} template - Html string
         * @param {HTMLElement} destinationNode - Dom node on which the html
         *   string will be appended
         * @returns {HTMLElement}
         */
        appendTemplate: function (template, destinationNode) {
                var node = document.createRange().createContextualFragment(template);
                destinationNode.appendChild(node);
                return destinationNode.lastChild;
        },
        CubeView,
});

/**
 * It generates the css when applied to a elements it will rotate the element.
 *
 * @param {number} x - Angle of rotation in degree around x axis
 * @param {number} y - Angle of rotation in degree around y axis
 * @returns {string}
 */
var genRotationStyle = function (x, y) {
        return 'rotateX(' + x + 'deg) rotateY(' + y + 'deg)';
};

/**
 * It is used to convert the tile color into css color string. These strings are
 * valid css colors. Tile colors are basically tile face names, so it is a
 * mapping of face to color. `l : 'green'` implies, left face will be green.
 */
var colorMap = {
        l: 'green',
        r: 'blue',
        f: 'red',
        b: 'orange',
        u: 'yellow',
        d: 'white',
};

/**
 * Generates css class based on the color and position of the tile
 *
 * @param {string} f - Face of the cube, any of `f`,`b`,`l`,`r`,`t`,`d`
 * @param {number} x - X co-ordinate of the tile
 * @param {number} y - Y co-ordinate of the tile
 * @returns {string} - Css class, the class defination is defined in style sheet
 */
var genCubeClass = function (f, x, y) {
        return 'face ' + f + '-' + y + '-' + x;
};

/**
 * Generates css class. The class prefixed with `t` is a class representing the
 * initial postion of the tile. this class along with color, uniquely describe a
 * tile.
 *
 * This is needed for faces with image. Each tile will have a frangment of the
 * image. e.g. tile with 't-0-0`and white face, is going to have the`(0,0)`th
 * fragment of the image placed in position of white background.
 *
 * Other class like `left`, `right`, 'top-left` etc. defines the styling of each
 * positioned tiles
 *
 * @param {number} size - Size of the cube
 * @param {number} x - Current x coordinate of the tile
 * @param {number} y - Current y coordinate of the tile
 * @param {number} ix - Initial x coordinate of the tile
 * @param {number} iy - Initial y coordinate of the tile
 * @returns {string} - Css class, the class defination is defined in style sheet
 */
var genTileClass = function (size, x, y, ix, iy) {
        var cls = 'tile ' + ' t-' + iy + '-' + ix;
        if (x === 0 && y !== 0 && y !== size - 1) {
                cls += ' left';
        } else if (x === size - 1 && y !== 0 && y !== size - 1) {
                cls += ' right';
        } else if (y === 0 && x !== 0 && x !== size - 1) {
                cls += ' top';
        } else if (y === size - 1 && x !== 0 && x !== size - 1) {
                cls += ' bottom';
        } else if (x === 0 && y === 0) {
                cls += ' top-left';
        } else if (x === size - 1 && y === 0) {
                cls += ' top-right';
        } else if (x === 0 && y === size - 1) {
                cls += ' bottom-left';
        } else if (x === size - 1 && y === size - 1) {
                cls += ' bottom-right';
        } else {
                cls += ' inner';
        }
        return cls;
};

/**
 * It will simply add an html element called the rotator. which will be used to
 * do the animation.
 *
 * @param {HTMLElement} ele - Element on which rotator will be attacked
 * @returns {HTMLElement}
 */
var attachRotator = function (ele) {
        var r = document.createElement('div');
        r.className = 'rotator';
        ele.appendChild(r);
        r.style.transition = 'transform 0.4s ease 0s';
        return r;
};

/**
 * View of the cube model. It renders the cube on the screen with the help of
 * css perspective and other tricky rules.
 *
 * @class
 * @param {HTMLElement} element - The html element on which the cube view will
 *   be attached
 * @param {number} size - Size of the cube
 * @param {number} initial_x_rotation - Rotation around x axis in degree
 * @param {number} initial_y_rotation - Rotation around y axis in degree
 */
function CubeView(element, size, initial_x_rotation, initial_y_rotation) {
        var cubeContainer = document.createElement('div');
        cubeContainer.className = 'cube-container';
        var cube = document.createElement('div');
        cube.className = 'cube';
        cube.style.transform = genRotationStyle(initial_x_rotation, initial_y_rotation);
        // cube.style.transition = 'transform 0.5s linear 0s';
        cubeContainer.appendChild(cube);
        element.appendChild(cubeContainer);
        this.container = cubeContainer;
        this.cube = cube;
        this.cubeSize = size;
}

/**
 * It adds a tile based on the face and postion.
 *
 * @param {string} faceName - One of `l`,`r`,`u`,`d`,`f`,`b`
 * @param {module:Cube~Position} position - Position of the tile on the face
 * @returns {Object} - It will be stored as data in each cube tile model
 */
CubeView.prototype.AddTile = function (faceName, position) {
        var face = document.createElement('div');
        face.className = genCubeClass(faceName, position.x, position.y);
        //face.innerText = position.x + ',' + position.y;
        var tile = document.createElement('div');
        tile.className = genTileClass(this.cubeSize, position.x, position.y, position.x, position.y);
        var tileIn = document.createElement('div');
        tileIn.className = 'tile-in ' + colorMap[faceName];
        tile.appendChild(tileIn);
        face.appendChild(tile);
        this.cube.appendChild(face);
        return {
                face: face,
                tile: tile,
                tileIn: tileIn,
        };
};

/**
 * Attach rotator element to the {@link module:WebUtils~CubeView}. It should be
 * called after {@link module:WebUtils~CubeView#AddTiles}.
 */
CubeView.prototype.AttachRotator = function () {
        this.rotator = attachRotator(this.cube);
};

/**
 * It rerenders the cube. It is done after the rotation animation. It should not
 * be used individually.
 *
 * @param {module:Cube~Cube} cube - The cube model
 */
CubeView.prototype._repaintCube = function (cube) {
        var face, x, y, tile;
        for (face in cube.model) {
                for (y = 0; y < cube.size; y++) {
                        for (x = 0; x < cube.size; x++) {
                                tile = cube.model[face].face[y][x];
                                tile.data.face.className = genCubeClass(face[0], x, y);
                                tile.data.tile.className = genTileClass(
                                        cube.size,
                                        x,
                                        y,
                                        tile.initPosition.x,
                                        tile.initPosition.y
                                );
                                tile.data.tileIn.className = 'tile-in ' + colorMap[tile.color];
                                tile.data.tileIn.style.transform = 'rotateZ(' + tile.rotation + 'deg)';
                        }
                }
        }
};

/**
 * It does the slice rotation animation.
 *
 * 1. All the affected tiles are put in a fragment
 * 2. Css rotation is applied to the fragments
 * 3. All the affected tiles are put back to the cube
 * 4. The cube is rerendered
 *
 * @param {module:Cube~CubeEvent} event - The cube event triggered due to any
 *   cube rotation on the model
 * @param {module:Cube~Cube} cube - The cube model
 */
CubeView.prototype.DoAnimation = function (event, cube) {
        var that = this;
        var all = document.createDocumentFragment();
        event.affectedTiles.forEach(function (tile) {
                all.appendChild(tile.data.face);
        });
        that.rotator.appendChild(all);
        var transformString =
                'rotate' +
                event.axis.toUpperCase() +
                '(' +
                (event.axis === 'y' ? -1 : 1) * event.direction * 90 +
                'deg)';
        that.rotator.style.transform = transformString;
        setTimeout(function () {
                event.affectedTiles.forEach(function (tile) {
                        all.appendChild(tile.data.face);
                });
                all.appendChild(that.rotator);
                that.cube.appendChild(all);
                that.rotator.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) ';
                event.next();
                that._repaintCube(cube);
        }, 500);
};
