"use strict";

var azureCommon = require('azure-common');

var WebResource = azureCommon.WebResource,
    xml = azureCommon.xml2js,
    js2xml = azureCommon.js2xml;

/*
 * This function is for injection on `SubscriptionOperations` object,
 * to give the functionality of search one subscription.
 * And `SubscriptionOperations` is used by `SubscriptionClient`
 *
 * example SubscriptionClientObj.subscriptions.<NAME_FUNCTION> = getSubscription or
 *         SubscriptionClientObj.subscriptions.<NAME_FUNCTION> = alias_to_getSubscription
 *
 * */
var getSubscription = function(subscriptionId, callback) {
    if (callback === null || callback === undefined) {
        throw new Error('callback cannot be null.');
    }
    // Validate
    if (subscriptionId === null || subscriptionId === undefined) {
        return callback(new Error('subscriptionId cannot be null.'));
    }

    // Tracing

    // Construct URL
    var url2 = '';
    url2 = url2 + '/';
    url2 = url2 + encodeURIComponent(subscriptionId);
    var queryParameters = [];
    //queryParameters.push('api-version=2014-04-01-preview');
    if (queryParameters.length > 0) {
        url2 = url2 + '?' + queryParameters.join('&');
    }
    var baseUrl = this.client.baseUri;
    // Trim '/' character from the end of baseUrl and beginning of url.
    if (baseUrl[baseUrl.length - 1] === '/') {
        baseUrl = baseUrl.substring(0, (baseUrl.length - 1) + 0);
    }
    if (url2[0] === '/') {
        url2 = url2.substring(1);
    }
    url2 = baseUrl + '/' + url2;
    url2 = url2.replace(' ', '%20');

    // Create HTTP transport objects
    var httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.headers = {};
    httpRequest.url = url2;

    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/xml;charset=utf-8';
    httpRequest.headers['x-ms-version'] = '2013-08-01';

    // Send Request
    return this.client.pipeline(httpRequest, function(err, response, body) {
        if (err !== null && err !== undefined) {
            return callback(err);
        }
        var statusCode = response.statusCode;
        if (statusCode !== 200) {
            var error = new Error(body);
            error.statusCode = response.statusCode;
            return callback(error);
        }

        // Create Result
        var result = null;
        // Deserialize Response
        if (statusCode === 200) {
            var responseContent = body;
            result = { subscription: {} };


            var options = {};
            options.trim = false;
            options.strict = false;
            xml.parseString(responseContent, options, function(err2, responseDoc) {
                if (err2 !== null && err2 !== undefined) {
                    return callback(err2);
                }
                var subscriptionsElement = js2xml.getElement(responseDoc, responseDoc, 'SUBSCRIPTION', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                var subscriptionInstance = {};
                result.subscription = subscriptionInstance;
                var subscriptionIDElement = js2xml.getElement(responseDoc, subscriptionsElement, 'SUBSCRIPTIONID', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (subscriptionIDElement !== null && subscriptionIDElement !== undefined) {
                    var subscriptionIDInstance = subscriptionIDElement;
                    subscriptionInstance.subscriptionId = subscriptionIDInstance;
                }

                var subscriptionNameElement = js2xml.getElement(responseDoc, subscriptionsElement, 'SUBSCRIPTIONNAME', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (subscriptionNameElement !== null && subscriptionNameElement !== undefined) {
                    var subscriptionNameInstance = subscriptionNameElement;
                    subscriptionInstance.subscriptionName = subscriptionNameInstance;
                }

                var subscriptionStatusElement = js2xml.getElement(responseDoc, subscriptionsElement, 'SUBSCRIPTIONSTATUS', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (subscriptionStatusElement !== null && subscriptionStatusElement !== undefined && subscriptionStatusElement.length !== 0) {
                    var subscriptionStatusInstance = subscriptionStatusElement;
                    subscriptionInstance.subscriptionStatus = subscriptionStatusInstance;
                }

                var accountAdminLiveEmailIdElement = js2xml.getElement(responseDoc, subscriptionsElement, 'ACCOUNTADMINLIVEEMAILID', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (accountAdminLiveEmailIdElement !== null && accountAdminLiveEmailIdElement !== undefined) {
                    var accountAdminLiveEmailIdInstance = accountAdminLiveEmailIdElement;
                    subscriptionInstance.accountAdminLiveEmailId = accountAdminLiveEmailIdInstance;
                }

                var serviceAdminLiveEmailIdElement = js2xml.getElement(responseDoc, subscriptionsElement, 'SERVICEADMINLIVEEMAILID', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (serviceAdminLiveEmailIdElement !== null && serviceAdminLiveEmailIdElement !== undefined) {
                    var serviceAdminLiveEmailIdInstance = serviceAdminLiveEmailIdElement;
                    subscriptionInstance.serviceAdminLiveEmailId = serviceAdminLiveEmailIdInstance;
                }

                var maxCoreCountElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXCORECOUNT', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxCoreCountElement !== null && maxCoreCountElement !== undefined && maxCoreCountElement.length !== 0) {
                    var maxCoreCountInstance = parseInt(maxCoreCountElement, 10);
                    subscriptionInstance.maximumCoreCount = maxCoreCountInstance;
                }

                var maxStorageAccountsElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXSTORAGEACCOUNTS', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxStorageAccountsElement !== null && maxStorageAccountsElement !== undefined && maxStorageAccountsElement.length !== 0) {
                    var maxStorageAccountsInstance = parseInt(maxStorageAccountsElement, 10);
                    subscriptionInstance.maximumStorageAccounts = maxStorageAccountsInstance;
                }

                var maxHostedServicesElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXHOSTEDSERVICES', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxHostedServicesElement !== null && maxHostedServicesElement !== undefined && maxHostedServicesElement.length !== 0) {
                    var maxHostedServicesInstance = parseInt(maxHostedServicesElement, 10);
                    subscriptionInstance.maximumHostedServices = maxHostedServicesInstance;
                }

                var currentCoreCountElement = js2xml.getElement(responseDoc, subscriptionsElement, 'CURRENTCORECOUNT', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (currentCoreCountElement !== null && currentCoreCountElement !== undefined && currentCoreCountElement.length !== 0) {
                    var currentCoreCountInstance = parseInt(currentCoreCountElement, 10);
                    subscriptionInstance.currentCoreCount = currentCoreCountInstance;
                }

                var currentStorageAccountsElement = js2xml.getElement(responseDoc, subscriptionsElement, 'CURRENTSTORAGEACCOUNTS', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (currentStorageAccountsElement !== null && currentStorageAccountsElement !== undefined && currentStorageAccountsElement.length !== 0) {
                    var currentStorageAccountsInstance = parseInt(currentStorageAccountsElement, 10);
                    subscriptionInstance.currentStorageAccounts = currentStorageAccountsInstance;
                }

                var currentHostedServicesElement = js2xml.getElement(responseDoc, subscriptionsElement, 'CURRENTHOSTEDSERVICES', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (currentHostedServicesElement !== null && currentHostedServicesElement !== undefined && currentHostedServicesElement.length !== 0) {
                    var currentHostedServicesInstance = parseInt(currentHostedServicesElement, 10);
                    subscriptionInstance.currentHostedServices = currentHostedServicesInstance;
                }

                var maxVirtualNetworkSitesElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXVIRTUALNETWORKSITES', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxVirtualNetworkSitesElement !== null && maxVirtualNetworkSitesElement !== undefined && maxVirtualNetworkSitesElement.length !== 0) {
                    var maxVirtualNetworkSitesInstance = parseInt(maxVirtualNetworkSitesElement, 10);
                    subscriptionInstance.maximumVirtualNetworkSites = maxVirtualNetworkSitesInstance;
                }

                var maxLocalNetworkSitesElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXLOCALNETWORKSITES', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxLocalNetworkSitesElement !== null && maxLocalNetworkSitesElement !== undefined && maxLocalNetworkSitesElement.length !== 0) {
                    var maxLocalNetworkSitesInstance = parseInt(maxLocalNetworkSitesElement, 10);
                    subscriptionInstance.maximumLocalNetworkSites = maxLocalNetworkSitesInstance;
                }

                var maxDnsServersElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXDNSSERVERS', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxDnsServersElement !== null && maxDnsServersElement !== undefined && maxDnsServersElement.length !== 0) {
                    var maxDnsServersInstance = parseInt(maxDnsServersElement, 10);
                    subscriptionInstance.maximumDnsServers = maxDnsServersInstance;
                }

                var maxExtraVIPCountElement = js2xml.getElement(responseDoc, subscriptionsElement, 'MAXEXTRAVIPCOUNT', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (maxExtraVIPCountElement !== null && maxExtraVIPCountElement !== undefined && maxExtraVIPCountElement.length !== 0) {
                    var maxExtraVIPCountInstance = parseInt(maxExtraVIPCountElement, 10);
                    subscriptionInstance.maximumExtraVirtualIPCount = maxExtraVIPCountInstance;
                }

                var aADTenantIDElement = js2xml.getElement(responseDoc, subscriptionsElement, 'AADTENANTID', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (aADTenantIDElement !== null && aADTenantIDElement !== undefined) {
                    var aADTenantIDInstance = aADTenantIDElement;
                    subscriptionInstance.activeDirectoryTenantId = aADTenantIDInstance;
                }

                var createdTimeElement = js2xml.getElement(responseDoc, subscriptionsElement, 'CREATEDTIME', 'HTTP://SCHEMAS.MICROSOFT.COM/WINDOWSAZURE');
                if (createdTimeElement !== null && createdTimeElement !== undefined && createdTimeElement.length !== 0) {
                    var createdTimeInstance = new Date(createdTimeElement);
                    subscriptionInstance.created = createdTimeInstance;
                }

            });

        }
        result.statusCode = statusCode;
        result.requestId = response.headers['x-ms-request-id'];

        return callback(null, result);
    });
};


var createClusterPayloadLinux = function createClusterPayloadLinux(clusterName, storageAccountName, storageAccountKey, storageContainer, dataNodeCount, headNodeSize, dataNodeSize, location, userName, password, sshUserName, sshPassword, subscriptionId) {
    var payload = `
    <Resource xmlns="http://schemas.microsoft.com/windowsazure">
      <SchemaVersion>1.0</SchemaVersion>
      <IntrinsicSettings>
        <IaasCluster xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">
          <ApiVersion xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">1.0</ApiVersion>
          <DeploymentDocuments xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">
            <a:KeyValueOfstringstring>
              <a:Key></a:Key>
              <a:Value>{
                "blueprint": "hadoop",
                "default_password": "${ password }",
                "configurations": [
                    {
                        "core-site":{
                            "fs.defaultFS": "wasb://${ storageContainer }@${ storageAccountName }",
                            "fs.azure.account.key.+${ storageAccountName }": "+${ storageAccountKey }"
                        }
                    }
                ],
                "host_groups": [
                    { "name": "headnode" },
                    { "name": "workernode" }
                ]
                }</a:Value>
              </a:KeyValueOfstringstring><a:KeyValueOfstringstring>
                <a:Key>CsmDocument</a:Key><a:Value>{
                    "location": "${ location }",
                    "resources": [
                        {
                        "name": "gateway",
                            "type": "VirtualMachineGroup",
                            "location": "${ location }",
                            "properties": {
                                "instanceCount": 1,
                                "dnsName": "${ clusterName }",
                                "osProfile": {
                                    "computerNamePattern": "gateway\#\#\#\#",
                                    "windowsOperatingSystemProfile": {
                                        "adminUsername": "${ userName }",
                                        "adminPassword": "${ password }",
                                        "customData": "",
                                        "storedCertificateSettingsProfile": []
                                    }
                                },
                                "hardwareProfile": {
                                    "vmSize": "Medium"
                                },
                                "storageProfile": {
                                    "osDisk": {
                                        "name": "Disk1",
                                        "vhdUri": "",
                                        "sourceImageName": ""
                                    }
                                },
                                "networkProfile": {
                                    "networkInterfaces": [
                                        {
                                            "name": "NIC1",
                                            "properties": {
                                                "virtualNetwork": {
                                                    "id": ""
                                                },
                                                "ipConfigurations": [
                                                    {
                                                        "name": "IpConfigName1",
                                                        "subnet": {
                                                            "id": ""
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "inputEndpoints": [
                                        {
                                            "name": "HTTPS",
                                            "protocol": "TCP",
                                            "localPort": 443,
                                            "publicPort": 443
                                        }
                                    ]
                                },
                                "certificates": [],
                                "provisionGuestAgent": true
                            }
                        },
                        {
                            "name": "headnode",
                            "type": "VirtualMachineGroup",
                            "location": "${ location }",
                            "properties": {
                                "instanceCount": 1,
                                "dnsName": "${ clusterName }-ssh",
                                "osProfile": {
                                    "computerNamePattern": "headnode####",
                                    "linuxOperatingSystemProfile": {
                                        "DisableSshPasswordAuthentication": false,
                                        "username": "${ sshUserName }",
                                        "userPassword": "${ sshPassword }",
                                        "sshProfile": {
                                            "publicKeys": [],
                                            "sshKeyPairs": []
                                        },
                                        "customData": ""
                                    }
                                },
                                "hardwareProfile": {
                                    "vmSize": "${ headNodeSize }"
                                },
                                "storageProfile": {
                                    "osDisk": {
                                        "name": "Disk1",
                                        "vhdUri": "",
                                        "sourceImageName": ""
                                    }
                                },
                                "networkProfile": {
                                    "networkInterfaces": [
                                        {
                                            "name": "NIC1",
                                            "properties": {
                                                "virtualNetwork": {
                                                    "id": ""
                                                },
                                                "ipConfigurations": [
                                                    {
                                                        "name": "IpConfigName1",
                                                        "subnet": {
                                                            "id": ""
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "inputEndpoints": [
                                        {
                                            "name": "SSH",
                                            "protocol": "TCP",
                                            "localPort": 22,
                                            "publicPort": 22
                                        }
                                    ]
                                },
                                "certificates": [],
                                "vmExtensions": [
                                    {
                                        "referenceName": "OSPatchingForLinux",
                                        "publisher": "Microsoft.OSTCExtensions",
                                        "name": "OSPatchingForLinux",
                                        "version": "1.0",
                                        "resourceExtensionParameterValues": [
                                            { 
                                                "Key" : "OSPatchingForLinuxPrivateConfigParameter",
                                                "Value" : "{\\"startTime\\" : \\"03:00\\", \\"rebootAfterPatch\\" : \\"Required\\", \\"category\\": \\"Important\\"}",
                                                "Type" : "Private"
                                            }
                                        ]
                                    }
                                ],
                                "provisionGuestAgent": true
                            }
                        },
                        {
                            "name": "workernode",
                            "type": "VirtualMachineGroup",
                            "location": "${ location }",
                            "properties": {
                                "instanceCount": ${ dataNodeCount },
                                "osProfile": {
                                    "computerNamePattern": "workernode####",
                                    "linuxOperatingSystemProfile": {
                                        "DisableSshPasswordAuthentication": false,
                                        "username": "${ sshUserName }",
                                        "userPassword": "${ sshPassword }",
                                        "sshProfile": {
                                            "publicKeys": [],
                                            "sshKeyPairs": []
                                        },
                                        "customData": ""
                                    }
                                },
                                "hardwareProfile": {
                                    "vmSize": "${ dataNodeSize }"
                                },
                                "storageProfile": {
                                    "osDisk": {
                                        "name": "Disk1",
                                        "vhdUri": "",
                                        "sourceImageName": ""
                                    }
                                },
                                "networkProfile": {
                                    "networkInterfaces": [
                                        {
                                            "name": "NIC1",
                                            "properties": {
                                                "virtualNetwork": {
                                                    "id": ""
                                                },
                                                "ipConfigurations": [
                                                    {
                                                        "name": "IpConfigName1",
                                                        "subnet": {
                                                            "id": ""
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ],
                                    "inputEndpoints": [
                                    ]
                                },
                                "certificates": [],
                                "vmExtensions": [
                                    {
                                        "referenceName": "OSPatchingForLinux",
                                        "publisher": "Microsoft.OSTCExtensions",
                                        "name": "OSPatchingForLinux",
                                        "version": "1.0",
                                        "resourceExtensionParameterValues": [
                                            { 
                                                "Key" : "OSPatchingForLinuxPrivateConfigParameter",
                                                "Value" : "{\\"startTime\\" : \\"03:00\\", \\"rebootAfterPatch\\" : \\"Required\\", \\"category\\": \\"Important\\"}",
                                                "Type" : "Private"
                                             }
                                         ]
                                     }
                                 ],
                                 "provisionGuestAgent": true
                             }
                         },
                         {
                             "name": "",
                             "type": "VirtualNetwork",
                             "location": "${ location }",
                             "properties": {
                                 "addressSpace": {
                                     "addressPrefixes": [
                                         "10.0.0.0/20"
                                     ]
                                 },
                                 "subnets": [
                                     {
                                         "name": "",
                                         "properties": {
                                             "addressPrefix": "10.0.0.0/20"
                                         }
                                     }
                                 ]
                             }
                         }
                     ]
              }</a:Value>
            </a:KeyValueOfstringstring>
          </DeploymentDocuments>
          <HdiVersion xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">3.2</HdiVersion>
          <Id xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">${ clusterName }</Id>
          <Location xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">${ location }</Location>
          <UserSubscriptionId xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">${ subscriptionId }</UserSubscriptionId>
          <UserTags xmlns:a="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns="http://schemas.microsoft.com/hdinsight/2014/05/management">
            <a:KeyValueOfstringstring>
              <a:Key>Client</a:Key>
              <a:Value>HDInsight xplat SDK 1.0.0.0</a:Value>
            </a:KeyValueOfstringstring>
          </UserTags>
        </IaasCluster>
      </IntrinsicSettings>
    </Resource>`;
    return payload.replace( /\s\s+/g, ' ' );
    
};

module.exports = {
    getSubscription : getSubscription
    ,createClusterPayloadLinux: createClusterPayloadLinux
};
