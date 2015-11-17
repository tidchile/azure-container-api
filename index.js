'use strict';
var azu = require('azure');
var constants = require('./constants');
var cfg = require('../config/');
var parameters = cfg.param;
var AdalNode = require('adal-node');
var azure = require('azure');

var authorityUrl = parameters.authorityHostUrl + '/' + parameters.tenant;
var ctx = new  AdalNode.AuthenticationContext(authorityUrl),
    SERVICE_MANAGEMENT_URL ='https://management.core.windows.net/',
    RESOURCE_MANAGEMENT_URL = 'https://management.azure.com/';
;

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
/*
 TokenCloudCredentials
{
  subscriptionId: 'd837e441-5fc9-4d50-a01b-999999999999',
  credentials:
    { subscriptionId: 'd837e441-5fc9-4d50-a01b-999999999',
      token: '<TOKEN>',
      authorizationScheme: 'Bearer'
     }
}
*/
var getTokenCloudCredentials = function(subscriptionId, resource){
  return new Promise(function(resolve, reject) {

    ctx.acquireTokenWithUsernamePassword(resource,parameters.username, parameters.password, parameters.appId, function(err, tokenResponse) {
      if (err) {
        console.error('Oops, well that did not work: ' + err.stack);
        reject(Error(err.message));
      } else {
        var credential = new azure.TokenCloudCredentials({subscriptionId: subscriptionId,token:tokenResponse.accessToken});
        resolve(credential);
      }
    });
  });
};

/*
{ roleSizes:
    [ { name: 'A10',
      label: 'A10 (8 cores, 57344 MB)',
      cores: 8,
      memoryInMb: 57344,
      supportedByWebWorkerRoles: true,
      supportedByVirtualMachines: true,
      maxDataDiskCount: 16,
      webWorkerResourceDiskSizeInMb: 1861268,
      virtualMachineResourceDiskSizeInMb: 391828 },
    ... ],
  statusCode: 200,
  requestId: '84066f487e8638c5acd093232f4e4c64'
 }
*/

var getRoleSize = function(subscriptionId){
  return new Promise(function(resolve, reject) {

    getTokenCloudCredentials(subscriptionId, SERVICE_MANAGEMENT_URL).then(function(credential) {
      var mgmClt = azure.createManagementClient(credential);
      mgmClt.roleSizes.list(function (err, result) {
        if (err) {
          console.error('Oops, well that did not work: ' + err.stack);
          reject(Error(err));
        } else {
          resolve(result);
        }
      });
    }).catch(function(e) {
      debug('Oops, well that did not work: ' + e);
      reject(Error(e));
    });

  });
};

/*
{ locations:
    [ { availableServices: [Object],
      name: 'East US',
      displayName: 'East US',
      storageCapabilities: [Object],
      computeCapabilities: [Object] },
    ... ],
  statusCode: 200,
  requestId: 'ea2ae4557dc239d5995117f7e4734f1f'
}
*/


var getLocations = function(subscriptionId){
  return new Promise(function(resolve, reject) {

    getTokenCloudCredentials(subscriptionId, SERVICE_MANAGEMENT_URL).then(function(credential) {
      var mgmClt = azure.createManagementClient(credential);
      mgmClt.locations.list(function (err, result) {
        if (err) {
          console.error('Oops, well that did not work: ' + err.stack);
          reject(Error(err));
        } else {
          resolve(result);
        }
      });
    }).catch(function(e) {
      debug('Oops, well that did not work: ' + e);
      reject(Error(e));
    });

  });
};

/*
 { resources:
 [ { tags: {},
    id: '/subscriptions/d837e441-5fc9-4d50-a01b-999999999999/resourceGroups/Default-Storage-EastUS/providers/Microsoft.HDInsight/clusters/citiesresearch',
    name: 'citiesresearch',
    type: 'Microsoft.HDInsight/clusters',
    location: 'eastus' },
    ... ],
 statusCode: 200,
 requestId: 'f011728e-813a-43e8-9478-f180cedbfb9c' }
 */
// get this module from cache
var getClusterList = function(subscriptionId){
  return new Promise(function(resolve, reject) {
    getTokenCloudCredentials(subscriptionId, RESOURCE_MANAGEMENT_URL).then(function(credential) {
      var mgmClt = azure.createResourceManagementClient(credential);
      mgmClt.resources.list({resourceType:'Microsoft.HDInsight/clusters'},function (err, result) {
        if (err) {
          console.error('Oops, well that did not work: ' + err.stack);
          reject(Error(err));
        } else {
          resolve(result);
        }
      });
    }).catch(function(e) {
      debug('Oops, well that did not work: ' + e);
      reject(Error(e));
    });
  });
};



module.exports = {
  getContentFromContainer: getContentFromContainer,
  getTokenCloudCredentials : getTokenCloudCredentials,
  getRoleSize : getRoleSize,
  getLocations : getLocations,
  getClusterList : getClusterList
};
