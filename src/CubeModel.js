/** @module Cube */
var util = require('./util');
var pubsub = require('./pubsub');

/**
 * It creates a position object (x,y), it describes the position of a tile in a
 * cube face
 *
 * @class
 * @param {number} x
 * @param {number} y
 */
function Position(x, y) {
        this.x = x;
        this.y = y;
}

/**
 * All the faces of the cube.
 *
 * @property {string} FRONT "front"
 * @property {string} BACK "back"
 * @property {string} UP "up"
 * @property {string} DOWM "down"
 * @property {string} LEFT "left"
 * @property {string} RIGHT "right"
 * @readonly
 * @enum {string}
 */
var SIDES = Object.freeze({
        FRONT: 'front',
        BACK: 'back',
        UP: 'up',
        DOWM: 'down',
        LEFT: 'left',
        RIGHT: 'right',
});

/**
 * Tile container, it groups tiles from differnt cube faces. It can return all
 * the tiles when needed.
 *
 * - It can be used to do any animation if needed in the user interface
 *
 * @class
 */
function TileAccumulator() {
        /** @member {module:Cube~CubeTile} */
        this.tiles = [];
}

/**
 * It takes a slice, a 1D array, and puts all the items in the container.
 *
 * @param {Array} slice
 * @returns {module:Cube~TileAccumulator}
 */
TileAccumulator.prototype.AddSlice = function (slice) {
        this.tiles = this.tiles.concat(slice);
        return this;
};

/**
 * It takes the face, 2D array, and puts all its items in the container.
 *
 * @param {Array} face - 2D array face.
 */
TileAccumulator.prototype.AddFace = function (face) {
        this.tiles = face.face
                .reduce(function (a, b) {
                        return a.concat(b);
                }, [])
                .concat(this.tiles);
};

/**
 * It returns a 1D array with all the affected tiles.
 *
 * @returns {Array}
 */
TileAccumulator.prototype.GetTiles = function () {
        return this.tiles;
};

/**
 * Cube Model. The cube is made of 6 faces and each face is made of square grid
 * of tiles.
 *
 * @class
 * @param {number} [size=3] - Size of the rubiks cube. Default is `3`
 * @param {module:Cube~tilefn} [tilefn=undefined] - A callback function needed
 *   while createing individual tiles. Default is `undefined`
 */
function Cube() {
        var size, tilefn;
        if (util.isArray(arguments[0])) {
                size = arguments[0][SIDES.FRONT].length;
                tilefn = arguments[1];
        } else {
                size = arguments[0];
                tilefn = arguments[1];
        }
        /**
         * Size of the rubiks cube. Default is `3`
         *
         * @member {number} [size=3] Default is `3`
         */
        this.size = size || 3;

        /**
         * Internal model of the cube, 6 2d arrays. one for each face.
         *
         * @member {Object<string, module:Cube~CubeFace>}
         */
        this.model = {};
        this.model[SIDES.FRONT] = [];
        this.model[SIDES.BACK] = [];
        this.model[SIDES.UP] = [];
        this.model[SIDES.DOWM] = [];
        this.model[SIDES.LEFT] = [];
        this.model[SIDES.RIGHT] = [];

        /**
         * Subject to publish events and subscribe action.
         *
         * @member {module:pubsub}
         */
        this.action = pubsub();

        var rowList, colList, row, col, face;
        for (face in this.model) {
                rowList = [];
                for (row = 0; row < size; row++) {
                        colList = [];
                        for (col = 0; col < size; col++) {
                                colList.push(face[0]);
                        }
                        rowList.push(colList);
                }
                this.model[face] = new CubeFace(rowList, tilefn);
        }
}

/**
 * All the faces of the cube
 *
 * @memberof module:Cube~Cube
 * @borrows SIDES as module:Cube~Cube#SIDES
 */
Cube.prototype.SIDES = SIDES;

