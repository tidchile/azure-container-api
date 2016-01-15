'use strict';

var billing = require('./azr.billing')
    ,cluster = require('./azr.cluster')
    ,credential = require('./azr.credential')
    ,storage = require('./azr.storage')
    ,subscription = require('./azr.subscription')
    ,resources = require('./azr.resources');


module.exports = {

    getUsage: billing.getUsage,

    getRateCard : billing.getRateCard,

    getBill: billing.getBill,

    getClusterList: cluster.getClusterList,

    getCluster: cluster.getCluster,

    deleteCluster: cluster.deleteCluster,

    createClusterLinux: cluster.createClusterLinux,

    getTokenCloudCredentials: credential.getTokenCloudCredentials,

    getServiceTokenCloudCredentials: credential.getServiceTokenCloudCredentials,

    getResourceTokenCloudCredentials: credential.getResourceTokenCloudCredentials,

    getRoleSize: subscription.getRoleSize,

    getLocations : subscription.getLocations,

    getSubscriptionList: subscription.getSubscriptionList,

    getSubscription: subscription.getSubscription,

    getContentFromContainer: storage.getContentFromContainer,

    getListResources: resources.list,

    getResource: resources.get,

    getProvider: resources.getProvider,

    getProviderList: resources.getProviderList,

    getListResourcesDetails: resources.listDetails,

    getSize: storage.getSize
    
    ,createOrUpdateDeployFromTemplate: resources.createOrUpdateDeployFromTemplate
    ,createResourceGroup: resources.createResourceGroup
    ,checkExistenceResourceGroup: resources.checkExistenceResourceGroup
    ,resizeCluster : cluster.resizeCluster    
    ,copyBlobs : storage.copyBlobs
    ,copyBlobsByPrefix : storage.copyBlobsByPrefix
    ,getListContainer: storage.getListContainer
    ,getListDirectories: storage.getListDirectories
    ,getStorageAccount: storage.getStorageAccount
    ,getListStorageAccount: storage.getListStorageAccount
    ,getStorageAccountKeys: storage.getStorageAccountKeys
    ,getContainerAcl: storage.getContainerAcl
    ,getMetadataContainer: storage.getMetadataContainer
    ,getSizeOfContainerWithPrefix: storage.getSizeOfContainerWithPrefix
    ,createCluster: cluster.createCluster

};
