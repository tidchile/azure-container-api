'use strict';

var cfg = require('./config/');
var test = require('../lib/entry');
var subscriptionId = 'd837e441-5fc9-4d50-a01b-8e8690ec0a96';

console.log('getTokenCloudCredentials');
test.getServiceTokenCloudCredentials({
    subscriptionId: subscriptionId,
    management: cfg.management
}).then(function(credential) {
    console.log('getTokenCloudCredentials result:', credential );
    return test.getBill(credential, subscriptionId);
}).then(function(result) {
    console.log('getBill result:', result );
}).catch(function(e) {
    console.log(e.stack);
});