/**
 * It will rotate a slice of the cube in clockwise in x axis. The 0th position
 * is the left most face, the right most face is at one less than the size of
 * the cube position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not.
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.xClockWise = function (pos, emitEvent) {
        var upslice = this.model[SIDES.UP].sliceX(pos),
                frontslice = this.model[SIDES.FRONT].sliceX(pos),
                downslice = this.model[SIDES.DOWM].sliceX(pos),
                backslice = this.model[SIDES.BACK].sliceX(this.size - 1 - pos),
                that = this,
                action = function () {
                        that.model[SIDES.UP].mergeSliceX(frontslice, pos);
                        that.model[SIDES.FRONT].mergeSliceX(downslice, pos);
                        that.model[SIDES.DOWM].mergeSliceX(backslice.rotate(180).reverse(), pos);
                        that.model[SIDES.BACK].mergeSliceX(upslice.rotate(180).reverse(), that.size - 1 - pos);
                        if (pos === 0) {
                                that.model[SIDES.LEFT].rotateAntiClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.RIGHT].rotateClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(upslice).AddSlice(frontslice).AddSlice(downslice).AddSlice(backslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.LEFT]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.RIGHT]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('x', 1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * It will rotate a slice in anti-clockwise in x-axis. The 0th position is the
 * left most face, the right most face is at one less than the size of the cube
 * position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.xAntiClockWise = function (pos, emitEvent) {
        var upslice = this.model[SIDES.UP].sliceX(pos),
                backslice = this.model[SIDES.BACK].sliceX(this.size - 1 - pos),
                downslice = this.model[SIDES.DOWM].sliceX(pos),
                frontslice = this.model[SIDES.FRONT].sliceX(pos),
                that = this,
                action = function () {
                        that.model[SIDES.UP].mergeSliceX(backslice.rotate(180).reverse(), pos);
                        that.model[SIDES.BACK].mergeSliceX(downslice.rotate(180).reverse(), that.size - 1 - pos);
                        that.model[SIDES.DOWM].mergeSliceX(frontslice, pos);
                        that.model[SIDES.FRONT].mergeSliceX(upslice, pos);
                        if (pos === 0) {
                                that.model[SIDES.LEFT].rotateClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.RIGHT].rotateAntiClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(upslice).AddSlice(frontslice).AddSlice(downslice).AddSlice(backslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.LEFT]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.RIGHT]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('x', -1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * It will rotate a slice of the cube in clockwise in y axis. The 0th slice is
 * the top most face and the bottom most slice is at one less than size of the
 * cube position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.yClockWise = function (pos, emitEvent) {
        var frontslice = this.model[SIDES.FRONT].sliceY(pos),
                rightslice = this.model[SIDES.RIGHT].sliceY(pos),
                backslice = this.model[SIDES.BACK].sliceY(pos),
                leftslice = this.model[SIDES.LEFT].sliceY(pos),
                that = this,
                action = function () {
                        that.model[SIDES.FRONT].mergeSliceY(rightslice, pos);
                        that.model[SIDES.RIGHT].mergeSliceY(backslice, pos);
                        that.model[SIDES.BACK].mergeSliceY(leftslice, pos);
                        that.model[SIDES.LEFT].mergeSliceY(frontslice, pos);
                        if (pos === 0) {
                                that.model[SIDES.UP].rotateClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.DOWM].rotateAntiClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(rightslice).AddSlice(frontslice).AddSlice(leftslice).AddSlice(backslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.UP]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.DOWM]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('y', 1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * It will rotate a slice of the cube in anti-clockwise in y axis. The 0th slice
 * is the top most face and the bottom most slice is at one less than size of
 * the cube position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.yAntiClockWise = function (pos, emitEvent) {
        var frontslice = this.model[SIDES.FRONT].sliceY(pos),
                leftslice = this.model[SIDES.LEFT].sliceY(pos),
                backslice = this.model[SIDES.BACK].sliceY(pos),
                rightslice = this.model[SIDES.RIGHT].sliceY(pos),
                that = this,
                action = function () {
                        that.model[SIDES.FRONT].mergeSliceY(leftslice, pos);
                        that.model[SIDES.LEFT].mergeSliceY(backslice, pos);
                        that.model[SIDES.BACK].mergeSliceY(rightslice, pos);
                        that.model[SIDES.RIGHT].mergeSliceY(frontslice, pos);
                        if (pos === 0) {
                                that.model[SIDES.UP].rotateAntiClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.DOWM].rotateClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(rightslice).AddSlice(frontslice).AddSlice(leftslice).AddSlice(backslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.UP]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.DOWM]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('y', -1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * It will rotate a slice of the cube in clockwise in z axis. The 0th slice is
 * the front most face and the back most slice is at one less than size of the
 * cube position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.zClockWise = function (pos, emitEvent) {
        var revPos = this.size - 1 - pos;
        var upslice = this.model[SIDES.UP].sliceY(revPos),
                leftslice = this.model[SIDES.LEFT].sliceX(revPos),
                downslice = this.model[SIDES.DOWM].sliceY(pos),
                rightslice = this.model[SIDES.RIGHT].sliceX(pos),
                that = this,
                action = function () {
                        that.model[SIDES.UP].mergeSliceY(leftslice.rotate(90).reverse(), revPos);
                        that.model[SIDES.LEFT].mergeSliceX(downslice.rotate(90), revPos);
                        that.model[SIDES.DOWM].mergeSliceY(rightslice.rotate(90).reverse(), pos);
                        that.model[SIDES.RIGHT].mergeSliceX(upslice.rotate(90), pos);
                        if (pos === 0) {
                                that.model[SIDES.FRONT].rotateClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.BACK].rotateAntiClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(rightslice).AddSlice(upslice).AddSlice(leftslice).AddSlice(downslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.FRONT]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.BACK]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('z', 1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * It will rotate a slice of the cube in anti-clockwise in z axis. The 0th slice
 * is the front most face and the back most slice is at one less than size of
 * the cube position.
 *
 * @param {number} pos - Index of the slice
 * @param {boolean} emitEvent - Whether to emit event or not
 *
 *   - If `true` it publishes event over {@link module:Cube~Cube#action} subject and
 *       it doesn't apply any rotation to the cube yet. It is the responsibility
 *       of the caller to apply rotation on reception of the event.
 *   - Else it simply applies the rotation to the cube
 */
