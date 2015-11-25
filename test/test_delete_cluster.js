'use strict';

var cfg = require('./config/');
var test = require('../lib/entry');
var subscriptionId = 'd837e441-5fc9-4d50-a01b-8e8690ec0a96';

var credential

console.log('getTokenCloudCredentials');
test.getServiceTokenCloudCredentials({
    subscriptionId: subscriptionId,
    management: cfg.management
}).then(function(credentialResult) {
    console.log('getTokenCloudCredentials result:', credentialResult );
    credential = credentialResult;
    return test.getClusterList(credential);
}).then(function(result) {
    console.log('getClusterList result:', result.resources );

    if (result.resources.length>0){
        var cluster = result.resources[0]
        return test.deleteCluster(credential, cluster.name);
    }


}).then(function(result) {
    console.log('deleteCluster result:');
    console.log(JSON.stringify(result,null, '\t'));


}).catch(function(e) {
    console.log(e.stack);
});
