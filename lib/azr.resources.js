'use strict';

var credential = require('./azr.credential'),
    resourceManagement = require('azure-arm-resource'),
    CONST = require('./constants');

var list = function (credential) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.list({},function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var get = function (credential, namespace){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.get(namespace,function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getProvider = function (credential, namespace){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.providers.get(namespace,function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getProviderList = function (credential, namespace){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.providers.list(function (err, result) {
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
    list: list,
    get: get,
    getProvider: getProvider,
    getProviderList:getProviderList
};
