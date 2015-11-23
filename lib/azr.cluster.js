'use strict';

var credential = require('./azr.credential'),
    resourceManagement = require('azure-arm-resource'),
    CONST = require('./constants');

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
var getClusterList = function(subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = resourceManagement.createResourceManagementClient(credential);
            mgmClt.resources.list({resourceType:'Microsoft.HDInsight/clusters'},function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(function(e) {
            console.error(e);
            reject(e);
        });
    });
};


module.exports = {

    getClusterList: getClusterList

};
