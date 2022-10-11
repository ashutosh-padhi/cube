module.exports = {
    Line: function (len, char) {
        if (len === 0) return '';
        var line = '';
        char = char || '-';
        for (var row = 0; row < len; row++) {
            line += char;
        }
        return line;
    },
};
