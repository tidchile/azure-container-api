'use strict';

var credential = require('./azr.credential'),
    azureManagement = require('azure-asm-mgmt'),
    azureSubscription = require('azure-asm-subscription'),
    CONST = require('./constants');

/*

 { roleSizes:
 [ { name: 'A10',
 label: 'A10 (8 cores, 57344 MB)',
 cores: 8,
 memoryInMb: 57344,
 supportedByWebWorkerRoles: true,
 supportedByVirtualMachines: true,
 maxDataDiskCount: 16,
 webWorkerResourceDiskSizeInMb: 1861268,
 virtualMachineResourceDiskSizeInMb: 391828 },
 ... ],
 statusCode: 200,
 requestId: '84066f487e8638c5acd093232f4e4c64'
 }
 */


var getRoleSize = function(subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.SERVICE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureManagement.createManagementClient(credential);
            mgmClt.roleSizes.list(function (err, result) {
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


/*

 { locations:
 [ { availableServices: [Object],
 name: 'East US',
 displayName: 'East US',
 storageCapabilities: [Object],
 computeCapabilities: [Object] },
 ... ],
 statusCode: 200,
 requestId: 'ea2ae4557dc239d5995117f7e4734f1f'
 }
 */

var getLocations = function(subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.SERVICE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureManagement.createManagementClient(credential);
            mgmClt.locations.list(function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(function(e) {
            console.error(e);
            reject(Error(e));
        });
    });
};



var getSubscriptionList = function(subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.SERVICE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureSubscription.createSubscriptionClient(credential);
            mgmClt.subscriptions.list(function (err, result) {
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

var getSubscription = function(subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.SERVICE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureSubscription.createSubscriptionClient(credential);

            mgmClt.subscriptions.get = require('./azr.util').getSubscription;

            mgmClt.subscriptions.get(subscriptionId,function (err, result) {
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

    getRoleSize: getRoleSize,

    getLocations : getLocations,

    getSubscriptionList: getSubscriptionList,

    getSubscription: getSubscription

};
