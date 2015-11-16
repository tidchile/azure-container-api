var config = {};
config.azure={};

// azure storage credentials
config.storage = {};
config.storage.container = 'test';
config.storage.account = 'azure-account-name-here';
config.storage.accessKey = 'azure-storage-access-key-here';

config.param={
    tenant : '<TENANT>',
    authorityHostUrl : 'https://login.windows.net',
    clientId : '<CLIENT_ID>',
    username : '<USERNAME>',
    password : '<PASSWORD>',
    cert: 'cert.pem',
    key: 'key.pem'

}
module.exports = config;
