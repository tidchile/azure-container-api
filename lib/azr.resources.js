'use strict';

var credential = require('./azr.credential'),
    resourceManagement = require('azure-arm-resource'),
    CONST = require('./constants');

var list = function (subscriptionId){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = resourceManagement.createResourceManagementClient(credential);
            mgmClt.resources.list({},function (err, result) {
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

var get = function (subscriptionId, namespace){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = resourceManagement.createResourceManagementClient(credential);
            mgmClt.resources.get(namespace,function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(function(e) {
            console.error(e.stack);
            reject(e);
        });
    });

};


var getProvider = function (subscriptionId, namespace){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = resourceManagement.createResourceManagementClient(credential);
            mgmClt.providers.get(namespace,function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(function(e) {
            console.error(e.stack);
            reject(e);
        });
    });

};
var getProviderList = function (subscriptionId, namespace){
    return new Promise(function(resolve, reject) {
        credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = resourceManagement.createResourceManagementClient(credential);
            mgmClt.providers.list(function (err, result) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch(function(e) {
            console.error(e.stack);
            reject(e);
        });
    });

};



module.exports = {

    list: list,
    get: get,
    getProvider: getProvider,
    getProviderList:getProviderList

};
