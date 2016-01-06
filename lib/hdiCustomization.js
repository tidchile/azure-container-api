// based on https://github.com/Azure/azure-xplat-cli/blob/dev/lib/commands/arm/hdinsight/hdiCustomization._js
//
// Copyright (c) Microsoft and contributors.  All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//


var util = require('util');
var utils = require('./util');
var HDIConstants = require('./hdiConstants');
var HdiUtils = require('./hdiUtils');
var azureArmHDInsight = require('azure-arm-hdinsight');
var $ = function(a){return a;};



var getHeadNodeSize = function(clusterCreateParameters) {
    var headNodeSize;
    if (clusterCreateParameters.headNodeSize !== null && clusterCreateParameters.headNodeSize !== undefined) {
      headNodeSize = clusterCreateParameters.headNodeSize;
    } else {
      headNodeSize = (utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Hadoop') || utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Spark')) ? 'Standard_D12' : 'Large';
    }
    return headNodeSize;
}; 

var getWorkerNodeSize = function(clusterCreateParameters) {
    var workerNodeSize;
    if (clusterCreateParameters.workerNodeSize !== null && clusterCreateParameters.workerNodeSize !== undefined) {
        workerNodeSize = clusterCreateParameters.workerNodeSize;
    } else {
        workerNodeSize = utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Hadoop') || utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Spark') ? 'Standard_D12' : 'Standard_D3';
    }
    return workerNodeSize;
};

