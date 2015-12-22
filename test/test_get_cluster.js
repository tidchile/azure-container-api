'use strict';

var cfg = require('./config/');
var test = require('../lib/entry');
var subscriptionId = '19d81882-cd38-4a21-a41e-f87c09861195';

var credential;

// console.log('getTokenCloudCredentials');
test.getServiceTokenCloudCredentials({
    subscriptionId: subscriptionId,
    management: cfg.management
}).then(function(credentialResult) {
    // console.log('getTokenCloudCredentials result:', credentialResult );
    credential = credentialResult;
    return test.getClusterList(credential);
}).then(function(result) {
    // console.log('getClusterList result:' );
    // console.log(JSON.stringify(result));

    if (result.resources.length > 0) {
        // console.log("+++ "+result.resources[0].resource.name);
        return test.getCluster(credential, result.resources[0].resource.name);
    }
}).then(function(result) {
    // console.log('getCluster result:');
    // console.log(JSON.stringify(result,null, '\t'));
}).catch(function(e) {
    // console.log(e.stack);
});