Cube.prototype.zAntiClockWise = function (pos, emitEvent) {
        var revPos = this.size - 1 - pos;
        var upslice = this.model[SIDES.UP].sliceY(revPos),
                rightslice = this.model[SIDES.RIGHT].sliceX(pos),
                downslice = this.model[SIDES.DOWM].sliceY(pos),
                leftslice = this.model[SIDES.LEFT].sliceX(revPos),
                that = this,
                action = function () {
                        that.model[SIDES.UP].mergeSliceY(rightslice.rotate(-90), revPos);
                        that.model[SIDES.RIGHT].mergeSliceX(downslice.rotate(-90).reverse(), pos);
                        that.model[SIDES.DOWM].mergeSliceY(leftslice.rotate(-90), pos);
                        that.model[SIDES.LEFT].mergeSliceX(upslice.rotate(-90).reverse(), revPos);
                        if (pos === 0) {
                                that.model[SIDES.FRONT].rotateAntiClockWise();
                        } else if (pos === that.size - 1) {
                                that.model[SIDES.BACK].rotateClockWise();
                        }
                },
                tileAccumulator = new TileAccumulator();
        tileAccumulator.AddSlice(rightslice).AddSlice(upslice).AddSlice(leftslice).AddSlice(downslice);
        if (pos === 0) {
                tileAccumulator.AddFace(that.model[SIDES.FRONT]);
        } else if (pos === that.size - 1) {
                tileAccumulator.AddFace(that.model[SIDES.BACK]);
        }
        if (emitEvent) {
                this.action.publish(new CubeEvents('z', -1, pos, tileAccumulator.GetTiles(), action));
        } else {
                action();
        }
};

