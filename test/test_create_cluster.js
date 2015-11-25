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

    var options = {
        clusterName : 'testHadoopCreation8',
        osType: 'linux',
        headNodeSize: 'A3',
        dataNodeSize: 'A3',
        storageAccountName: cfg.storage.account + '.blob.core.windows.net',
        storageAccountKey: cfg.storage.accessKey,
        storageContainer: 'testcreatecluster',
        dataNodeCount: 2,
        location:'East US',
        userName:'Admin',
        password:'Gaviota0##',
        sshUserName:'hdiuser',
        sshPassword:'Gaviota0##'
    };


    return test.createClusterLinux(credential, options);
}).then(function(result) {
    console.log('createClusterLinux result:', result );
}).catch(function(e) {
    console.log(e.stack);
});

