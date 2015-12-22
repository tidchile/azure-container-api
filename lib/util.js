'use strict';

var extract = function(obj, key) {
    if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        delete obj[key];
        return value;
    }
};

module.exports = {

    extract : extract

};