/**
 * Face of the cube. The face of the cube is made of a square grid of tiles. It
 * is a 2d structure. This 2d place can be sliced horizontally
 * {@link module:Cube~CubeFace#sliceY} or sliced vertically
 * {@link module:Cube~CubeFace#sliceX}.
 *
 * @class
 * @property {module:Cube~CubeTile[][]} face - An array representing the face of
 *   the cube.
 * @property {number} size - Size of the face, it is same as size of the cube.
 * @param {string[][]} face - 2d array representing the face of the cube, where
 *   each tile can be of any color data, f,b,u,d,l,r.
 * @param {module:Cube~tilefn} tilefn - Callback to execute before creating of
 *   each tile.
 */
function CubeFace(face, tilefn) {
        var row, col, colArray, tileData, color, initTilePosition;
        face = face || [];
        this.size = 0;
        if (util.isArray(face)) {
                this.face = [];
                this.size = face.length;
                for (row = 0; row < this.size; row++) {
                        colArray = [];
                        for (col = 0; col < this.size; col++) {
                                color = face[row][col];
                                initTilePosition = new Position(col, row);
                                if (tilefn && typeof tilefn === 'function') {
                                        tileData = tilefn(color, initTilePosition);
                                }
                                colArray.push(new CubeTile(color, initTilePosition, tileData));
                        }
                        this.face.push(colArray);
                }
        }
}

/**
 * Replace a slice of the face ({@link module:Cube~CubeFace#sliceX},
 * {@link module:Cube~CubeFace#sliceY}) with another existing slice in x-axis. It
 * mutates the model. It is advisable to make sure to copy the existing slice
 * before merging into it.
 *
 * @param {module:Cube~CubeTile[]} slice - An array of cube tiles that needed to
 *   be merged in a face
 * @param {number} position - Slice index in x axis, which will be replaced with
 *   the given slice
 */
CubeFace.prototype.mergeSliceX = function (slice, position) {
        for (var row = 0; row < this.size; row++) {
                this.face[row][position] = slice[row];
        }
};

/**
 * Replace a slice of the face ({@link module:Cube~CubeFace#sliceX},
 * {@link module:Cube~CubeFace#sliceY}) with another existing slice in y-axis. It
 * mutates the model. It is advisable to make sure to copy the existing slice
 * before merging into it.
 *
 * @param {module:Cube~CubeTile[]} slice - An array of cube tiles that needed to
 *   be merged in a face
 * @param {number} position - Slice index in y axis, which will be replaced with
 *   the given slice
 */
CubeFace.prototype.mergeSliceY = function (slice, position) {
        for (var col = 0; col < this.size; col++) {
                this.face[position][col] = slice[col];
        }
};

/**
 * Extend the slice by adding {@link module:Cube~rotate} method to it.
 *
 * @function
 * @param {module:Cube~CubeTile[]} obj - A slice to extend
 * @returns {module:Cube~CubeTile[]}
 */
var augumentSlice = function (obj) {
        /**
         * It applies the current rotation to each tile of the slice and returns
         * the mutated slice.
         *
         * @function module:Cube~rotate
         * @param {number} angle - Angle in degree
         * @returns {module:Cube~CubeTile}
         */
        obj.rotate = function (angle) {
                angle = angle || 90;
                obj.forEach(function (e) {
                        e.rotation += angle;
                        e.rotation %= 360;
                });
                return obj;
        };
        return obj;
};

/**
 * It will return an 1D array representing the slice cut horizontally or in y
 * axis. It doesn't mutate the model.
 *
 * @param {number} position - Position in y axis to cut the slice.
 * @returns {module:Cube~CubeTile[]}
 */
