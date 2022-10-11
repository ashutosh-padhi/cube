/** @module util */
module.exports = {
        /**
         * It will take an object and checks if it is an array or not
         *
         * @param {Object} arr - Input object
         * @returns {boolean} - True if array
         */
        isArray: function (arr) {
                return Object.prototype.toString.apply(arr) === '[object Array]';
        },

        /**
         * It creates a square grid of numbers or a fixed string. It can be used
         * to represent each face of the cube in a terminal or other
         * applications with 2D user interface.
         *
         * @param {number} size - Size of the cube. Basically it means each face
         *   has `(size x size)` grid of tiles
         * @param {string} value - String or number to put on each tile. if
         *   `undefined` numbers starting from 0 to `(size x size)` is put on
         *   each tile starting from top to bottom and left to right.
         * @returns { module:util~NumberOrString[][]}
         */
        generateMatrix: function (size, value) {
                var row,
                        col,
                        mat = [],
                        rowMat;
                for (row = 0; row < size; row++) {
                        rowMat = [];
                        for (col = 0; col < size; col++) {
                                if (value !== undefined) {
                                        rowMat.push(value);
                                } else {
                                        rowMat.push(row * size + col);
                                }
                        }
                        mat.push(rowMat);
                }
                return mat;
        },
};



/**
 * A number, or a string
 * @typedef {(number|string)} module:util~NumberOrString
 */