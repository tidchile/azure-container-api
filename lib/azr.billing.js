'use strict';

var Credential = require('./azr.credential'),
    Subscription = require('./azr.subscription'),
    azureCommerce = require('azure-arm-commerce'),
    CONST = require('./constants');

var getUsage = function(subscriptionId,reportedStartTime, reportedEndTime, aggregationGranularity, showDetails, continuationToken){
    return new Promise(function(resolve, reject) {
        Credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureCommerce.createUsageAggregationManagementClient(credential);
            mgmClt.usageAggregates.get(reportedStartTime,reportedEndTime,aggregationGranularity,showDetails,continuationToken,function (err, result) {
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

var getRateCard = function(subscriptionId,offerDurableId, currency, locale, regionInfo){
    if (offerDurableId === null || offerDurableId === undefined) {
        offerDurableId = 'MS-AZR-0003P';
    }
    if (currency === null || currency === undefined) {
        currency = 'USD';
    }
    if (locale === null || locale === undefined) {
        locale = 'en-US';
    }
    if (regionInfo === null || regionInfo === undefined) {
        regionInfo='US';
    }
    return new Promise(function(resolve, reject) {
        Credential.getTokenCloudCredentials(subscriptionId, CONST.RESOURCE_MANAGEMENT_URL).then(function(credential) {
            var mgmClt = azureCommerce.createUsageAggregationManagementClient(credential);
            mgmClt.rateCard = require('./azr.util').createRateCardOperations(mgmClt)

            mgmClt.rateCard.get(offerDurableId,currency,locale,regionInfo,function (err, result) {
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

var getBill = function(subscriptionId, offerDurableId, currency, locale, regionInfo){
    return new Promise(function(resolve, reject) {
        var dateFrom = '', result = { usage: {} , total: 0 }, usage = {};


        Subscription.getSubscription(subscriptionId).then(function(resultSubscription) {

            dateFrom = resultSubscription.subscription.created.toJSON().toString().substring(0, 10);

            var now = new Date();
            now.setHours(0,0,0,0);
            now = new Date(now);

            var dateTo = now.toJSON().toString().substring(0, 10);
            return getUsage(subscriptionId,dateFrom, dateTo);
        }).then(function(resultUsage) {

            resultUsage.usageAggregations.forEach(function(elem, index, array){
                var p = elem.properties;
                if (p.meterId in usage){
                    usage[p.meterId].quantity += p.quantity;
                }else{
                    usage[p.meterId] = { name: p.meterName, unit: p.unit, quantity:p.quantity, rate:0 };
                }
            });

            return getRateCard(subscriptionId, offerDurableId, currency, locale, regionInfo);

        }).then(function(resultRateCard) {
            var total = 0;
            resultRateCard.rateCard.meters.forEach(function(elem, index, array){

                var key =  elem.meterId
                if (key in usage){
                    usage[key].rate = elem.meterRate["0"];

                    total += (usage[key].rate * usage[key].quantity)
                }


            });
            result.usage = usage;
            result.total = total;
            resolve(result);

        }).catch(function(e) {
            reject.log(e);
        });
    });
};



module.exports = {

    getUsage: getUsage,

    getRateCard : getRateCard,

    getBill: getBill

};
