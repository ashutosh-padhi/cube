var util = require('./util');
var Toolbox = require('./Art.ToolBox');

module.exports = function Art(__art) {
    var art = [];
    var height = 0;
    var width = 0;
    var importArt = function (_art) {
        if (_art) {
            var i;
            if (util.isArray(_art)) {
                art = _art;
            } else {
                art = ('' + _art).split('\n');
            }
            height = art.length;
            for (i = 0; i < height; i++) {
                width = Math.max(width, art[i]);
            }
        }
        return this;
    };
    importArt(__art);
    return {
        import: importArt,
        add: function (_art, padding) {
            var htd = _art.height();
            padding = padding || 0;
            var i;
            for (i = 0; i < height; i++) {
                art[i] =
                    art[i] + Toolbox.Line(padding, ' ') + (_art.get(i) || '');
            }
            if (htd > height) {
                for (i = height; i < htd; i++) {
                    art[i] = Toolbox.Line(width + padding, ' ') + _art.get(i);
                }
            }
            return this;
        },
        vadd: function (_art, padding) {
            var _height = _art.height(),
                i;
            padding = padding || 0;
            for (i = height; i < height + _height; i++) {
                art.push(Toolbox.Line(padding, ' ') + _art.get(i));
            }
            return this;
        },
        height: function () {
            return height;
        },
        width: function () {
            return width;
        },
        get: function (index) {
            return art[index] || null;
        },
        getArt: function () {
            return art.slice();
        },
        export: function () {
            return art.join('\n');
        },
    };
};
