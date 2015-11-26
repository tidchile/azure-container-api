/**
 * Created by dev on 11/25/15.
 */
'use strict';

var cfg  = {};

cfg.azure = {};

// azure storage credentials
cfg.storage = {};
cfg.storage.container = 'mamutcontainer';
cfg.storage.account = 'mamutstorage';
cfg.storage.accessKey = 'MdMXhEaF4rubDCRMD7jqJPIlbIm6HeVnR7jDK7TFT0yt79IXHoOtm/N/VXkzamrP0KZtq9YfwxmAGex4puG3sQ==';

cfg.management={
    tenant: 'baltazarpontetelefonica.onmicrosoft.com'

};
// Credential from azure active directory
cfg.management.credentials =
{
    appId: '0c998e15-073f-4ace-bffb-01b1df94de80',
    username: 'automation-cli@baltazarpontetelefonica.onmicrosoft.com',
    password: 'Paloma0!!'
};


var test = require('../lib/entry');
var subscriptionId = 'd837e441-5fc9-4d50-a01b-8e8690ec0a96';


var credential;
console.log('getTokenCloudCredentials');

test.getServiceTokenCloudCredentials({
    subscriptionId: subscriptionId,
    management: cfg.management
}).then(function(credentialResult) {
    console.log('getTokenCloudCredentials result:', credentialResult );
    credential = credentialResult;
    return test.getSize(credential,'mamutstorage');
}).then(function(result) {
    console.log('getSize result:' );
    console.log(JSON.stringify(result,null, '\t'));
}).catch(function(e) {
    console.log(e.stack);
});
