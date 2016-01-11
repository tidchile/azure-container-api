"use strict";

var storage = require('azure-asm-storage');

var extract  = require('./util').extract;
var util = require('util');
var azureCommon = require('azure-common');
var azrStorage = require('azure-storage');
var BlobUtilities = azrStorage.BlobUtilities;
var createBlobService = azrStorage.createBlobService;
/*
* * options.storage{account:account,accessKey:accessKey,container:container}
* option.prefix
* options.continuationToken{nextMarker: nextMarker, targetLocation:targetLocation}
* [options.querySize]
* [options.maxResults]
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
        mgmClt.storageAccounts.getKeys(storageAccount, 
            function(err, result) {
                err ? reject(err) : resolve(result);
            }  
        );
    });
};

var copyBlobs = function(sourceAccountName, sourceAccountKey, sourceContainer, sourceBlob, destAccountName, destAccountKey, destContainer, destBlob){
    
    if (sourceAccountName === null || sourceAccountName === undefined) {
        throw new Error('sourceAccountName cannot be null.');
    }
    if (sourceAccountKey === null || sourceAccountKey === undefined) {
        throw new Error('sourceAccountKey cannot be null.');
    }
    if (sourceContainer === null || sourceContainer === undefined) {
        throw new Error('sourceContainer cannot be null.');
    }
    if (sourceBlob === null || sourceBlob === undefined) {
        throw new Error('sourceBlob cannot be null.');
    }
    if (destAccountName === null || destAccountName === undefined) {
        throw new Error('destAccountName cannot be null.');
    }
    if (destAccountKey === null || destAccountKey === undefined) {
        throw new Error('destAccountKey cannot be null.');
    }
    if (destContainer === null || destContainer === undefined) {
        throw new Error('destContainer cannot be null.');
    }       
    destBlob = destBlob ? destBlob : sourceBlob;
    var endpointSuffix = '.blob.core.windows.net';
    var protocol = 'https://';
    var sourceBlobEndpoint =  protocol + sourceAccountName + endpointSuffix;
    var destBlobEndpoint =   protocol  + destAccountName +  endpointSuffix;
    var blobSvcSource = createBlobService(sourceAccountName, sourceAccountKey, sourceBlobEndpoint);
    
    var sourceUri = sourceBlobEndpoint + '/' + sourceContainer + '/' + sourceBlob;
    var sasToken;
    return new Promise(function (resolve, reject) {        
        blobSvcSource.getContainerAcl(sourceContainer, function(err, permission){
            if (err) { 
                reject(err); 
            } else {                
                var criteria = BlobUtilities.BlobContainerPublicAccessType.OFF;
                if (criteria == permission.publicAccessLevel) {
                    // Grant temporary SAS token to the source
                    var sharedAccessPolicy = {
                        AccessPolicy: {
                            Permissions: BlobUtilities.SharedAccessPermissions.READ,
                            Expiry: azureCommon.date.daysFromNow(7)
                        },
                    };
                    sasToken = blobSvcSource.generateSharedAccessSignature(sourceContainer,
                                                                           sourceBlob, sharedAccessPolicy);
                }
                sourceUri += (sasToken === null ? '' : ('?' + sasToken));
                var options = { accessCondition: {} };
                var blobSvcDest = createBlobService(destAccountName, destAccountKey, destBlobEndpoint);
                blobSvcDest.startCopyBlob(sourceUri, destContainer, destBlob, options, function(err, result){
                    err ? reject(err) : resolve(result);
                });    
            }
        });
    });
};

var getStorageAccount = function (credential, accountName) {
    return new Promise(function (resolve, reject) {
        var mgmClt = storage.createStorageManagementClient(credential);
        mgmClt.storageAccounts.get(accountName, function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

var getListStorageAccount = function (credential) {
    return new Promise(function (resolve, reject) {
        var mgmClt = storage.createStorageManagementClient(credential);
        mgmClt.storageAccounts.list(function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

var getStorageAccountKeys = function (credential, accountName) {
    return new Promise(function (resolve, reject) {
        var mgmClt = storage.createStorageManagementClient(credential);
        mgmClt.storageAccounts.getKeys(accountName, function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

var getContainerAcl = function (storageAccountName, storageAccountKey, container) {
    return new Promise(function (resolve, reject) {
        var blobSvc = createBlobService(storageAccountName, storageAccountKey);
        blobSvc.getContainerAcl(container.name, function (err, result) {
            if (err) {
                reject(err);
            } else {
                container.acl = result;
                resolve(container);
            }
        });
    });
};

var getMetadataContainer = function (storageAccountName, storageAccountKey, container) {
    return new Promise(function (resolve, reject) {
        var blobSvc = createBlobService(storageAccountName, storageAccountKey);
        blobSvc.getContainerMetadata(container.name, function (err, result) {
            if (err) {
                reject(err);
            } else {
                container.meta = result;
                resolve(container);
            }
        });
    });
};

module.exports = {
    getContentFromContainer: getContentFromContainer
    ,getListContainer:getListContainer
    ,getListDirectories:getListDirectories
    ,getSize: getSize
    ,copyBlobs: copyBlobs
    ,getStorageAccount: getStorageAccount
    ,getListStorageAccount: getListStorageAccount
    ,getStorageAccountKeys: getStorageAccountKeys
    ,getContainerAcl: getContainerAcl
    ,getMetadataContainer: getMetadataContainer
};