var getRoleCollection = function(clusterCreateParameters) {
    //OS Profile
    var osProfile = {};
    if (utils.ignoreCaseEquals(clusterCreateParameters.osType, 'Windows')) {
      var rdpSettingsParams = {};
      if (!utils.stringIsNullOrEmpty(clusterCreateParameters.rdpUserName)) {
        rdpSettingsParams = {
          userName: clusterCreateParameters.rdpUserName,
          password: clusterCreateParameters.rdpPassword,
          expiryDate: clusterCreateParameters.rdpAccessExpiry
        };
      }
      osProfile = {
        windowsOperatingSystemProfile:
        {
          rdpSettings: rdpSettingsParams
        }
      };
    } else if (utils.ignoreCaseEquals(clusterCreateParameters.osType, 'Linux')) {
      var sshPublicKeys = [];
      if (!utils.stringIsNullOrEmpty(clusterCreateParameters.sshPublicKey)) {
        var sshPublicKey = {
          certificateData: clusterCreateParameters.sshPublicKey
        };
        sshPublicKeys.push(sshPublicKey);
      }

      var sshProfile = {};
      if (sshPublicKeys.length > 0) {
        sshProfile =
        {
          sshPublicKeys: sshPublicKeys
        };
      } else {
        sshProfile = null;
      }

      osProfile = {
        linuxOperatingSystemProfile:
        {
          userName: clusterCreateParameters.sshUserName,
          password: clusterCreateParameters.sshPassword,
          sshProfile: sshProfile
        }
      };
    }

    //VNet Profile
    var vnetProfile = {};
    if (!utils.stringIsNullOrEmpty(clusterCreateParameters.virtualNetworkId)) {
      vnetProfile.id = clusterCreateParameters.virtualNetworkId;
    }
    if (!utils.stringIsNullOrEmpty(clusterCreateParameters.subnetName)) {
      vnetProfile.subnetName = clusterCreateParameters.subnetName;
    }
    if (utils.stringIsNullOrEmpty(vnetProfile.Id) && utils.stringIsNullOrEmpty(vnetProfile.subnetName)) {
      vnetProfile = null;
    }

    var workernodeactions = [];
    var headnodeactions = [];
    var zookeepernodeactions = [];

    //Script Actions
    if (clusterCreateParameters.scriptActions !== null && clusterCreateParameters.scriptActions !== undefined) {
      var scriptActionNodes = Object.keys(clusterCreateParameters.scriptActions);
      scriptActionNodes.forEach(function(nodeType) {
        var value = clusterCreateParameters.scriptActions[nodeType];
        if (utils.ignoreCaseEquals(nodeType, 'workernode')) {
          workernodeactions = value;
        } else if (utils.ignoreCaseEquals(nodeType, 'headnode')) {
          headnodeactions = value;
        } else if (utils.ignoreCaseEquals(nodeType, 'zookeepernode')) {
          zookeepernodeactions = value;
        }
      });
    }

    //Roles
    var roles = [];
    var headNodeSize = getHeadNodeSize(clusterCreateParameters);
    var headNode =
    {
      name: 'headnode',
      targetInstanceCount: 2,
      hardwareProfile: {
        vmSize: headNodeSize
      },
      osProfile: osProfile,
      virtualNetworkProfile: vnetProfile,
      scriptActions: headnodeactions
    };
    roles.push(headNode);

    var workerNodeSize = getWorkerNodeSize(clusterCreateParameters);
    var workerNode = {
      name: 'workernode',
      targetInstanceCount: clusterCreateParameters.clusterSizeInNodes,
      hardwareProfile: {
        vmSize: workerNodeSize
      },
      osProfile: osProfile,
      scriptActions: workernodeactions
    };
    roles.push(workerNode);

    if (utils.ignoreCaseEquals(clusterCreateParameters.osType, 'Windows')) {
      if (utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Hadoop') ||
        utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Spark')) {
        return roles;
      }
    }

    if (utils.ignoreCaseEquals(clusterCreateParameters.osType, 'Linux')) {
      if (utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Hadoop') ||
        utils.ignoreCaseEquals(clusterCreateParameters.clusterType, 'Spark')) {
        clusterCreateParameters.zookeeperNodeSize = 'Small';
      }
    }

    var zookeeperNodeSize;
    if (utils.stringIsNullOrEmpty(clusterCreateParameters.zookeeperNodeSize)) {
      zookeeperNodeSize = 'Medium';
    } else {
      zookeeperNodeSize = clusterCreateParameters.zookeeperNodeSize;
    }

    var zookeepernode = {
      name: 'zookeepernode',
      scriptActions: zookeepernodeactions,
      targetInstanceCount: 3,
      osProfile: osProfile,
      hardwareProfile: {
        vmSize: zookeeperNodeSize
      }
    };

    roles.push(zookeepernode);
    return roles;
  };
  
  var getMetastoreConfigIaas = function(metastore, metastoreType) {
    var connectionUrl =
      util.format($('jdbc:sqlserver://%s.database.windows.net;database=%s;encrypt=true;trustServerCertificate=true;create=false;loginTimeout=300;sendStringParametersAsUnicode=true;prepareSQL=0'),
        metastore.server, metastore.database);
    var configurations = [];
    if (utils.ignoreCaseEquals(metastoreType, HDIConstants.ConfigurationKey.HiveSite)) {
      var hiveSiteKey = HDIConstants.ConfigurationKey.HiveSite;
      var hiveConfigValue = [
        { 'javax.jdo.option.ConnectionURL': connectionUrl },
        { 'javax.jdo.option.ConnectionUserName': metastore.user },
        { 'javax.jdo.option.ConnectionPassword': metastore.password },
        { 'javax.jdo.option.ConnectionDriverName': 'com.microsoft.sqlserver.jdbc.SQLServerDriver' }
      ];
      HdiUtils.pushToConfig(hiveSiteKey, hiveConfigValue, configurations);

      var hiveEnvKey = HDIConstants.ConfigurationKey.HiveEnv;
      var hiveEnvValue = [
        { 'hive_database': 'Existing MSSQL Server database with SQL authentication' },
        { 'hive_database_name': metastore.database },
        { 'hive_database_type': 'mssql' },
        { 'hive_existing_mssql_server_database': metastore.database },
        { 'hive_existing_mssql_server_host': util.format($('%s.database.windows.net)'), metastore.Server) },
        { 'hive_hostname': util.format($('%s.database.windows.net)'), metastore.server) }
      ];
      HdiUtils.pushToConfig(hiveEnvKey, hiveEnvValue, configurations);

      return configurations;
    } else {
      var oozieSiteKey = HDIConstants.ConfigurationKey.OozieSite;
      var oozieSiteValue = [
        { 'oozie.service.JPAService.jdbc.url': connectionUrl },
        { 'oozie.service.JPAService.jdbc.username': metastore.user },
        { 'oozie.service.JPAService.jdbc.password': metastore.password },
        { 'oozie.service.JPAService.jdbc.driver': 'com.microsoft.sqlserver.jdbc.SQLServerDriver' },
        { 'oozie.db.schema.name': 'oozie' }
      ];
      HdiUtils.pushToConfig(oozieSiteKey, oozieSiteValue, configurations);

      var oozieEnvKey = HDIConstants.ConfigurationKey.OozieEnv;
      var oozieEnvValue = [
        { 'oozie_database': 'Existing MSSQL Server database with SQL authentication' },
        { 'oozie_database_type': 'mssql' },
        { 'oozie_existing_mssql_server_database': metastore.database },
        { 'oozie_existing_mssql_server_host': util.format($('%s.database.windows.net)', metastore.server)) },
        { 'oozie_hostname': util.format($('%s.database.windows.net)', metastore.server)) }
      ];
      HdiUtils.pushToConfig(oozieEnvKey, oozieEnvValue, configurations);
      return configurations;
    }
  };

