"use stritc";

var configutation  = {};

configutation.azure = {};

// azure storage credentials
configutation.storage = {};
configutation.storage.container = 'mamutcontainer';
configutation.storage.account = 'mamutstorage';
configutation.storage.accessKey = 'cl3YyX33ASFbU2u5VkDYdiuH6nXmuEKOEBhbid1RnrvkN5VxUcZp1mTpsTi7iG4CtKNxAbtKd5i5zFfMOnPFRw==';

configutation.management={
    tenant: 'baltazarpontetelefonica.onmicrosoft.com'//'carlosguerreromtelefonica.onmicrosoft.com'

};
// Credential from azure active directory
configutation.management.credentials =
{
    appId: '0c998e15-073f-4ace-bffb-01b1df94de80',//c7917a57-668c-4a92-b750-c91442eaf560',
    username: 'automation-cli@baltazarpontetelefonica.onmicrosoft.com',//'service@carlosguerreromtelefonica.onmicrosoft.com',
    password: 'Gavilan0##'
};

module.exports =  configutation;
