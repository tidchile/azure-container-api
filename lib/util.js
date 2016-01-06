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
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    return content;
};

var stringIsNullOrEmpty = function (text) {
    return text === null ||
    text === undefined ||
    text.trim() === '';
};

var ignoreCaseEquals = function (a, b) {
  return a === b ||
    (a !== null && a !== undefined &&
    b !== null && b !== undefined &&
    (a.toLowerCase() === b.toLowerCase())) === true;
};

module.exports = {
    extract: extract
    ,stripBOM: stripBOM
    ,stringIsNullOrEmpty :stringIsNullOrEmpty
    ,ignoreCaseEquals: ignoreCaseEquals
};
