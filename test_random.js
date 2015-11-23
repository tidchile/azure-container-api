'use strict';

var test = require('./lib/entry');
var subscriptionId = '19d81882-cd38-4a21-a41e-f87c09861195';
var CONST = require('./lib/constants');


test.getTokenCloudCredentials(subscriptionId, CONST.SERVICE_MANAGEMENT_URL).then(function(result) {
    console.log( result )

}).catch(function(e) {
    console.log(e.stack);
});

test.getBill(subscriptionId).then(function(result) {
    console.log( result )

}).catch(function(e) {
    console.log(e.stack);
});