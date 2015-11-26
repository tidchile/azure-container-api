'use strict';

var credential = require('./azr.credential')
    ,resourceManagement = require('azure-arm-resource')
    ,util = require('./azr.util');

var list = function (credential,parameters) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.list(parameters,function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var get = function (credential, resourceGroupName, identity){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.get(resourceGroupName, identity, function (err, result) {
            if (err) {
                console.error(err + ": " +identity.resourceName);
                reject(err + ": " +identity.resourceName);
            } else {
                resolve(result);
            }
        });
    });
};

var getProvider = function (credential, resourceProviderNamespace){
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.providers.get(resourceProviderNamespace, function (err, result) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getProviderList = function (credential){
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

var listDetails =  function(credential, parameters){
    return new Promise(function(resolve, reject) {
        var provider = {}
            ,providersNamespace = []
            ,resourcesInfo = []
            ,resourcesResult = [];

        list(credential,parameters).then(function(result) {
            result.resources.forEach(function(resource){
                var resourceInfo = util.getResourceInformation(resource.id);
                resourceInfo.id = resource.id;
                resourcesInfo.push(resourceInfo);
                var tokens = resourceInfo.resourceType.toLowerCase().split('/');

                if (tokens[0] in provider){
                    if (!(tokens[1] in provider[tokens[0]])) {
                        provider[tokens[0]][tokens[1]] = [] ;
                    }
                }else {
                    providersNamespace.push(tokens[0]);
                    provider[tokens[0]] = {};
                    provider[tokens[0]][tokens[1]] = [];
                }
            });
            console.log(provider);

            var sequence = Promise.resolve();

            sequence.then(function(){

                return providersNamespace.reduce(function(chain, namespace) {

                    return chain.then(function() {

                        return getProvider(credential, namespace);

                    }).then(function(providerResult) {

                        var resourcesTypesArr = providerResult.provider.resourceTypes;

                        resourcesTypesArr.forEach(function(resourcesType){
                            if(resourcesType.name.toLowerCase() in provider[providerResult.provider.namespace.toLowerCase()]){

                                provider[providerResult.provider.namespace.toLowerCase()][resourcesType.name.toLowerCase()] = resourcesType.apiVersions;

                            }
                        });
                    }).catch(function(e){
                        console.error("sequence providersNamespace getProvider "+e.stack);
                    });
                }, Promise.resolve());


            }).then(function(){
                sequence.then(function(){
                    return resourcesInfo.reduce(function(chain, resourceInfo){

                        return chain.then(function(){
                            var tokens = resourceInfo.resourceType.split('/');
                            resourceInfo.resourceProviderApiVersion = provider[tokens[0].toLowerCase()][tokens[1].toLowerCase()][0];
                            resourceInfo.resourceProviderNamespace = tokens[0];
                            resourceInfo.resourceType = tokens[1];
                            return get(credential, resourceInfo.resourceGroup, resourceInfo);

                        }).then(function(resource) {
                            resourcesResult.push(resource);
                        }).catch(function(e){
                            console.error("sequence resource get "+e);

                        });
                    }, Promise.resolve());

                }).then(function(){
                    resolve({resources:resourcesResult});

                }).catch(function(e){
                    console.error("03"+e);
                    resolve({resources:resourcesResult});
                });

            }).catch(function(e){
                console.error("04"+e.stack);
                resolve({resources:resourcesResult});
            });

        }).catch(function(e) {
            console.error("05"+e.stack);
            resolve({resources:resourcesResult})
        });


    });

};

module.exports = {
    list: list,
    get: get,
    getProvider: getProvider,
    getProviderList:getProviderList,
    listDetails: listDetails
};
