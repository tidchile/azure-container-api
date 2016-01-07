"use strict";

var storage = require('azure-asm-storage');
var createBlobService = storage.createBlobService;
var extract  = require('./util').extract;


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

var getContentFromContainer = function(options) {
    if (options == null) {
        throw new Error('Missing options');
    }
    return new Promise(function(resolve, reject) {
        options = Object.assign({}, options);
        options.querySize = options.querySize || 25;
        //options.delimiter = options.delimiter || '/';
        var storage = extract(options, 'storage');
        var prefix = extract(options, 'prefix');
        var continuationToken = extract(options, 'continuationToken');

        var blobSvc = createBlobService(storage.account, storage.accessKey);
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


var getListContainer = function (storageAccountName, storageAccountKey, containerName, prefix, options) {
    return new Promise(function (resolve, reject) {
        var blobSvc = createBlobService(storageAccountName, storageAccountKey);
        var blobs = [];
        function callback(err, result) {
            if (err) {
                reject(err);
            } else {
                blobs = blobs.concat(result.entries);
                var isComplete = (options && options.maxResults && (blobs.length >= options.maxResults));
                if (result.continuationToken) {
                    blobSvc.listBlobsSegmentedWithPrefix(containerName, prefix, result.continuationToken, options, callback);
                } else { 
                    resolve({blobs: blobs, continuationToken: result.continuationToken});
                }
            }
        }
        blobSvc.listBlobsSegmentedWithPrefix(containerName, prefix, null, options, callback);
    });
};

var getListDirectories = function (storageAccountName, storageAccountKey, containerName, prefix, options) {
    return new Promise(function (resolve, reject) {
        var blobSvc = createBlobService(storageAccountName, storageAccountKey);
        var containers = [];
        function callback(err, result) {
            if (err) {
                reject(err);
            } else {
                containers = containers.concat(result.entries);
                if (result.continuationToken) {
                    blobSvc.listBlobDirectoriesSegmentedWithPrefix(containerName, prefix, result.continuationToken, options, callback);
                } else {
                    resolve(containers);
                }
            }
        }
        blobSvc.listBlobDirectoriesSegmentedWithPrefix(containerName, prefix, null, options, callback);
    });
};

var getSize = function(credential, storageAccount, containerName, prefix) {
    return new Promise(function(resolve, reject) {
        var mgmClt = storage.createStorageManagementClient(credential);
        mgmClt.storageAccounts.getKeys(storageAccount, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = {

    getContentFromContainer: getContentFromContainer,
    getSize: getSize

};
