"use strict";

var azureCommon = require('azure-common');

var WebResource = azureCommon.WebResource,
    xml = azureCommon.xml2js,
    js2xml = azureCommon.js2xml;
    
var RateCardOperations = ( /** @lends RateCardOperations */ function() {
    /**
     * @class
     * __NOTE__: An instance of this class is automatically created for an
     * instance of the [RateCardManagementClient] {@link
        * RateCardManagementClient~RateCardManagementClient}.
     * See [usageAggregates] {@link
        * RateCardManagementClient~RateCardManagementClient#usageAggregates}.
     * Initializes a new instance of the UsageAggregationOperations class.
     * @constructor
     *
     * @param {RateCardManagementClient} client Reference to the service
     * client.
     */
    function RateCardOperations(client) {
        this.client = client;
    }

    /**
     * Query for the resource/meter metadata and related prices used in a given subscription
     * (see
     * https://msdn.microsoft.com/library/azure/1ea5b323-54bb-423d-916f-190de96c6a3c
     * for more information)
     *
     * @param {Date} offerDurableId  A valid Offer ID code (e.g., MS-AZR-0026P).
     * See Microsoft Azure Offer Details(https://azure.microsoft.com/en-us/support/legal/offer-details/)
     * for more information on the list of available Offer IDs, country/region availability, and billing currency.
     * The Offer ID parameter consists of the “MS-AZR-“ prefix, plus the Offer ID number.
     *
     * @param {Date} reportedEndTime The end of the time range to retrieve data
     * for.
     *
     * @param {string} currency The currency in which
     * the resource rates need to be provided.
     *
     * @param {string} locale The culture in which the resource metadata needs
     * to be localized.
     *
     * @param {string} regionInfo 2 letter ISO code where the offer was purchased.
     *
     * @param {function} callback
     *
     * @returns {Stream} The response stream.
     */
    RateCardOperations.prototype.get = function(offerDurableId, currency, locale, regionInfo, callback) {
        if (callback === null || callback === undefined) {
            throw new Error('callback cannot be null.');
        }
        // Validate
        if (offerDurableId === null || offerDurableId === undefined) {
            return callback(new Error('offerDurableId cannot be null.'));
        }
        if (currency === null || currency === undefined) {
            return callback(new Error('currency cannot be null.'));
        }
        if (locale === null || locale === undefined) {
            return callback(new Error('locale cannot be null.'));
        }
        if (regionInfo === null || regionInfo === undefined) {
            return callback(new Error('regionInfo cannot be null.'));
        }

        // Tracing

        // Construct URL
        var url2 = '';
        url2 = url2 + 'subscriptions/';
        if (this.client.credentials.subscriptionId !== null && this.client.credentials.subscriptionId !== undefined) {
            url2 = url2 + encodeURIComponent(this.client.credentials.subscriptionId);
        }
        url2 = url2 + '/providers/Microsoft.Commerce/RateCard';
        var queryParameters = [];
        var odataFilter = [];
        queryParameters.push('api-version=2015-06-01-preview');


        odataFilter.push('OfferDurableId eq \'' + encodeURIComponent(offerDurableId) + '\'');
        odataFilter.push('Currency eq \'' + encodeURIComponent(currency) + '\'');
        odataFilter.push('Locale eq \'' + encodeURIComponent(locale) + '\'');
        odataFilter.push('RegionInfo eq \'' + encodeURIComponent(regionInfo) + '\'');
        queryParameters.push('$filter=' + odataFilter.join(' and '));

        if (queryParameters.length > 0) {
            url2 = url2 + '?' + queryParameters.join('&');
        }
        var baseUrl = this.client.baseUri;
        // Trim '/' character from the end of baseUrl and beginning of url.
        if (baseUrl[baseUrl.length - 1] === '/') {
            baseUrl = baseUrl.substring(0, (baseUrl.length - 1) + 0);
        }
        if (url2[0] === '/') {
            url2 = url2.substring(1);
        }
        url2 = baseUrl + '/' + url2;
        url2 = url2.replace(' ', '%20');

        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'GET';
        httpRequest.headers = {};
        httpRequest.url = url2;

        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';

        // Send Request
        return this.client.pipeline(httpRequest, function(err, response, body) {
            if (err !== null && err !== undefined) {
                return callback(err);
            }
            var statusCode = response.statusCode;
            if (statusCode !== 200) {
                var error = new Error(body);
                error.statusCode = response.statusCode;
                return callback(error);
            }

            // Create Result
            var result = null;
            // Deserialize Response
            if (statusCode === 200) {
                var responseContent = body;
                result = { rateCard: { offerTerms:[], meters:[], currency: "",locale: "",
                           isTaxIncluded: false, meterRegion: "", tags: [] }
                         };
                var responseDoc = null;
                if (responseContent) {
                    responseDoc = JSON.parse(responseContent);
                }

                if (responseDoc !== null && responseDoc !== undefined) {

                    if (responseDoc.OfferTerms !== null && responseDoc.OfferTerms !== undefined) {
                        result.rateCard.offerTerms  = responseDoc.OfferTerms;
                    }
                    if (responseDoc.Currency !== null && responseDoc.Currency !== undefined) {
                        result.rateCard.currency = responseDoc.Currency;
                    }
                    if (responseDoc.Locale !== null && responseDoc.Locale !== undefined) {
                        result.rateCard.locale = responseDoc.Locale;
                    }
                    if (responseDoc.IsTaxIncluded !== null && responseDoc.IsTaxIncluded !== undefined) {
                        result.rateCard.isTaxIncluded = responseDoc.IsTaxIncluded;
                    }
                    if (responseDoc.MeterRegion !== null && responseDoc.MeterRegion !== undefined) {
                        result.rateCard.meterRegion = responseDoc.MeterRegion;
                    }
                    if (responseDoc.Tags !== null && responseDoc.Tags !== undefined) {
                        result.rateCard.tags = responseDoc.Tags;
                    }


                    var valueArray = responseDoc['Meters'];
                    if (valueArray !== null && valueArray !== undefined) {
                        for (var loweredIndex1 = 0; loweredIndex1 < valueArray.length; loweredIndex1 = loweredIndex1 + 1) {
                            var valueValue = valueArray[loweredIndex1];
                            var meterInstance = {};
                            result.rateCard.meters.push(meterInstance);

                            var meterIdValue = valueValue['MeterId'];
                            if (meterIdValue !== null && meterIdValue !== undefined) {
                                meterInstance.meterId = meterIdValue;
                            }

                            var meterNameValue = valueValue['MeterName'];
                            if (meterNameValue !== null && meterNameValue !== undefined) {
                                meterInstance.meterName = meterNameValue;
                            }

                            var meterCategoryValue = valueValue['MeterCategory'];
                            if (meterCategoryValue !== null && meterCategoryValue !== undefined) {
                                meterInstance.meterCategory = meterCategoryValue;
                            }

                            var meterSubCategoryValue = valueValue['MeterSubCategory'];
                            if (meterSubCategoryValue !== null && meterSubCategoryValue !== undefined) {
                                meterInstance.meterSubCategory = meterSubCategoryValue;
                            }

                            var unitValue = valueValue['Unit'];
                            if (unitValue !== null && unitValue !== undefined) {
                                meterInstance.unit = unitValue;
                            }

                            var meterRatesValue = valueValue['MeterRates'];
                            if (meterRatesValue !== null && meterRatesValue !== undefined) {
                                meterInstance.meterRate = meterRatesValue;
                            }

                            var effectiveDateValue = valueValue['EffectiveDate'];
                            if (effectiveDateValue !== null && effectiveDateValue !== undefined) {
                                meterInstance.effectiveDate = effectiveDateValue;
                            }

                            var includedQuantityValue = valueValue['IncludedQuantity'];
                            if (includedQuantityValue !== null && includedQuantityValue !== undefined) {
                                meterInstance.includedQuantity = includedQuantityValue;
                            }
                        }
                    }
                }
            }
            result.statusCode = statusCode;

            return callback(null, result);
        });
    };

    return RateCardOperations;
})();
    
var createRateCardOperations = function(client) {
    return new RateCardOperations(client);
};

module.exports = {
    createRateCardOperations : createRateCardOperations
};
