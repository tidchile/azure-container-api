'use strict';

var billing = require('./azr.billing')
    ,cluster = require('./azr.cluster')
    ,credential = require('./azr.credential')
    ,storage = require('./azr.storage')
    ,subscription = require('./azr.subscription')
    ,resources = require('./azr.resources')
    ;



module.exports = {

    getUsage: billing.getUsage,

    getRateCard : billing.getRateCard,

    getBill: billing.getBill,

    getClusterList: cluster.getClusterList,

    getTokenCloudCredentials: credential.getTokenCloudCredentials,

    getRoleSize: subscription.getRoleSize,

    getLocations : subscription.getLocations,

    getSubscriptionList: subscription.getSubscriptionList,

    getSubscription: subscription.getSubscription,

    getContentFromContainer: storage.getContentFromContainer,

    getListResources: resources.list,

    getResource: resources.get,

    getProvider: resources.getProvider,

    getProviderList: resources.getProviderList

};