CubeFace.prototype.sliceY = function (position) {
        var slice = [];
        for (var col = 0; col < this.size; col++) {
                slice[col] = this.face[position][col];
        }
        return augumentSlice(slice);
};

/**
 * It will return an 1D array representing the slice cut vertically or in x
 * axis. It doesn't mutate the model.
 *
 * @param {number} position - Position in x axis to cut the slice.
 * @returns {module:Cube~CubeTile[]}
 */
CubeFace.prototype.sliceX = function (position) {
        var slice = [];
        for (var row = 0; row < this.size; row++) {
                slice[row] = this.face[row][position];
        }
        return augumentSlice(slice);
};

/**
 * Rotate a face either clockwise or anticlockwise
 *
 * @param {boolean} clockwise - If true rotates clockwise else anti-clockwise
 */
CubeFace.prototype.rotate = function (clockwise) {
        var row,
                col,
                newMat = util.generateMatrix(this.size, 0);
        for (row = 0; row < this.size; row++) {
                for (col = 0; col < this.size; col++) {
                        if (clockwise) {
                                this.face[row][col].rotation += 90;
                                this.face[row][col].rotation %= 360;
                                newMat[col][this.size - row - 1] = this.face[row][col];
                        } else {
                                this.face[row][col].rotation -= 90;
                                this.face[row][col].rotation %= 360;
                                newMat[row][col] = this.face[col][this.size - row - 1];
                        }
                }
        }
        this.face = newMat;
};

/** Rotates the face clockwise. also applies rotation to each of its tiles. */
CubeFace.prototype.rotateClockWise = function () {
        this.rotate(true);
};

/** Rotates the face anti-clockwise. also applies rotation to each of its tiles */
CubeFace.prototype.rotateAntiClockWise = function () {
        this.rotate();
};

/**
 * A single cube tile.
 *
 * @class
 * @param {string} color - Color of the tile
 * @param {module:Cube~Position} position - Postion of the tile in current
 *   {@link CubeFace}
 * @param {Object} data - Any data that needes to be stored per tile
 * @param {number} rotation - Angle in degree, multiples of 90. This is the
 *   rotation applied to the tile because of the cube operations. this rotation
 *   is not helpful if cube is made of flat color faces. But if cube is made of
 *   faces with images, then each tile rotation also need to be handled.
 */
function CubeTile(color, position, data, rotation) {
        if (!rotation) {
                rotation = 0;
        }
        this.color = color;
        this.initPosition = position;
        this.data = data;
        this.rotation = rotation;
}

/**
 * @class
 * @param {string} axis - One of `x`, `y` or `z`
 * @param {number} direction - `1` for clockwise, `-1` for anti-clockwise
 * @param {number} position - Index of the current slice
 * @param {module:Cube~CubeTile[]} affectedTiles - List of all affected tiles
 * @param {function} next - Handler to execute the rotation action
 */
function CubeEvents(axis, direction, position, affectedTiles, next) {
        /** @member */
        this.axis = axis;
        /** @member */
        this.direction = direction;
        /** @member */
        this.position = position;
        /** @member */
        this.affectedTiles = affectedTiles;
        /** @member */
        this.next = next;
}

module.exports = {
        /** @borrows Cube as module:Cube~CubeModel */
        CubeModel: Cube,
        /** @borrows SIDES as module:Cube~SIDES */
        SIDES: SIDES,
};

/**
 * Before creating each tile this callback will be called. It can return any
 * data that will be stored along with the internal model data.
 *
 * @callback module:Cube~tilefn
 * @param {string} color - Color of the tile, it can be one of f,b,u,d,l,r. the
 *   color mapping can be anything.
 * @param {module:Cube~Position} position - Position of the tile in the specific
 *   face.
 * @returns {Object} - Data that needed to be stored along with the model data
 *   for each tile.
 * @see {module:Cube~Cube}
 */
