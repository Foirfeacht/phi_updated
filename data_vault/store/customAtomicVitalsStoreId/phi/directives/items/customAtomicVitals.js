defineDynamicDirective(function() {
  return {
    name : 'customAtomicVitals',
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
            templateUrl : '../data_vault/store/customAtomicVitalsStoreId/phi/directives/items/customAtomicVitals.html',
            link : function($scope, element, attrs, controller) {

              // Init data
              $scope.items = [];

              function equalIdsPredicate(vital) {
                return vital.id === updatedVitalId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedVital = updates[i].obj;
                  var updatedVitalId = updatedVital.id;
                  var updatedVitalIsActive = updatedVital.active;

                  var currentVitalWithSameId = _.find(currentValue, function equalIdsPredicate(vital) {
                    return vital.id === updatedVitalId;
                  });
                  if (currentVitalWithSameId) {
                    if (updatedVitalIsActive) {
                      currentValue.splice(currentValue.indexOf(currentVitalWithSameId), 1, updatedVital);
                    } else {
                      currentValue.splice(currentValue.indexOf(currentVitalWithSameId), 1);
                    }
                  } else {
                    if (updatedVitalIsActive) {
                      currentValue.push(updatedVital);
                    }
                  }

                  if (updatedVitalIsActive) {
                    // Register eager fields
                    data.field("record/" + updatedVitalId + "/date").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedVitalId + "/height").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedVitalId + "/weight").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedVitalId + "/bpSystolic").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + updatedVitalId + "/bpDiastolic").setStartValue({}).setWatchable(true).register();
                  } else {
                    // Deregister all child fields
                    data.deregisterAllFieldsWithPathStartsWith("record/" + updatedVitalId);
                  }
                }
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
                return currentValue;
              }

              function extractUpdateFn(currentValue, latestSynchronizedValue) {
                return undefined;
              }

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/vitals/';
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
              var dashboardRenderTmplPath = "/store/customAtomicVitalsStoreId/phi/directives/items/customAtomicVitalsDashboardPanel.html";
              vault.getRaw(dashboardRenderTmplPath).then(function(dashboardRenderTmpl) {
                // TODO: resolve dashboard rendering
                dashboardService.addDynamicPanel('customVitalsDashboardPanel', 'Custom Vitals', dashboardRenderTmpl, $scope.data);
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
                  // After push/pull find newly added vital...
                  var vital = _.find($scope.data.records, function(vital) {
                    return vital.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(vital);
                });
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedVital) {
                if (selectedVital) {
                  if (selectedVital.active) {
                    data.field("record/" + selectedVital.id + "/heightOutOfScope").setStartValue(false).setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/weightOutOfScope").setStartValue(false).setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/bpOutOfScope").setStartValue(false).setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/bmi").setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/counseling").setStartValue({}).setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/notEntered").setStartValue(false).setWatchable(true).register();
                    data.field("record/" + selectedVital.id + "/notEnteredReason").setWatchable(true).register();
                    data.pullNewlyRegisteredFields();
                  }
                  $scope.selectedVital = data.asClassicJsObject().record[selectedVital.id];
                } else {
                  $scope.selectedVital = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedVital) {
                if (deactivatedVital) {
                  data.field('records').putUpdate(deactivatedVital);
                }
              };
              // END of List specific logic

              // Vitals-specific functions
              $scope.isRelevant = function(vital) {
                return vital.status !== 'NotEntered';
              };
              $scope.notEnteredCheckboxTouched = function(vital) {
                if (vital) {
                  if (vital.notEntered) {
                    if (!vital.notEnteredReason) {
                      vital.notEnteredReason = 'NoReasonIdentified';
                    }
                  } else {
                    vital.notEnteredReason = null;
                  }
                }
              };
              $scope.onHeightOutOfScopeChanged = function(vital) {
                if (vital.heightOutOfScope) {
                  vital.height = null;
                  vital.bmi = null;
                }
              };
              $scope.onWeightOutOfScopeChanged = function(vital) {
                if (vital.weightOutOfScope) {
                  vital.weight = null;
                  vital.bmi = null;
                }
              };
              $scope.initHeightUnits = function(vital) {
                if (vital.height && vital.height.value && !vital.height.units) {
                  vital.height.units = 'in';
                }
              };
              $scope.initWeightUnits = function(vital) {
                if (vital.weight && vital.weight.value && !vital.weight.units) {
                  vital.weight.units = 'lbs';
                }
              };
              $scope.initBpUnits = function(bp) {
                if (bp && bp.value && !bp.units) {
                  bp.units = "mmHg";
                }
              };
              $scope.recalculateBmi = function(vital) {
                var heightInInches = convertHeightToInches(vital.height);
                var weightInLbs = convertWeightToLbs(vital.weight);
                if (heightInInches && weightInLbs) {
                  var bmi = weightInLbs * 703.0695796 / (heightInInches * heightInInches);
                  bmi = Math.round(bmi * 100) / 100;
                  vital.bmi = bmi;
                } else {
                  vital.bmi = null;
                }
              };

              function convertHeightToInches(height) {
                if (!height || !height.value) {
                  return undefined;
                }
                switch (height.units) {
                case 'in':
                  return height.value;
                case 'cm':
                  return height.value * 0.393700787;
                default:
                  break;
                }
              }

              function convertWeightToLbs(weight) {
                if (!weight || !weight.value) {
                  return undefined;
                }
                switch (weight.units) {
                case 'lbs':
                  return weight.value;
                case 'kg':
                  return weight.value * 2.20462262;
                default:
                  break;
                }
              }

            }
          };
        } ]
  };
});