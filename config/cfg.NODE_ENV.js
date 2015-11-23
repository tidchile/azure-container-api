"use stritc";

var configutation  = {};

configutation.azure = {};

// azure storage credentials
configutation.storage = {};
configutation.storage.container = '<test>';
configutation.storage.account = '<azure-account-name-here>';
configutation.storage.accessKey = '<azure-storage-access-key-here>';

configutation.management={
    tenant: '<tenant name> or <tenant id>'

};
// Credential from azure active directory
configutation.management.credentials =
{
    appId: '<CLIENT_ID>',
    username: '<USERNAME>',
    password: '<PASSWORD>'
};

module.exports = {

    config: configutation

};
