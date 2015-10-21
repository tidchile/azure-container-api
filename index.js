'use strict';
var azu = require('azure')
    , constants = require('./constants')
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
var getContentFromContainer = function(storage, prefix, continuationToken, options, callback){

    if (typeof callback !== 'function') {
        throw new Error("Parameter `callback' for function getContentFromContainer should be a function:"  + arguments);
    }
    options.querySize = options.querySize || 25;
    //options.delimiter = options.delimiter || '/';

    var blobSvc = azu.createBlobService(storage.account, storage.accessKey)
        , blobs = [];

    var aggregateBlobs = function(err, result, response) {
        if (err){
            callback(err, null, null);
        }else{
            blobs = blobs.concat(result.entries);
            var isComplete = (options && options.maxResults && (blobs.length >= options.maxResults));
            if (null !== result.continuationToken && !isComplete) {
                blobSvc.listBlobsSegmentedWithPrefix(storage.container, prefix, result.continuationToken, options,
                    aggregateBlobs) ;
            }else{
                callback(null, blobs, result.continuationToken);
            }
        }
        //return;
    };

    blobSvc.listBlobsSegmentedWithPrefix(storage.container, prefix, continuationToken, options, aggregateBlobs);

    //return;
};


var normalizeArgs = function(option, callback){

    var sep = '/';
    if (null==option) option  = {};
    option.path='';
    if (null!=option.date){
        if (null != option.date.year) option.path += option.date.year + sep;
        if (null != option.date.month) option.path += option.date.month + sep;
        if (null != option.date.day) option.path += option.date.day + sep;
    }
    callback(option);
};


var getContentFromCdrData = function(storage, continuationToken, options, callback ) {
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CDR_DATA + options.path, continuationToken, options, callback);
};

var getContentFromCdrSms = function(storage, continuationToken, options, callback ) {
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CDR_SMS + options.path, continuationToken, options, callback);
};

var getContentFromCdrMms = function(storage, continuationToken, options, callback ) {
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CDR_MMS + options.path, continuationToken, options, callback);
};

var getContentFromCdrVoice = function(storage, continuationToken, options, callback ) {
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CDR_VOICE + options.path, continuationToken, options, callback);
};


var getContentFromTransantiago = function(storage, continuationToken, options, callback ) {
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.TRANSANTIAGO + options.path.replace(/\//g,''),
        continuationToken, options, callback);
};

var getContentFromClimaTemperatura = function(storage, continuationToken, options, callback ) {
    if (null!=option &&  null!=option.date && null!=option.date.day)
        option.date.day=null;
    normalizeArgs(options, function (o){ options = o; });

    getContentFromContainer(storage, constants.Prefix.DMC_TEMPERATURA + options.path, continuationToken, options, callback);
};

var getContentFromClimaAguaCaida = function(storage, continuationToken, options, callback ) {
    if (null!=option &&  null!=option.date && null!=option.date.day)
        option.date.day=null;
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.DMC_AGUACAIDA + options.path, continuationToken, options, callback);
};

var getContentFromClimaRadiacion = function(storage, continuationToken, options, callback ) {
    if (null!=option &&  null!=option.date && null!=option.date.day)
        option.date.day=null;
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.DMC_RADIACION + options.path, continuationToken, options, callback);
};

var getContentFromCLimaViento = function(storage, continuationToken, options, callback ) {
    if (null!=option &&  null!=option.date && null!=option.date.day)
        option.date.day=null;
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.DMC_VIENTO + options.path, continuationToken, options, callback);
};

var getContentFromClimaPresionHumedad = function(storage, continuationToken, options, callback ) {
    if (null!=option &&  null!=option.date && null!=option.date.day)
        option.date.day=null;
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.DMC_PRESION_HUMEDAD + options.path, continuationToken, options, callback);
};

var getContentFromCellLte = function(storage, continuationToken, options, callback ) {
    // TODO check final path
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CELL_LTE + options.path, continuationToken, options, callback);
};

var getContentFromCellGsm = function(storage, continuationToken, options, callback ) {
    // TODO check final path
    normalizeArgs(options, function (o){ options = o; });
    getContentFromContainer(storage, constants.Prefix.CELL_GSM + options.path, continuationToken, options, callback);
};




exports.getContentFromContainer = getContentFromContainer;
exports.getContentFromCdrData = getContentFromCdrData;
exports.getContentFromCdrSms = getContentFromCdrSms;
exports.getContentFromCdrMms = getContentFromCdrMms;
exports.getContentFromCdrVoice = getContentFromCdrVoice;
exports.getContentFromTransantiago = getContentFromTransantiago;

exports.getContentFromClimaTemperatura = getContentFromClimaTemperatura;
exports.getContentFromClimaAguaCaida = getContentFromClimaAguaCaida;
exports.getContentFromClimaRadiacion = getContentFromClimaRadiacion;
exports.getContentFromCLimaViento = getContentFromCLimaViento;
exports.getContentFromClimaPresionHumedad = getContentFromClimaPresionHumedad;

exports.getContentFromCellLte = getContentFromCellLte;
exports.getContentFromCellGsm = getContentFromCellGsm;
