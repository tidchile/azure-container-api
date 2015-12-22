'use strict';

var Subscription = require('./azr.subscription'),
    azureCommerce = require('azure-arm-commerce');

var getUsage = function(credential, reportedStartTime, reportedEndTime, aggregationGranularity, showDetails, continuationToken) {
    return new Promise(function(resolve, reject) {
        var mgmClt = azureCommerce.createUsageAggregationManagementClient(credential);
        mgmClt.usageAggregates.get(reportedStartTime,reportedEndTime,aggregationGranularity,showDetails,continuationToken,function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getRateCard = function(credential, offerDurableId, currency, locale, regionInfo) {
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
        regionInfo = 'US';
    }
    return new Promise(function(resolve, reject) {
        var mgmClt = azureCommerce.createUsageAggregationManagementClient(credential);
        mgmClt.rateCard = require('./azr.util').createRateCardOperations(mgmClt);

        mgmClt.rateCard.get(offerDurableId,currency,locale,regionInfo,function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

var getBill = function(credential, subscriptionId, offerDurableId, currency, locale, regionInfo) {
    return new Promise(function(resolve, reject) {
        var dateFrom = '', result = { usage: {}, total: 0, currency: '',locale:'', isTaxIncluded: '', meterRegion: ''},
            usage = {};

        Subscription.getSubscription(credential, subscriptionId).then(function(resultSubscription) {
            dateFrom = resultSubscription.subscription.created.toJSON().toString().substring(0, 10);

            var now = new Date();
            now.setHours(0,0,0,0);
            now = new Date(now);

            var dateTo = now.toJSON().toString().substring(0, 10);
            return getUsage(credential, dateFrom, dateTo);
        }).then(function(resultUsage) {

            resultUsage.usageAggregations.forEach(function(elem) {
                var p = elem.properties;
                if (p.meterId in usage) {
                    usage[p.meterId].quantity += p.quantity;
                } else {
                    usage[p.meterId] = { name: p.meterName, unit: p.unit, quantity:p.quantity, rate:0 };
                }
            });

            return getRateCard(credential, offerDurableId, currency, locale, regionInfo);

        }).then(function(resultRateCard) {
            var total = 0;
            resultRateCard.rateCard.meters.forEach(function(elem) {

                var key =  elem.meterId;
                if (key in usage) {
                    usage[key].rate = elem.meterRate["0"];

                    total += (usage[key].rate * usage[key].quantity);
                }
            });

            result.locale = resultRateCard.rateCard.locale;
            result.isTaxIncluded = resultRateCard.rateCard.isTaxIncluded;
            result.meterRegion = resultRateCard.rateCard.meterRegion;
            result.currency = resultRateCard.rateCard.currency;
            result.usage = usage;
            result.total = total;
            resolve(result);

        }).catch(function(e) {
            reject(e);
        });
    });
};


module.exports = {

    getUsage: getUsage,

    getRateCard : getRateCard,

    getBill: getBill

};
