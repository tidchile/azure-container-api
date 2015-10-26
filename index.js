'use strict';
var azu = require('azure');
var constants = require('./constants');

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

function extract(obj, key) {
  if (obj.hasOwnProperty(key)) {
    var value = obj[key];
    delete obj[key];
    return value;
  }
}

function getContentFromContainer(options) {
  return new Promise(function(resolve, reject) {
    options.querySize = options.querySize || 25;
    //options.delimiter = options.delimiter || '/';
    var storage = extract(options, 'storage');
    var prefix = extract(options, 'prefix');
    var continuationToken = extract(options, 'continuationToken');

    var blobSvc = azu.createBlobService(storage.account, storage.accessKey);
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
}

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
  }
  if (options.date) {
    var path = [];
    if (options.date.year) { path.push(options.date.year); }
    if (options.date.month) { path.push(options.date.month); }
    if (options.date.day) { path.push(options.date.day); }
    options.path = path.join('/');
  }
  return options;
}

module.exports = {
  getContentFromContainer: getContentFromContainer
};
