defineDynamicDirective(function() {
  return {
    name : 'customFamilyHistories',
    directive : [
        'phiContext',
        'dynPhiDataSyncService',
        'dashboardService',
        'vault',
        function(phiContext, dynPhiDataSyncService, dashboardService, vault) {
          return {
            restrict : 'E',
            scope : {
              'phiData' : '='
            },
            templateUrl : '../data_vault/store/customFamilyHistoryStoreId/phi/directives/items/customFamilyHistory.html',
            link : function($scope, element, attrs, controller) {

              // Init data
              $scope.items = [];

              function equalIdsPredicate(hist) {
                return hist.id === updatedHistId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedHist = updates[i].obj;
                  var updatedHistId = updatedHist.id;
                  var updatedHistIsActive = updatedHist.active;

                  var currentHistWithSameId = _.find(currentValue, function equalIdsPredicate(hist) {
                    return hist.id === updatedHistId;
                  });
                  if (currentHistWithSameId) {
                    if (updatedHistIsActive) {
                      currentValue.splice(currentValue.indexOf(currentHistWithSameId), 1, updatedHist);
                    } else {
                      currentValue.splice(currentValue.indexOf(currentHistWithSameId), 1);
                    }
                  } else {
                    if (updatedHistIsActive) {
                      currentValue.push(updatedHist);
                    }
                  }

                  if (updatedHistIsActive) {
                    // Register eager fields
                    data.field("record/" + updatedHistId + "/startDate").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/problemStatus").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/relationCode").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/description").setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/endDate").setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/problemType").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/problemValueSnomed").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedHistId + "/noProblemKnown").setWatchable(true).register();
                  } else {
                    // Deregister all child fields
                    data.deregisterAllFieldsWithPathStartsWith("record/" + updatedHistId);
                  }
                }
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
                return currentValue;
              }

              function extractUpdateFn(currentValue, latestSynchronizedValue) {
                return undefined;
              }

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/familyHistories/';
              var data = dynPhiDataSyncService.initModel($scope, rootPath);
              data.field("records").setStartValue([]).setApplyUpdatesToModelFn(applyUpdatesFn).setExtractUpdateFromChangedModelFn(
                  extractUpdateFn).register();
              data.pull();

              // For two-way binding onto form
              $scope.data = data.asClassicJsObject();
              $scope.$watch("data.records", function(records) {
                $scope.items = records;
              });

              // Load render template
              var dashboardRenderTmplPath = "/store/customFamilyHistoryStoreId/phi/directives/items/customFamilyHistoryDashboardPanel.html";
              vault.getRaw(dashboardRenderTmplPath).then(function(dashboardRenderTmpl) {
                // TODO: resolve dashboard rendering
                dashboardService.addDynamicPanel('customFamilyHistoryDashboardPanel', 'Custom Family Histories', dashboardRenderTmpl, $scope.data);
              });
              // END of Warm-up data sync service

              // List specific logic
              $scope.addNewItem = function() {
                var newId = UUID.generate();
                var update = {
                  'id' : newId,
                  'active' : true,
                };
                data.field('records').putUpdate(update).then(function() {
                  // After push/pull find newly added history...
                  var hist = _.find($scope.data.records, function(hist) {
                    return hist.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(hist);
                });
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedHist) {
                if (selectedHist) {
                  if (selectedHist.active) {
                    //data.field("record/" + selectedHist.id + "/endDate").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/problemType").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/problemValueSnomed").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/description").setStartValue(false).setWatchable(true).register();
                    data.pullNewlyRegisteredFields();
                  }
                  $scope.selectedHist = data.asClassicJsObject().record[selectedHist.id];
                } else {
                  $scope.selectedHist = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedHist) {
                if (deactivatedHist) {
                  data.field('records').putUpdate(deactivatedHist);
                }
              };
              
              $scope.notProblemKnownCheckboxTouched = function(hist) {
                if (hist) {
                  if (hist.noProblemKnown) {
                    //if (!hist.noProblemKnown) {
                      hist.noProblemKnown = true;
                      hist.description = "No Problem Known";
                    //}
                  } else {
                    hist.noProblemKnown = false;
                    hist.description = "";
                  }
                }
              };       


            }
          };
        } ]
  };
});