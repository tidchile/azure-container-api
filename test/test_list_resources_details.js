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
    return test.getListResourcesDetails(credential);
}).then(function(result) {
    console.log('getListResourcesDetails result:' );
    console.log(JSON.stringify(result,null, '\t'));
}).catch(function(e) {
    console.log(e.stack);
});
