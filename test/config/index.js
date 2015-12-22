'use strict';
var env = process.env.NODE_ENV || 'development'
    , config = null;

try {
    // console.info('loading configuration: %s...', env);
    config = require('./cfg.' + env);
    // console.info('OK');
}catch(e) {
    // console.error(e);
    process.exit(1);
}

module.exports = config;
