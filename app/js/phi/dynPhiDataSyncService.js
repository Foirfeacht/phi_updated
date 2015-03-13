app.factory('dynPhiDataSyncService', [ '$interval', '$timeout', 'vaultQ', function($interval, $timeout, vaultQ) {

  function DataModel(rootPath) {
    this.rootPath = rootPath;
    this.registeredFieldsMeta = {};
    // All other properties in this object considering as atomic values
    this.emulatedJsObj = {};
  }

  DataModel.prototype = {

    field : function(subPath) {
      var fieldMeta = this.registeredFieldsMeta[subPath];
      if (!fieldMeta) {
        fieldMeta = new DataField(subPath, this);
      }
      return fieldMeta;
    },

    compositeField : function(subPath) {
      var compositeField = new CompositeDataField(subPath, this);
      return compositeField;
    },

    registerField : function(subPath, fieldMeta) {
      var self = this;

      if (this.isFieldRegistered(subPath)) {
        console.log("Registering skipped because of field already registered: " + subPath);
        return;
      }

      this.registeredFieldsMeta[subPath] = fieldMeta;

      if (fieldMeta.isWatchable) {
        this.adjustWatchFeature(fieldMeta);
      }

      this.adjustClassicArbitraryNestedJsObject(subPath);
      console.log("Registered field: " + subPath);
    },

    deregisterField : function(subPath) {
      delete this.registeredFieldsMeta[subPath];
      console.log("Deregistered field: " + subPath);
    },

    deregisterAllFieldsWithPathStartsWith : function(searchString) {
      _.each(this.registeredFieldsMeta, function(fieldMeta, subPath) {
        if (subPath.startsWith(searchString)) {
          fieldMeta.deregister();
        }
      });
    },

    isFieldRegistered : function(subPath) {
      return this.registeredFieldsMeta[subPath] !== undefined;
    },

    pull : function(onlyNewlyRegistered) {
      console.log("Started Pull for " + this.rootPath);
      var self = this;

      var batchPullUpdatesRequests = self.extractPullRequestReadyForVault(onlyNewlyRegistered);

      if (!batchPullUpdatesRequests.length) {
        console.log("No fields for pull");
        return Promise.resolve();
      }

      console.log("Fields for pull: " + batchPullUpdatesRequests.length);

      function processResults(batchPullUpdatesResults) {
        self.processPullResultsGotFromVault(batchPullUpdatesResults, batchPullUpdatesRequests);
      }
      return vaultQ.getUpdatesBatch(batchPullUpdatesRequests).then(processResults);
    },

    pullNewlyRegisteredFields : function() {
      return this.pull(true);
    },

    extractPullRequestReadyForVault : function(onlyNewlyRegistered) {
      var batchPullUpdatesRequests = [];

      for ( var subPath in this.registeredFieldsMeta) {
        if (this.registeredFieldsMeta.hasOwnProperty(subPath)) {
          var fieldMeta = this.registeredFieldsMeta[subPath];
          var fullPath = this.fullPath(subPath);
          var latestCnt = fieldMeta.latestCnt;

          if (onlyNewlyRegistered !== true || (onlyNewlyRegistered === true && latestCnt === undefined)) {
            batchPullUpdatesRequests.push({
              path : fullPath,
              cnt : latestCnt
            });
          }
        }
      }

      return batchPullUpdatesRequests;
    },

    processPullResultsGotFromVault : function(batchPullUpdatesResults, batchPullUpdatesRequests) {
      var self = this;

      // Mark all requested fields as loaded at least one time (means
      // latestCnt !== undefined)
      for (var i = 0; i < batchPullUpdatesRequests.length; i++) {
        var request = batchPullUpdatesRequests[i];
        var subPath = self.subPath(request.path);
        var fieldMeta = self.registeredFieldsMeta[subPath];
        if (fieldMeta && fieldMeta.latestCnt === undefined) {
          fieldMeta.latestCnt = 0;
        }
      }

      // Extract results with at least one update. reject empty
      batchPullUpdatesResults = _.filter(batchPullUpdatesResults, function(updatesResult) {
        return updatesResult.updates && updatesResult.updates.length;
      });

      // Process updates (calculate new values, update counters)
      if (!batchPullUpdatesResults.length) {
        console.log("No incoming updates");
        return;
      }
      for (var j = 0; j < batchPullUpdatesResults.length; j++) {
        var pullUpdatesResult = batchPullUpdatesResults[j];

        var fullPath = pullUpdatesResult.path;
        var updates = pullUpdatesResult.updates;

        var updateSubPath = self.subPath(fullPath);
        console.log("Incoming update found for " + updateSubPath + " :");
        console.log(updates);

        var updateFieldMeta = self.registeredFieldsMeta[updateSubPath];
        // This chunk may be concurrently deregistered by this user - wrap
        // with if
        if (updateFieldMeta) {
          var currentFieldValue = updateFieldMeta.currentValue;
          var calculatedNewFieldValue = updateFieldMeta.applyUpdatesToModelFn(currentFieldValue, updates);
          var calculatedNewFieldCnt = _.last(updates).cnt;

          updateFieldMeta.latestValue = angular.copy(calculatedNewFieldValue);
          updateFieldMeta.latestCnt = calculatedNewFieldCnt ? calculatedNewFieldCnt : 0;
          updateFieldMeta.currentValue = calculatedNewFieldValue;
          // Remember current time for skipping nearest 'watch' iteration
          updateFieldMeta.latestPullUpdateTs = Date.now();
          updateFieldMeta.skipNextWatch = true;
        }
      }
    },

    push : function() {
      console.log("Started Push for " + this.rootPath);
      var self = this;

      var batchPushUpdatesRequests = self.extractPushRequestReadyForVault();

      if (!batchPushUpdatesRequests.length) {
        console.log("No outgoing updates");
        return Promise.resolve();
      }

      function processResults(batchPushUpdatesResults) {
        self.processPushResultsGotFromVault(batchPushUpdatesResults);
      }
      return vaultQ.putBatch(batchPushUpdatesRequests).then(processResults);
    },

    extractPushRequestReadyForVault : function() {
      var batchPushUpdatesRequests = [];

      for ( var subPath in this.registeredFieldsMeta) {
        if (this.registeredFieldsMeta.hasOwnProperty(subPath)) {
          var fieldMeta = this.registeredFieldsMeta[subPath];

          // If automatic updates extracting and pushing is not disabled
          if (fieldMeta.extractUpdateFromChangedModelFn) {

            var latestValue = fieldMeta.latestValue;
            var currentFieldValue = fieldMeta.currentValue;

            var currentAndActualAreTheSame = angular.equals(currentFieldValue, latestValue);
            if (!currentAndActualAreTheSame) {
              var fullPath = this.fullPath(subPath);
              var update = fieldMeta.extractUpdateFromChangedModelFn(currentFieldValue, latestValue);

              if (update !== undefined) {
                console.log("Outgoing update found for: " + subPath);
                console.log(update);

                batchPushUpdatesRequests.push({
                  path : fullPath,
                  obj : update
                });
              }
            }
          }
        }
      }

      return batchPushUpdatesRequests;
    },

    processPushResultsGotFromVault : function(batchPushUpdatesResults) {
      var self = this;

      for (var i = 0; i < batchPushUpdatesResults.length; i++) {
        var pushUpdatesResult = batchPushUpdatesResults[i];

        var newCnt = pushUpdatesResult.cnt;
        var fullPath = pushUpdatesResult.path;

        var subPath = self.subPath(fullPath);

        var fieldMeta = self.registeredFieldsMeta[subPath];
        var currentFieldValue = fieldMeta.currentValue;
        fieldMeta.latestValue = angular.copy(currentFieldValue);
        fieldMeta.latestCnt = newCnt;
      }
    },

    sync : function() {
      console.log("Started Sync for " + this.rootPath);
      var self = this;

      var batchPushUpdatesRequests = self.extractPushRequestReadyForVault();
      var batchPullUpdatesRequests = self.extractPullRequestReadyForVault();

      if (!batchPushUpdatesRequests.length && !batchPullUpdatesRequests.length) {
        console.log("No outgoing updates and fields for pull");
        return Promise.resolve();
      }

      function processResults(result) {
        var batchPullUpdatesResults = result.updateResponses;
        self.processPullResultsGotFromVault(batchPullUpdatesResults, batchPullUpdatesRequests);
      }
      return vaultQ.putAndGetUpdatesBatch(batchPushUpdatesRequests, batchPullUpdatesRequests).then(processResults);
    },

    putUpdate : function(subPath, update) {
      console.log("Started Sync With Additional Update for " + this.rootPath);
      var self = this;

      var batchPushUpdatesRequests = self.extractPushRequestReadyForVault();
      var batchPullUpdatesRequests = self.extractPullRequestReadyForVault();

      var fullPath = self.fullPath(subPath);

      batchPushUpdatesRequests.push({
        path : fullPath,
        obj : update
      });
      console.log("Additional Outgoing update added found for: " + subPath);
      console.log(update);

      if (!batchPushUpdatesRequests.length && !batchPullUpdatesRequests.length) {
        console.log("No outgoing updates and fields for pull");
        return Promise.resolve();
      }

      function processResults(result) {
        var batchPullUpdatesResults = result.updateResponses;
        self.processPullResultsGotFromVault(batchPullUpdatesResults, batchPullUpdatesRequests);
      }
      return vaultQ.putAndGetUpdatesBatch(batchPushUpdatesRequests, batchPullUpdatesRequests).then(processResults);
    },

    adjustClassicArbitraryNestedJsObject : function(subPath) {
      var self = this;

      // Split path into 'directories'
      var fieldDirs = subPath.split("/");
      // Remove empty strings
      fieldDirs = _.filter(fieldDirs, function(dir) {
        return dir;
      });

      // Walk through 'dirs' hierarchy and find place for final atomic field.
      var targetFieldValueContainer = self.emulatedJsObj;

      for (var i = 0; i < fieldDirs.length - 1; i++) {
        var dir = fieldDirs[i];
        if (targetFieldValueContainer[dir] === undefined) {
          // If 'dir' not found during traversing - create it
          targetFieldValueContainer[dir] = {};
        }
        targetFieldValueContainer = targetFieldValueContainer[dir];
      }

      // Link with dataModel via getters/setters
      var lastDir = fieldDirs[fieldDirs.length - 1];
      Object.defineProperty(targetFieldValueContainer, lastDir, {
        get : function() {
          return self.getCurrentValue(subPath);
        },
        set : function(value) {
          self.setCurrentValue(subPath, value);
        }
      });
    },

    asClassicJsObject : function() {
      return this.emulatedJsObj;
    },

    adjustWatchFeature : function(fieldMeta) {
      var self = this;

      var bombingAvoidingDelay = 2000;

      function currentValue() {
        return fieldMeta.currentValue;
      }

      function onValueUpdate(newValue, prevValue) {
        if (fieldMeta.latestCnt === undefined) {
          // This field was not initially pulled yet
          return;
        }
        var skipThisWatch = fieldMeta.skipNextWatch;
        var latestPullUpdateTs = fieldMeta.latestPullUpdateTs;

        if (skipThisWatch) {
          fieldMeta.skipNextWatch = false;
          if (Date.now() - latestPullUpdateTs < 200) {
            // If this changing was caused by 'pull'. Skip it ...
            return;
          }
        }

        if (self.watchPendingSyncTask) {
          // There is scheduled sync task from one of watchable fields -
          // cancel it...
          $timeout.cancel(self.watchPendingSyncTask);
        }

        // ... and schedule new one
        var syncTask = $timeout(function() {
          self.sync();
        }, bombingAvoidingDelay);

        self.watchPendingSyncTask = syncTask;

        syncTask.then(function() {
          delete self.watchPendingSyncTask;
        });
      }

      var scope = managedDataModels[this.rootPath].scope;
      scope.$watch(currentValue, onValueUpdate, true);
    },

    // SECONDARY UTILITY
    getCurrentValue : function(subPath) {
      var fieldMeta = this.registeredFieldsMeta[subPath];
      if (fieldMeta) {
        return fieldMeta.currentValue;
      }
    },

    setCurrentValue : function(subPath, value) {
      var fieldMeta = this.registeredFieldsMeta[subPath];
      if (fieldMeta) {
        fieldMeta.currentValue = value;
      }
    },

    fullPath : function(subPath) {
      return this.rootPath + subPath;
    },

    subPath : function(fullPath) {
      return fullPath.replace(this.rootPath, "");
    },
  // END OF SECONDARY UTILITY
  };

  function defaultApplyUpdatesToModelFn(currentValue, incomingUpdates) {
    if (incomingUpdates && incomingUpdates.length) {
      return _.last(incomingUpdates).obj;
    } else {
      return currentValue;
    }
  }

  function defaultApplyUpdatesToModelOfCollectionTypeFn(currentValue, incomingUpdates) {
    function equalIdsPredicate(item) {
      return item.id === updatedItemId;
    }

    for (var i = 0; i < incomingUpdates.length; i++) {
      var updatedItem = incomingUpdates[i].obj;
      var updatedItemId = updatedItem.id;
      var updatedItemIsActive = updatedItem.active;

      var currentItemWithSameId = _.find(currentValue, equalIdsPredicate);
      if (currentItemWithSameId) {
        if (updatedItemIsActive) {
          currentValue.splice(currentValue.indexOf(currentItemWithSameId), 1, updatedItem);
        } else {
          currentValue.splice(currentValue.indexOf(currentItemWithSameId), 1);
        }
      } else {
        if (updatedItemIsActive) {
          currentValue.push(updatedItem);
        }
      }

      if (this.afterSingleIncomingUpdateAppliedListener) {
        this.afterSingleIncomingUpdateAppliedListener(updatedItem);
      }
    }

    if (this.afterBatchIncomingUpdatesAppliedListener) {
      this.afterBatchIncomingUpdatesAppliedListener(currentValue);
    }
    return currentValue;
  }

  function defaultExtractUpdateFromChangedModelFn(currentValue, latestSynchronizedValue) {
    return currentValue;
  }

  function defaultExtractUpdateFromChangedModelOfCollectionTypeFn(currentValue, latestSynchronizedValue) {
    if (!Array.isArray(currentValue)) {
      throw "Current Value isn't array";
    }
    if (latestSynchronizedValue) {
      if (!Array.isArray(latestSynchronizedValue)) {
        throw "Latest Synchronized Value isn't array";
      }
    }

    var addedItems = _.difference(currentValue, latestSynchronizedValue);
    var removedItems = _.filter(currentValue, function(item) {
      return item.active === false;
    });
    var updates = _.union(addedItems, removedItems);
    updates.isForCollectionType = true;
    return updates;
  }

  function DataField(subPath, parentDataModel) {
    this.subPath = subPath;
    this.parentDataModel = parentDataModel;
    this.latestValue = undefined;
    this.latestCnt = undefined;
    this.currentValue = undefined;
    this.applyUpdatesToModelFn = defaultApplyUpdatesToModelFn;
    this.extractUpdateFromChangedModelFn = defaultExtractUpdateFromChangedModelFn;
    this.isWatchable = false;
    this.latestPullUpdateTs = undefined;
    this.skipNextWatch = false;
  }
  DataField.prototype = {
    setStartValue : function(startValue) {
      this.currentValue = startValue;
      return this;
    },

    isRegistered : function() {
      return this.parentDataModel.isFieldRegistered(this.subPath);
    },

    register : function() {
      this.parentDataModel.registerField(this.subPath, this);
      return this;
    },

    deregister : function() {
      this.parentDataModel.deregisterField(this.subPath);
      return this;
    },

    setApplyUpdatesToModelFn : function(fn) {
      this.applyUpdatesToModelFn = fn;
      return this;
    },

    setExtractUpdateFromChangedModelFn : function(fn) {
      this.extractUpdateFromChangedModelFn = fn;
      return this;
    },

    behaveAsCollection : function() {
      this.applyUpdatesToModelFn = defaultApplyUpdatesToModelOfCollectionTypeFn;
      this.extractUpdateFromChangedModelFn = defaultExtractUpdateFromChangedModelOfCollectionTypeFn;
      return this;
    },

    behaveAsSimpleValue : function() {
      this.applyUpdatesToModelFn = defaultApplyUpdatesToModelFn;
      this.extractUpdateFromChangedModelFn = defaultExtractUpdateFromChangedModelFn;
      return this;
    },

    onAfterSingleIncomingUpdateApplied : function(fn) {
      this.afterSingleIncomingUpdateAppliedListener = fn;
      return this;
    },

    onAfterBatchIncomingUpdatesApplied : function(fn) {
      this.afterBatchIncomingUpdatesAppliedListener = fn;
      return this;
    },

    disableAutomaticOutgoingUpdatesExtractingOnPush : function() {
      // allow only explicit updates putting
      this.extractUpdateFromChangedModelFn = null;
      return this;
    },

    setWatchable : function(isWatchable) {
      this.isWatchable = isWatchable;
      return this;
    },

    putUpdate : function(update) {
      return this.parentDataModel.putUpdate(this.subPath, update);
    },
  };

  function CompositeDataField(subPath, parentDataModel) {
    this.subPath = subPath;
    this.parentDataModel = parentDataModel;
  }

  CompositeDataField.prototype = {
    field : function(fieldName) {
      var fullSubPath = this.subPath + "/" + fieldName;
      var fieldMeta = this.parentDataModel.registeredFieldsMeta[fullSubPath];
      if (!fieldMeta) {
        fieldMeta = new DataField(fullSubPath, this.parentDataModel);
      }
      return fieldMeta;
    },

    deregisterAllFields : function() {
      this.parentDataModel.deregisterAllFieldsWithPathStartsWith(this.subPath);
    }
  };

  var managedDataModels = {
  // rootPath : {scope, dataModel}
  };

  var syncService = {
    initModel : function($scope, rootPath) {
      console.log("Initiating model: " + rootPath);
      var self = this;

      var dataModel = new DataModel(rootPath);
      managedDataModels[rootPath] = {
        scope : $scope,
        dataModel : dataModel
      };

      $scope.$on("$destroy", function() {
        self.forget(rootPath);
      });
      return dataModel;
    },

    forget : function(rootPath) {
      console.log("Forgetting model: " + rootPath);
      delete managedDataModels[rootPath];
    },

    sync : function() {
      console.log("Syncing models...");
      for ( var rootPath in managedDataModels) {
        if (managedDataModels.hasOwnProperty(rootPath)) {
          var model = managedDataModels[rootPath].dataModel;
          model.sync();
        }
      }
    }
  };
  $interval(syncService.sync, 10000);
  return syncService;
} ]);