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


var getBlobsContainer = function (storageAccountName, storageAccountKey, containerName, prefix, options) {
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

var getListContainer = function (storageAccountName, storageAccountKey, containerName) {
    return new Promise(function (resolve, reject) {
        var blobSvc = createBlobService(storageAccountName, storageAccountKey);
        var containers = [];
        function callback(err, result) {
            if (err) {
                reject(err);
            } else {
                containers = containers.concat(result.entries);
                if (result.continuationToken) {
                    blobSvc.listContainersSegmentedWithPrefix(containerName, result.continuationToken, callback);
                } else {
                    resolve(containers);
                }
            }
        }
        blobSvc.listContainersSegmentedWithPrefix(containerName, null, callback);
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

var getSizeOfContainerWithPrefix = function (storageAccountName, storageAccountKey, container, prefix) {
    return new Promise(function (resolve, reject) {
        var options = {},
            blobSvc = createBlobService(storageAccountName, storageAccountKey),
            containerSize = 0,
            blobCount = 0;

        function callback(err, result) {
            if (err) {
                reject(err);
            } else {
                blobCount += result.entries.length;
                containerSize = result.entries.reduce(function (a, b) {
                    return a + (124 + (2 * b.name.lenght) + parseInt(b.properties['content-length']));
                }, containerSize);
                if (result.continuationToken) {
                    blobSvc.listBlobsSegmentedWithPrefix(container.name, prefix, result.continuationToken, options, callback);
                } else {
                    container.size = { blobCount: blobCount, containerSize: containerSize }
                    resolve(container);
                }
            }
        }
        blobSvc.listBlobsSegmentedWithPrefix(container.name, prefix, null, options, callback);
    });
};

var getSize = function (credential, storageAccountName, containerName, prefix) {
    return new Promise(function (resolve, reject) {
        var mgmClt = storage.createStorageManagementClient(credential);

        var storageAccountPromise = (storageAccountName !== null && storageAccountName !== undefined &&
        storageAccountName.length > 0) ?
            getStorageAccount(credential, storageAccountName) :
            getListStorageAccount(credential);
        var storageAccountList = [];
        storageAccountPromise.then(function (storageAccountListResult) {
            storageAccountList = storageAccountListResult.storageAccount ? 
                                    [storageAccountListResult.storageAccount] :
                                    storageAccountListResult.storageAccounts;
        }).then(function () {
            Promise.all(
                storageAccountList.map(getKeys)
            ).then(function (storageAccounts) {
                return Promise.all(
                    storageAccounts.map(getContainer)
                )
            }).then(function (storageAccounts) {
                return Promise.all(
                    storageAccounts.map(function(a){ return getSizeStorageAccount(a, prefix)})
                )
            }).then(function (storageAccounts) {
                return Promise.all(
                    storageAccounts.map(getMeta)
                )
            }).then(function (storageAccounts) {
                return Promise.all(
                    storageAccounts.map(getContainerAclSize)
                )
            }).then(function (storageAccounts) {
                return Promise.all(
                    storageAccounts.map(calculateContainerSize)
                )
            }).then(function (storageAccounts) {
                resolve(storageAccounts)
            });
        }).catch(function (err) {
            resolve(err);
        });

        var getKeys = function (storageAccount) {
            return new Promise(function (resolve) {
                getStorageAccountKeys(credential, storageAccount.name).then(function (keysResult) {
                    storageAccount.keys = keysResult;
                    resolve(storageAccount);
                }).catch(function (err) {
                    resolve({});
                });
            });
        };

        var getContainer = function (storageAccount) {
            return new Promise(function (resolve) {
                getListContainer(storageAccount.name, storageAccount.keys.primaryKey, containerName).then(
                    function (listContainerResult) {
                        storageAccount.containers = listContainerResult
                        resolve(storageAccount);
                    }).catch(function (err) {
                    resolve({});
                });
            });
        };

        var getSizeStorageAccount = function (storageAccount, prefix) {
            return new Promise(function (resolve) {
                Promise.all(
                    storageAccount.containers.map(function (container) {
                        return getSizeOfContainerWithPrefix(storageAccount.name, storageAccount.keys.primaryKey, container, prefix);
                    })
                ).then(function (containerSizes) {
                    resolve(storageAccount);
                }).catch(function(err){
                    reject(err)
                });
            });
        };
        var calculateContainerSize = function (storageAccount) {
            storageAccount.size = 0;
            return new Promise(function (resolve) {
                Promise.all(
                    storageAccount.containers.map(function (container) {
                        console.log(container)
                        var size = 0;              
                        
                        for( var meta in container.meta.metadata){
                            size += 3 + meta.length + (container.meta.metadata[meta]?container.meta.metadata[meta].length:0);
                        }
                        
                        size +=  48 + 2 * container.name.length +
                                 512 * container.acl.signedIdentifiers.length + 
                                 container.size.containerSize
                        
                        container.sizeTotal = size;
                        storageAccount.size += container.sizeTotal; 
                    })
                    
                ).then(function (containerSizes) {
                    resolve(storageAccount);
                }).catch(function(err){
                    reject(err)
                });
            });
        };

        var getMeta = function (storageAccount) {
            return new Promise(function (resolve) {
                Promise.all(
                    storageAccount.containers.map(function (container) {
                        return getMetadataContainer(storageAccount.name, storageAccount.keys.primaryKey, container);
                    })
                ).then(function (containerSizes) {
                    resolve(storageAccount);
                }).catch(function (err) {
                    resolve({});
                });;
            });
        };
        var getContainerAclSize = function (storageAccount) {
            return new Promise(function (resolve) {
                Promise.all(
                    storageAccount.containers.map(function (container) {
                        return getContainerAcl(storageAccount.name, storageAccount.keys.primaryKey, container);
                    })
                ).then(function (containerSizes) {
                    resolve(storageAccount);
                }).catch(function (err) {
                    resolve(storageAccount);
                });
            });
        };
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
    ,getSizeOfContainerWithPrefix: getSizeOfContainerWithPrefix
};
