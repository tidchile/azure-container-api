'use strict';

var resourceManagement = require('azure-arm-resource')
    ,resourceUtil = require('./ResourceUtils')
    ,util = require('./util')
    ,fs = require('fs');

var list = function(credential, parameters) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.list(parameters, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var get = function(credential, resourceGroupName, identity) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.resources.get(resourceGroupName, identity, function(err, result) {
            if (err) {
                reject(err + ': ' + identity.resourceName);
            } else {
                result.resourceProviderApiVersion = identity.resourceProviderApiVersion;
                resolve(result);
            }
        });
    });
};

var getProvider = function(credential, resourceProviderNamespace) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.providers.get(resourceProviderNamespace, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getProviderList = function(credential) {
    return new Promise(function(resolve, reject) {
        var mgmClt = resourceManagement.createResourceManagementClient(credential);
        mgmClt.providers.list(function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var listDetails =  function(credential, parameters) {
    return new Promise(function(resolve, reject) {
        var providers = {}
            ,providersNamespace = []
            ,resourcesInfo = []
            ,resourcesResult = [];
            
        list(credential, parameters).then(function(result) {
             result.resources.forEach(function(resource) {
                var resourceInfo = resourceUtil.getResourceInformation(resource.id)
                    ,resourceType = resourceInfo.resourceType
                    ,i = resourceType.indexOf('/')
                    ,j = 1 + resourceType.lastIndexOf('/'); 
                
                resourceInfo.id = resource.id;
                resourcesInfo.push(resourceInfo);
                
                resourceInfo.resourceProviderNamespace = resourceType.substring(0, i);
                resourceInfo.providerName = resourceType.substring(++i).toLowerCase();
                resourceInfo.resourceType = resourceType.substring(j);
                resourceInfo.parentResourcePath = resourceInfo.parentResource
                var providerNamespace =  resourceInfo.resourceProviderNamespace.toLowerCase();
                if (providerNamespace in providers) {
                    if (!(resourceInfo.providerName in providers[providerNamespace])) {
                        providers[providerNamespace][resourceInfo.providerName] = [] ;
                    }
                } else {
                    providersNamespace.push(providerNamespace);
                    providers[providerNamespace] = {};
                    providers[providerNamespace][resourceInfo.providerName] = [];
                }
            });
        }).then(function() {
            
            Promise.all(
                providersNamespace.map(function(namespace){ return getProvider(credential, namespace) })
             ).then(function(result){
                
                 result.forEach(function(providerResult){
                     var resourcesTypesArr = providerResult.provider.resourceTypes;
                        resourcesTypesArr.forEach(function(resourcesType) {
                            var resourceTypeName = resourcesType.name.toLowerCase()
                                ,providerNamespace = providerResult.provider.namespace.toLowerCase();
                            if(resourceTypeName in providers[providerNamespace]) {
                                providers[providerNamespace][resourceTypeName] = resourcesType.apiVersions;
                            }
                        });
                 });
                 return Promise.all(
                     resourcesInfo.map(function(resourceInfo){
                         resourceInfo.resourceProviderApiVersion = providers[resourceInfo.resourceProviderNamespace.toLowerCase()][resourceInfo.providerName][0];
                         return get(credential, resourceInfo.resourceGroup, resourceInfo);
                     })                     
                 );

             }).then(function(result){
                 resolve({resources:result});    
             }).catch(function(err){
                 reject(err)
             });
        }).catch(function(err){
            reject(err)
        });
    });
};

var createOrUpdateDeployFromTemplate = function (credential,  options) {
    
    var mgmClt = resourceManagement.createResourceManagementClient(credential)
        ,templateParameters;
    
    try{
        templateParameters = createDeploymentParameters(options);
    }catch(e){
        return Promise.reject(e);
    }
    
    return new Promise(function(resolve, reject) {
        mgmClt.deployments.validate(options.resourceGroupName, options.deploymentName, templateParameters,
            function (err, result) {
                if (err) {
                    reject(err);
                } else {
                    mgmClt.deployments.createOrUpdate(options.resourceGroupName, options.deploymentName, templateParameters,
                        function (err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                    });
                }
        });
   });
};

function createDeploymentParameters(options) {
    var deploymentParameters;
    if (options.parameters) {
        deploymentParameters = options.parameters;
    }
    var templateParameters = {};
    templateParameters.properties = {mode: 'Incremental'};
    var content = '';
    if (options.templateFile) {
        content = util.stripBOM(fs.readFileSync(options.templateFile));
    }
    content = JSON.parse(content);
    templateParameters['properties']['template'] = content;
    if (deploymentParameters) {
        templateParameters.properties.parameters = deploymentParameters;
    }
    return templateParameters;
}

module.exports = {
    list: list
    ,get: get
    ,getProvider: getProvider
    ,getProviderList: getProviderList
    ,listDetails: listDetails
    ,createOrUpdateDeployFromTemplate: createOrUpdateDeployFromTemplate
};
