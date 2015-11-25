'use strict';

var credential = require('./azr.credential'),
    resourceManagement = require('azure-arm-resource'),
    azureHDInsight = require('azure-asm-hdinsight'),
    azrUtil = require('./azr.util');

var azureCommon = require('azure-common');
var azureUtil = azureCommon.util;

/*
 { resources:
 [ { tags: {},
 id: '/subscriptions/d837e441-5fc9-4d50-a01b-999999999999/resourceGroups/Default-Storage-EastUS/providers/Microsoft.HDInsight/clusters/citiesresearch',
 name: 'citiesresearch',
 type: 'Microsoft.HDInsight/clusters',
 location: 'eastus' },
 ... ],
 statusCode: 200,
 requestId: 'f011728e-813a-43e8-9478-f180cedbfb9c' }
 */
var getClusterList = function(credential){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.list({resourceType:'Microsoft.HDInsight/clusters'}, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var createClusterLinux = function(credential, options){
    if (credential === null || credential === undefined) {
        throw new Error('credential cannot be null.');
    }

    if (options === null || options === undefined) {
        throw new Error('options cannot be null.');
    }
    if (options.clusterName === null || options.clusterName === undefined) {
        throw new Error('options.clusterName cannot be null.');
    }
    if (options.osType === null || options.osType === undefined) {
        throw new Error('options.osType cannot be null.');
    }
    if (options.headNodeSize === null || options.headNodeSize === undefined) {
        throw new Error('options.headNodeSize cannot be null.');
    }
    if (options.dataNodeSize === null || options.dataNodeSize === undefined) {
        throw new Error('options.dataNodeSize cannot be null.');
    }
    if (options.storageAccountName === null || options.storageAccountName === undefined) {
        throw new Error('options.storageAccountName cannot be null.');
    };
    if (options.storageAccountKey === null || options.storageAccountKey === undefined) {
        throw new Error('options.storageAccountKey cannot be null.');
    }
    if (options.storageContainer === null || options.storageContainer === undefined) {
        throw new Error('options.storageContainer cannot be null.');
    }
    if (options.dataNodeCount === null || options.dataNodeCount === undefined) {
        throw new Error('options.dataNodeCount cannot be null.');
    }
    if (options.location === null || options.location === undefined) {
        throw new Error('options.location cannot be null.');
    }
    if (options.userName === null || options.userName === undefined) {
        throw new Error('options.userName cannot be null.');
    }
    if (options.password === null || options.password === undefined) {
        throw new Error('options.password cannot be null.');
    }
    if (options.sshUserName === null || options.sshUserName === undefined) {
        throw new Error('options.sshUserName cannot be null.');
    }
    if (options.sshPassword === null || options.sshPassword === undefined) {
        throw new Error('options.sshPassword cannot be null.');
    }



    var clusterPayload = azrUtil.createClusterPayloadLinux(options.clusterName, options.storageAccountName,
        options.storageAccountKey, options.storageContainer, options.dataNodeCount, options.headNodeSize,
        options.dataNodeSize, options.location, options.userName,
        options.password, options.sshUserName, options.sshPassword, credential.subscriptionId);

    var clusterCreationPayload  = { payload: clusterPayload };

    var regionCloudServiceName = azureUtil.getNameSpace(credential.subscriptionId, 'hdinsight', options.location);

    return new Promise(function(resolve, reject) {
        var mgmClt = azureHDInsight.createHDInsightCluster2ManagementClient(regionCloudServiceName,credential);
        mgmClt.clusterManagement.create(options.clusterName, clusterCreationPayload,function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

/*
 {
  "passthroughResponse": {
    "data": {
        "connectivityEndpoints": [
                                    {
                                     "location": "citiesresearch-ssh.azurehdinsight.net",
                                     "name": "SSH",
                                     "port": 22,
                                     "protocol": "TCP",
                                     "credentials": {}
                                    },
                                    {
                                     "location": "citiesresearch.azurehdinsight.net",
                                     "name": "HTTPS",
                                     "port": 443,
                                     "protocol": "TCP",
                                     "credentials": {
                                         "webConnectivityCredential": {
                                             "type": "Web",
                                             "password": "XXXXXX",
                                             "username": "usernname"
                                         }
                                     }
                                    }
                                  ],
        "deploymentDocuments": [],
        "apiVersion": 2015,
        "createdDate": "2015-11-02T14:02:56.037Z",
        "hdiVersion": "3.2.1000.0.6035701",
        "id": "citiesresearch",
        "location": "East US",
        "state": "Running",
        "tenantId": 136041,
        "userSubscriptionId": "d837e441-5fc9-4d50-a01b-8e8690ec0a96"
        }
 },
 "statusCode": 200
 }
 */
var getCluster = function(credential, clusterName){

    return new Promise(function(resolve, reject) {
        var regionCloudServiceName = azureUtil.getNameSpace(credential.subscriptionId, 'hdinsight', 'location');
        var mgmClt = azureHDInsight.createHDInsightCluster2ManagementClient(regionCloudServiceName, credential);
        mgmClt.clusterManagement.get(clusterName, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var deleteCluster = function(credential, clusterName){

    return new Promise(function(resolve, reject) {
        var regionCloudServiceName = azureUtil.getNameSpace(credential.subscriptionId, 'hdinsight', 'location');
        var mgmClt = azureHDInsight.createHDInsightCluster2ManagementClient(regionCloudServiceName, credential);
        mgmClt.clusterManagement.deleteMethod(clusterName, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


module.exports = {

    getClusterList: getClusterList,

    createClusterLinux: createClusterLinux,

    getCluster: getCluster,

    deleteCluster: deleteCluster

};
