var util = require('util')
    , azu = require('azure')
    , cfg = require('./config')
    , exports = module.exports;

/* GET container content listing.

 return { isSuccessful: true|false
 err: ,
 entries: [] of
 {   name: 'xxxx',
 properties:
 { 'last-modified': 'Thu, 10 Sep 2015 21:03:26 GMT',
 etag: '0x8D2BA2345B07FCF',
 'content-length': # bytes,
 'content-type': 'application/octet-stream',
 'content-encoding':,
 'content-language':,
 'content-md5':,
 'cache-control':,
 'content-disposition':,
 blobtype:,
 leasestatus: ,
 leasestate:
 }
 }
 }
 properties reference
 https://msdn.microsoft.com/en-us/library/azure/dd179394.aspx
 */
var getContentFromContainer = function(container, prefix, continuationToken, options, callBack){

    if (typeof callBack !== 'function') {
        throw new Error('Parameter callBack for function getContentFromContainer should be a function: '+ arguments );
    }

    var blobSvc = azu.createBlobService(cfg.storage.account, cfg.storage.accessKey)
        , blobs = [];

    var aggregateBlobs = function(err, result, response) {
        if (err){
            callBack(err, null, null);
        }else{
            blobs = blobs.concat(result.entries);
            var isComplete = (options && options.maxResults && (blobs.length >= options.maxResults));
            if (null !== result.continuationToken && !isComplete) {
                blobSvc.listBlobsSegmented(
                    CONTAINER,
                    result.continuationToken,
                    options,
                    function (error, blockListResult, response) { aggregateBlobs(error, blockListResult, response); });
            }else{
                callBack(null, blobs, result.continuationToken);
            }
        }
        return;
    }

    blobSvc.listBlobsSegmentedWithPrefix(
        container,
        prefix,
        continuationToken,
        options,
        function(err, result, response) {
            aggregateBlobs(err, result, response); }
    );

    return;
}

exports.getContentFromContainer = getContentFromContainer;
