"use strict";

var storage = require('azure-storage');
var BlobService = storage.createBlobService;
var extract  = require('./util').extract;
var CONST = require('./constants');


/*
* * options.storage{account:account,accessKey:accessKey,container:container}
* option.prefix
* options.continuationToken{nextMarker: nextMarker, targetLocation:targetLocation}
* [options.querySize]

* [options.maxResults]
* [options.date]={year:2013,month : '07', day: 27 };
*
*
* */

var getContentFromContainer = function (options) {
    return new Promise(function(resolve, reject) {
        options.querySize = options.querySize || 25;
        //options.delimiter = options.delimiter || '/';
        var storage = extract(options, 'storage');
        var prefix = extract(options, 'prefix');
        var continuationToken = extract(options, 'continuationToken');

        var blobSvc = BlobService(storage.account, storage.accessKey);
        var blobs = [];

        function aggregateBlobs(err, result) {
            if (err) {
                reject(err);
            } else {
                blobs = blobs.concat(result.entries);
                var isComplete = (options && options.maxResults && (blobs.length >= options.maxResults));
                if (result.continuationToken && !isComplete) {
                    blobSvc.listBlobsSegmentedWithPrefix(storage.container, prefix, result.continuationToken, options, aggregateBlobs);
                } else {
                    resolve({blobs: blobs, continuationToken: result.continuationToken});
                }
            }
        }

        blobSvc.listBlobsSegmentedWithPrefix(storage.container, prefix, continuationToken, options, aggregateBlobs);
    });
};

function normalizeArgs(options) {
    if (options == null) { options = {}; }
    if (options.prefix) {
        switch (options.prefix) {
            case constants.Prefix.DMC_TEMPERATURA:
            case constants.Prefix.DMC_AGUACAIDA:
            case constants.Prefix.DMC_RADIACION:
            case constants.Prefix.DMC_VIENTO:
            case constants.Prefix.DMC_PRESION_HUMEDAD:
                if (options.date) {
                    options.date.day = null;
                }
                break;
            case constants.Prefix.TRANSANTIAGO:
                options.path = options.path.replace(/\//g, '');
                break;
        }
        if (options.date) {
            var path = [];
            if (options.date.year) { path.push(options.date.year); }
            if (options.date.month) { path.push(options.date.month); }
            if (options.date.day) { path.push(options.date.day); }
            options.path = path.join('/');
        }
    }else{
        options.path = '/';
    }
    return options;
}

module.exports = {

    getContentFromContainer: getContentFromContainer

};
