'use strict';

var cfg = require('./config/');
var test = require('../lib/entry');
var subscriptionId = '19d81882-cd38-4a21-a41e-f87c09861195';


var options = {
    clusterName : 'tidnode-ibex',
    location: ''
},
credential;
// console.log('getTokenCloudCredentials');
test.getServiceTokenCloudCredentials({
    subscriptionId: subscriptionId,
    management: cfg.management
}).then(function(resultCredential) {
    // console.log('getTokenCloudCredentials result:', resultCredential );
    credential = resultCredential;
    return Promise.resolve('jelou'); //test.getCluster(credential, options.clusterName);
}).then(function(result) {
    // console.log('getCluster result:', result );
    return test.deleteCluster(credential, options.clusterName, 'East US');
}).then(function(result) {
    // console.log('deleteCluster result:', result );
    /*setInterval(function() {
        test.getCluster(credential, options.clusterName).then(function(result) {
            console.log(result);
        })
    }, 10000)*/
}).catch(function(e) {
    // console.log(e.stack);
});
