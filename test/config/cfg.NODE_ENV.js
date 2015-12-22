var configuration  = {};

configuration.azure = {};

// azure storage credentials
configuration.storage = {};
configuration.storage.container = '<test>';
configuration.storage.account = '<azure-account-name-here>';
configuration.storage.accessKey = '<azure-storage-access-key-here>';

configuration.management = {
    tenant: '<tenant name> or <tenant id>'

};
// Credential from azure active directory
configuration.management.credentials =
{
    appId: '<CLIENT_ID>',
    username: '<USERNAME>',
    password: '<PASSWORD>'
};

module.exports = {

    config: configuration

};
