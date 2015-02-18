defineDynamicDirective(function() {
  return {
    name : 'problems',
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
            templateUrl : '../data_vault/store/problemsStoreId/phi/directives/items/problems.html',
            link : function($scope, element, attrs, controller) {

              // Init data
              $scope.items = [];

              function equalIdsPredicate(problem) {
                return problem.id === updatedProblemId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedProblem = updates[i].obj;
                  var updatedProblemId = updatedProblem.id;
                  var updatedProblemIsActive = updatedProblem.active;

                  var currentProblemWithSameId = _.find(currentValue, function equalIdsPredicate(problem) {
                    return problem.id === updatedProblemId;
                  });
                  if (currentProblemWithSameId) {
                    if (updatedProblemIsActive) {
                      currentValue.splice(currentValue.indexOf(currentProblemWithSameId), 1, updatedProblem);
                    } else {
                      currentValue.splice(currentValue.indexOf(currentProblemWithSameId), 1);
                    }
                  } else {
                    if (updatedProblemIsActive) {
                      currentValue.push(updatedProblem);
                    }
                  }

                  if (updatedProblemIsActive) {
                    // Register eager fields
                    data.field("record/" + updatedProblemId + "/startDate").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/problemStatus").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/relationCode").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/description").setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/endDate").setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/problemType").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/problemValueSnomed").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedProblemId + "/noProblemKnown").setWatchable(true).register();
                  } else {
                    // Deregister all child fields
                    data.deregisterAllFieldsWithPathStartsWith("record/" + updatedProblemId);
                  }
                }
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
                return currentValue;
              }

              function extractUpdateFn(currentValue, latestSynchronizedValue) {
                return undefined;
              }

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/problems/';
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
              var dashboardRenderTmplPath = "/store/problemsStoreId/phi/directives/items/problemsDashboardPanel.html";
              vault.getRaw(dashboardRenderTmplPath).then(function(dashboardRenderTmpl) {
                // TODO: resolve dashboard rendering
                dashboardService.addDynamicPanel('problemsDashboardPanel', 'Problems', dashboardRenderTmpl, $scope.data);
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
                  var problem = _.find($scope.data.records, function(problem) {
                    return problem.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(problem);
                });
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedProblem) {
                if (selectedProblem) {
                  if (selectedProblem.active) {
                    //data.field("record/" + selectedHist.id + "/endDate").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/problemType").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/problemValueSnomed").setStartValue(false).setWatchable(true).register();
                    //data.field("record/" + selectedHist.id + "/description").setStartValue(false).setWatchable(true).register();
                    data.pullNewlyRegisteredFields();
                  }
                  $scope.selectedProblem = data.asClassicJsObject().record[selectedProblem.id];
                } else {
                  $scope.selectedProblem = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedProblem) {
                if (deactivatedProblem) {
                  data.field('records').putUpdate(deactivatedProblem);
                }
              };
              
              $scope.notProblemKnownCheckboxTouched = function(hiproblemst) {
                if (problem) {
                  if (problem.noProblemKnown) {
                      problem.noProblemKnown = true;
                      problem.description = "No Problem Known";
                  } else {
                    problem.noProblemKnown = false;
                    problem.description = "";
                  }
                }
              };       


            }
          };
        } ]
  };
});