var getMetastoreConfigPaas = function(metastore, metastoreType) {
    var connectionUrl =
      util.format($('jdbc:sqlserver://%s.database.windows.net;database=%s;encrypt=true;trustServerCertificate=trsee;create=false;loginTimeout=300'),
        metastore.server, metastore.database);
    var username = util.format($('%s@%s'), metastore.user, metastore.server);
    var config = [
      { 'javax.jdo.option.ConnectionURL': connectionUrl },
      { 'javax.jdo.option.ConnectionUserName': username },
      { 'javax.jdo.option.ConnectionPassword': metastore.password }
    ];

    var configKey = '';
    if (utils.ignoreCaseEquals(metastoreType, 'hive')) {
      configKey = HDIConstants.ConfigurationKey.HiveSite;
    } else if (utils.ignoreCaseEquals(metastoreType, 'oozie')) {
      configKey = HDIConstants.ConfigurationKey.OozieSite;
    }
    var configs = {};
    configs[configKey] = config;
    return configs;
  };

var getMetastoreConfig = function(metastore, osType, metastoreType) {
    if (utils.ignoreCaseEquals(osType, 'Windows')) {
      return getMetastoreConfigPaas(metastore, metastoreType);
    } else {
      return getMetastoreConfigIaas(metastore, metastoreType);
    }
  }
  
var getConfigurations = function(clusterName, clusterCreateParameters) {
    var configurations = clusterCreateParameters.configurations;
    if (configurations === undefined || configurations === null) {
      configurations = {};
    }

    //Core Config
    var coreConfig = configurations[HDIConstants.ConfigurationKey.CoreSite];
    if (coreConfig === null || coreConfig === undefined) {
      coreConfig = {};
    }

    var defaultFS = coreConfig['fs.defaultFS'];
    if (defaultFS === null || defaultFS === undefined) {
      var storageAccountNameKey = 'fs.defaultFS';
      if (clusterCreateParameters.version !== null && clusterCreateParameters.version === '2.1') {
        storageAccountNameKey = 'fs.default.name';
      }

      var container = utils.stringIsNullOrEmpty(clusterCreateParameters.defaultStorageContainer) ?
        clusterName : clusterCreateParameters.defaultStorageContainer;
      coreConfig[storageAccountNameKey] = util.format($('wasb://%s@%s'), container, clusterCreateParameters.defaultStorageAccountName);
    }

    var defaultStorageConfigKey = util.format($('fs.azure.account.key.%s'), clusterCreateParameters.defaultStorageAccountName);
    var defaultStorageAccount = coreConfig[defaultStorageConfigKey];
    if (defaultStorageAccount === null || defaultStorageAccount === undefined) {
      coreConfig[defaultStorageConfigKey] = clusterCreateParameters.defaultStorageAccountKey;
    }

    if (clusterCreateParameters.additionalStorageAccounts instanceof Array) {
      for (var i = 0; i < clusterCreateParameters.additionalStorageAccounts.length; i++) {
        var storageAccount = clusterCreateParameters.additionalStorageAccounts[i];
        var configKey = util.format($('fs.azure.account.key.%s'), storageAccount.key);
        var configValue = coreConfig[configKey];
        if (configValue === null || configValue === undefined) {
          coreConfig[configKey] = storageAccount.value;
        }
      }
    }

    configurations[HDIConstants.ConfigurationKey.CoreSite] = coreConfig;

    //Gateway Config
    var gatewayConfig = configurations[HDIConstants.ConfigurationKey.Gateway];

    if (gatewayConfig !== null && gatewayConfig !== undefined) {
      return configurations;
    }
    gatewayConfig = {};

    if (!utils.stringIsNullOrEmpty(clusterCreateParameters.userName)) {
      gatewayConfig['restAuthCredential.isEnabled'] = 'true';
      gatewayConfig['restAuthCredential.username'] = clusterCreateParameters.userName;
      gatewayConfig['restAuthCredential.password'] = clusterCreateParameters.password;
    } else {
      gatewayConfig['restAuthCredential.isEnabled'] = 'false';
    }

    configurations[HDIConstants.ConfigurationKey.Gateway] = gatewayConfig;

    return configurations;
  };
  
