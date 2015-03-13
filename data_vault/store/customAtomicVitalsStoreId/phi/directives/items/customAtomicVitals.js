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

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/vitals/';
              var data = dynPhiDataSyncService.initModel($scope, rootPath);

              function registerEagerFieldsFn(updatedVital) {
                var updatedVitalId = updatedVital.id;
                var updatedVitalIsActive = updatedVital.active;

                var vitalComposite = data.compositeField("record/" + updatedVitalId);
                if (updatedVitalIsActive) {
                  // Register eager fields
                  vitalComposite.field("date").setStartValue(new Date()).setWatchable(true).register();
                  vitalComposite.field("height").setStartValue({}).setWatchable(true).register();
                  vitalComposite.field("weight").setStartValue({}).setWatchable(true).register();
                  vitalComposite.field("bpSystolic").setStartValue({}).setWatchable(true).register();
                  vitalComposite.field("bpDiastolic").setStartValue({}).setWatchable(true).register();
                } else {
                  // Deregister all child fields
                  vitalComposite.deregisterAllFields();
                }
              }

              function pullNewlyRegisteredFieldsFn() {
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
              }

              data.field("records")
                .behaveAsCollection()
                .setStartValue([])
                .onAfterSingleIncomingUpdateApplied(registerEagerFieldsFn)
                .onAfterBatchIncomingUpdatesApplied(pullNewlyRegisteredFieldsFn)
                .disableAutomaticOutgoingUpdatesExtractingOnPush()
                .register();
              data.pull();

              // For two-way binding onto form
              $scope.data = data.asClassicJsObject();
              $scope.$watch("data.records", function(records) {
                $scope.items = records;
              });

              // Load render template
              var dashboardRenderTmplPath = "/store/customAtomicVitalsStoreId/phi/directives/items/customAtomicVitalsDashboardPanel.html";
              vault.getRaw(dashboardRenderTmplPath).then(function(dashboardRenderTmpl) {
                dashboardService.addDynamicPanel('customVitalsDashboardPanel', 'Custom Vitals', dashboardRenderTmpl, $scope.data);
              });
              // END of Warm-up data sync service

              // List specific logic
              $scope.addNewItem = function() {
                var newId = UUID.generate();
                var update = {
                  id : newId,
                  active : true
                };
                data.field("records").putUpdate(update).then(function() {
                  // After push/pull find newly added vital...
                  var vital = _.find($scope.data.records, function(vital) {
                    return vital.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(vital);
                });
                // phi-items-list require returning of newly created object
                // wrapped with a promise. But 'putUpdate' execution already
                // added a new item to the list, so just return an empty promise
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedVital) {
                if (selectedVital) {
                  if (selectedVital.active) {
                    // register lazy fields
                    var selectedVitalComposite = data.compositeField("record/" + selectedVital.id);

                    selectedVitalComposite.field("heightOutOfScope").setStartValue(false).setWatchable(true).register();
                    selectedVitalComposite.field("weightOutOfScope").setStartValue(false).setWatchable(true).register();
                    selectedVitalComposite.field("bpOutOfScope").setStartValue(false).setWatchable(true).register();
                    selectedVitalComposite.field("bmi").setWatchable(true).register();
                    selectedVitalComposite.field("counseling").setStartValue({}).setWatchable(true).register();
                    selectedVitalComposite.field("notEntered").setStartValue(false).setWatchable(true).register();
                    selectedVitalComposite.field("notEnteredReason").setWatchable(true).register();

                    data.pullNewlyRegisteredFields();
                  }
                  // ... and bind selected record to the edit form
                  $scope.selectedVital = data.asClassicJsObject().record[selectedVital.id];
                } else {
                  $scope.selectedVital = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedVital) {
                if (deactivatedVital) {
                  data.field("records").putUpdate(deactivatedVital);
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