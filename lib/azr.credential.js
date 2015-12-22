'use strict';

var AdalNode = require('adal-node');
var azureCommon = require('azure-common');
var CONST = require('./constants');

/*
 return
 TokenCloudCredentials
    {
        subscriptionId: 'd837e441-5fc9-4d50-a01b-999999999999',
        credentials:
            { subscriptionId: 'd837e441-5fc9-4d50-a01b-999999999',
              token: '<TOKEN>',
              authorizationScheme: 'Bearer'
            }
    }
 */

function getTokenCloudCredentials(options) {
    return new Promise(function(resolve, reject) {
        var subscriptionId = options.subscriptionId;
        var resource = options.resource;
        var confMng = options.management;
        var credentials = confMng.credentials;
        var authorityUrl = CONST.AUTHORITY_HOST_URL + '/' + confMng.tenant;
        var context = new AdalNode.AuthenticationContext(authorityUrl);
        context.acquireTokenWithUsernamePassword(resource, credentials.username, credentials.password, credentials.appId, function(err, tokenResponse) {
            if (err) {
                reject(err);
            } else {
                var credential = new azureCommon.TokenCloudCredentials({subscriptionId: subscriptionId, token: tokenResponse.accessToken});
                resolve(credential);
            }
        });
    });
}

function getServiceTokenCloudCredentials(options) {
    return getTokenCloudCredentials({
        subscriptionId: options.subscriptionId,
        management: options. management,
        resource: CONST.SERVICE_MANAGEMENT_URL
    });
}

function getResourceTokenCloudCredentials(options) {
    return getTokenCloudCredentials({
        subscriptionId: options.subscriptionId,
        management: options. management,
        resource: CONST.RESOURCE_MANAGEMENT_URL
    });
}


module.exports = {

    getTokenCloudCredentials: getTokenCloudCredentials,
    getServiceTokenCloudCredentials: getServiceTokenCloudCredentials,
    getResourceTokenCloudCredentials: getResourceTokenCloudCredentials

};
