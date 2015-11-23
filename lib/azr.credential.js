'use strict';


var cfg = require('../config');

var AdalNode = require('adal-node'),
    azureCommon = require('azure-common'),
    CONST = require('./constants'),
    confMng = cfg.management,
    parameters = confMng.credentials;

var authorityUrl = CONST.AUTHORITY_HOST_URL + '/' + confMng.tenant;

var context = new AdalNode.AuthenticationContext(authorityUrl);
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


var getTokenCloudCredentials = function(subscriptionId, resource){
    return new Promise(function(resolve, reject) {

        context.acquireTokenWithUsernamePassword(resource, parameters.username, parameters.password, parameters.appId, function(err, tokenResponse) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(tokenResponse);
                var credential = new azureCommon.TokenCloudCredentials({subscriptionId: subscriptionId, token:tokenResponse.accessToken});
                resolve(credential);
            }
        });
    });
};

module.exports = {

    getTokenCloudCredentials: getTokenCloudCredentials

};
