'use strict';

var extract = function(obj, key) {
    if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        delete obj[key];
        return value;
    }
};

var stripBOM = function (content) {
    if (Buffer.isBuffer(content)) {
        content = content.toString();
    }
    if (0xFEFF  === content.charCodeAt(0)) {
        content = content.slice(1);
    }
    return content;
};

module.exports = {
    extract : extract
    ,stripBOM: stripBOM
};