var getExtendedClusterCreateParameters = function(clusterName, clusterCreateParameters) {
    var createParamsExtended = {
      location: clusterCreateParameters.location,
      properties: {
        clusterDefinition: {
          clusterType: clusterCreateParameters.clusterType
        },
        clusterVersion: clusterCreateParameters.version,
        operatingSystemType: clusterCreateParameters.osType
      }
    };

    var configurations = getConfigurations(clusterName, clusterCreateParameters);

    if (clusterCreateParameters.hiveMetastore !== null && clusterCreateParameters.hiveMetastore !== undefined) {
      var hiveMetastoreConfig = getMetastoreConfig(clusterCreateParameters.hiveMetastore, clusterCreateParameters.osType, 'Hive');
      if (hiveMetastoreConfig instanceof Array) {
        for (var i = 0; i < hiveMetastoreConfig.length; i++) {
          var hiveConfigSet = hiveMetastoreConfig[i];
          if (configurations[hiveConfigSet.key] !== null && configurations[hiveConfigSet.key] !== undefined) {
            for (var j = 0; j < hiveConfigSet.value.length; j++) {
              var configs = {};
              configs[config.key] = config.value;
              configurations[hiveConfigSet.value[j].key] = configs;
            }
          } else {
            configurations[hiveConfigSet.key] = hiveConfigSet.value;
          }
        }
      }
    }
    if (clusterCreateParameters.oozieMetastore !== null && clusterCreateParameters.oozieMetastore !== undefined) {
      var oozieMetastoreConfig = getMetastoreConfig(clusterCreateParameters.oozieMetastore, clusterCreateParameters.osType, 'Oozie');
      if (oozieMetastoreConfig instanceof Array) {
        for (var k = 0; k < oozieMetastoreConfig.length; k++) {
          var oozieConfigSet = oozieMetastoreConfig[k];
          if (configurations[oozieConfigSet.key] !== null &&
            configurations[oozieConfigSet.key] !== undefined) {
            for (var m = 0; m < oozieConfigSet.value.length; m++) {
              var configs2 = {};
              configs2[config.key] = config.value;
              configurations[oozieConfigSet.value[m].key] = configs2;
            }
          } else {
            configurations[oozieConfigSet.key] = oozieConfigSet.value;
          }
        }
      }
    }

    createParamsExtended.properties.clusterDefinition.configurations = configurations;

    createParamsExtended.properties.computeProfile = {};
    createParamsExtended.properties.computeProfile.roles = getRoleCollection(clusterCreateParameters);

    return createParamsExtended;
  };

var createCluster  = function(credential, options) {
    if (utils.stringIsNullOrEmpty(options.osType)) {
      options.osType = 'Linux';
    }

    if (utils.stringIsNullOrEmpty(options.version)) {
      options.version = 'default';
    }
    
    
    return new Promise(function(resolve, reject) {
        var clusterCreateParametersExtended = getExtendedClusterCreateParameters(options.clusterName, options);
        var mgmClt = azureArmHDInsight.createHDInsightManagementClient(credential);
        mgmClt.clusters = require('./ClusterOperations').createClusterOperations(mgmClt);
        
        console.log(JSON.stringify(clusterCreateParametersExtended,null, '\t'));
        
        mgmClt.clusters.create(options.resourceGroup, options.clusterName, clusterCreateParametersExtended, 
            function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

module.exports = createCluster;
