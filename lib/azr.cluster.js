'use strict';

var azureHDInsight = require('azure-asm-hdinsight')
    ,azrUtil = require('./azr.util')
    ,resourceUtil = require('./ResourceUtils')
    ,azureArmHDInsight = require('azure-arm-hdinsight');
var azureCommon = require('azure-common');
var azureUtil = azureCommon.util;
var azrResources = require('./azr.resources');

/*
 { resources:
 [ {

 resource": {
     "tags": {
     "Client": "HDInsight xplat SDK 1.0.0.0"
     },
     "provisioningState": "InProgress",
     "properties": {
     "clusterVersion": "3.2.1000.0",
     "osType": "Linux",
     "clusterDefinition": {
     "blueprint": "https://blueprints.azurehdinsight.net/hadoop-3.2.1000.0.6183632.json",
     "kind": "Hadoop"
     },
     "computeProfile": {
     "roles": [
     {
     "name": "headnode",
     "targetInstanceCount": 2,
     "hardwareProfile": {
     "vmSize": "Large"
     }
     },
     {
     "name": "workernode",
     "targetInstanceCount": 1,
     "hardwareProfile": {
     "vmSize": "A6"
     }
     },
     {
     "name": "zookeepernode",
     "targetInstanceCount": 3,
     "hardwareProfile": {
     "vmSize": "Small"
     }
     }
     ]
     },
     "provisioningState": "InProgress",
     "clusterState": "ClusterStorageConfiguration",
     "createdDate": "2015-11-26T20:33:05.243",
     "quotaInfo": {
     "coresUsed": 12
     },
     "connectivityEndpoints": [
     {
     "name": "HTTPS",
     "protocol": "TCP",
     "location": "tidnode-marten.azurehdinsight.net",
     "port": 443
     },
     {
     "name": "SSH",
     "protocol": "TCP",
     "location": "tidnode-marten-ssh.azurehdinsight.net",
     "port": 22
     }
     ]
     },

 tags: {},
 id: '/subscriptions/d837e441-5fc9-4d50-a01b-999999999999/resourceGroups/Default-Storage-EastUS/providers/Microsoft.HDInsight/clusters/citiesresearch',
 name: 'citiesresearch',
 type: 'Microsoft.HDInsight/clusters',
 location: 'eastus' },
 ... ],
 statusCode: 200,
 requestId: 'f011728e-813a-43e8-9478-f180cedbfb9c' }
 */
var getClusterList = function(credential) {
    return azrResources.listDetails(credential, {resourceType:'Microsoft.HDInsight/clusters'});
};

var createClusterLinux = function(credential, options) {
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
        mgmClt.clusterManagement.create(options.clusterName, clusterCreationPayload,function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
/*
{
    "resource": {
    "tags": {},
    "provisioningState": "Succeeded",
        "properties": {
        "clusterVersion": "3.2.1000.0",
            "osType": "Linux",
            "clusterDefinition": {
            "blueprint": "https://blueprints.azurehdinsight.net/hadoop-3.2.1000.0.6183632.json",
                "kind": "Hadoop"
        },
        "computeProfile": {
            "roles": [
                {
                    "name": "headnode",
                    "targetInstanceCount": 2,
                    "hardwareProfile": {
                        "vmSize": "Standard_D3"
                    }
                },
                {
                    "name": "workernode",
                    "targetInstanceCount": 1,
                    "hardwareProfile": {
                        "vmSize": "Large"
                    }
                },
                {
                    "name": "zookeepernode",
                    "targetInstanceCount": 3,
                    "hardwareProfile": {
                        "vmSize": "Small"
                    }
                }
            ]
        },
        "provisioningState": "Succeeded",
            "clusterState": "Running",
            "createdDate": "2015-11-26T12:39:08.387",
            "quotaInfo": {
            "coresUsed": 12
        },
        "connectivityEndpoints": [
            {
                "name": "SSH",
                "protocol": "TCP",
                "location": "tidchile-borrame-ssh.azurehdinsight.net",
                "port": 22
            },
            {
                "name": "HTTPS",
                "protocol": "TCP",
                "location": "tidchile-borrame.azurehdinsight.net",
                "port": 443
            }
        ]
    },
    "id": "/subscriptions/19d81882-cd38-4a21-a41e-f87c09861195/resourceGroups/Default-Storage-CentralUS/providers/Microsoft.HDInsight/clusters/tidchile-borrame",
        "name": "tidchile-borrame",
        "type": "Microsoft.HDInsight/clusters",
        "location": "East US"
    },
    "statusCode": 200,
    "requestId": "9dbc3200-7f07-49b7-9928-0cc2cddd7078"
}*/
var getCluster = function(credential, clusterName) {
    return new Promise(function(resolve, reject) {
        getClusterList(credential).then(function(list) {
            var cluster = null;
            for(var i = 0; i < list.resources.length;i++) {
                if (list.resources[i].resource.name === clusterName) {
                    cluster = list.resources[i];
                    break;
                }
            }
            resolve(cluster);
        }).catch(function(err) {
            reject(err);
        });
    });
};

var resizeCluster = function(credential, clusterName, targetInstanceCount) {
    return new Promise(function(resolve, reject) {
        getCluster(credential, clusterName).then(function(cluster) {           
            cluster = Object.assign(cluster, resourceUtil.getResourceInformation(cluster.resource.id));
            var mgmClt = azureArmHDInsight.createHDInsightManagementClient(credential);
            mgmClt.clusters.resize(cluster.resourceGroup, clusterName, {targetInstanceCount:targetInstanceCount},
                    function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                });
        }).catch(function(err) {
            reject(err);
        });
    });
};

var deleteCluster = function(credential, clusterName, location) {
    return new Promise(function(resolve, reject) {
        getCluster(credential, clusterName).then(function(cluster) {
            cluster = Object.assign(cluster, resourceUtil.getResourceInformation(cluster.resource.id));
            var mgmClt = azureArmHDInsight.createHDInsightManagementClient(credential);
            mgmClt.clusters.deleteMethod(cluster.resourceGroup, clusterName,
                    function(err, result) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                });
        }).catch(function(err) {
            reject(err);
        });
    });
};
    
module.exports = {
    getClusterList: getClusterList
    ,createClusterLinux: createClusterLinux
    ,getCluster: getCluster
    ,deleteCluster: deleteCluster
    ,resizeCluster: resizeCluster
};
