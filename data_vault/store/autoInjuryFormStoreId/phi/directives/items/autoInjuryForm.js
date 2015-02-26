defineDynamicDirective(function() {
  return {
    name : 'autoInjuryForm',
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
            templateUrl : '../data_vault/store/autoInjuryFormStoreId/phi/directives/items/autoInjuryForm.html',
            link : function($scope, element, attrs, controller) {
            
              // Init data
              $scope.items = [];

              function equalIdsPredicate(injuryForm) {
                return injuryForm.id === updatedInjuryFormId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedInjuryForm = updates[i].obj;
                  var updatedInjuryFormId = updatedInjuryForm.id;
                  var updatedInjuryFormIsActive = updatedInjuryForm.active;

                  var currentInjuryFormWithSameId = _.find(currentValue, function equalIdsPredicate(injuryForm) {
                    return injuryForm.id === updatedInjuryFormId;
                  });
                  if (currentInjuryFormWithSameId) {
                    if (updatedInjuryFormIsActive) {
                      currentValue.splice(currentValue.indexOf(currentInjuryFormWithSameId), 1, updatedInjuryForm);
                    } else {
                      currentValue.splice(currentValue.indexOf(currentInjuryFormWithSameId), 1);
                    }
                  } else {
                    if (updatedInjuryFormIsActive) {
                      currentValue.push(updatedInjuryForm);
                    }
                  }

                  if (updatedInjuryFormIsActive) {
                    // Register eager fields
                    data.field("record/" + updatedInjuryFormId + "/date").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/name").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/dateCollision.date").setStartValue(new Date()).setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/dateCollision.time").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/location").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/roadConditions").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/police").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/report").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/reportRequest").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospital").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospitalName").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospitalTransportation").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospitalXray").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospitalInjuries").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/hospitalDuration").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/cutbleed").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bruises").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/seat").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/collisionAwareness").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/collisionConsciousness").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/collisionBlackOutDuration").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/collisionFlashOfLight").setWatchable(true).register();
                  } else {
                    // Deregister all child fields
                    data.deregisterAllFieldsWithPathStartsWith("record/" + updatedInjuryFormId);
                  }
                }
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
                return currentValue;
              }

              function extractUpdateFn(currentValue, latestSynchronizedValue) {
                return undefined;
              }

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/injuryForms/';
              var data = dynPhiDataSyncService.initModel($scope, rootPath);
              data.field("records").setStartValue([]).setApplyUpdatesToModelFn(applyUpdatesFn).setExtractUpdateFromChangedModelFn(
                  extractUpdateFn).register();
              data.pull();

              // For two-way binding onto form
              $scope.data = data.asClassicJsObject();
              $scope.$watch("data.records", function(records) {
                $scope.items = records;
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
                  // After push/pull find newly added form...
                  var injuryForm = _.find($scope.data.records, function(injuryForm) {
                    return injuryForm.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(injuryForm);
                });
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedInjuryForm) {
                if (selectedInjuryForm) {
                  if (selectedInjuryForm.active) {
                    //data.field("record/" + selectedHist.id + "/endDate").setStartValue(false).setWatchable(true).register();
                    data.pullNewlyRegisteredFields();
                  }
                  $scope.selectedInjuryForm = data.asClassicJsObject().record[selectedInjuryForm.id];
                } else {
                  $scope.selectedInjuryForm = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedInjuryForm) {
                if (deactivatedInjuryForm) {
                  data.field('records').putUpdate(deactivatedInjuryForm);
                }
              };

              $scope.showNarrative = function(){
                document.getElementById('narr').style.display="block";
                document.getElementById('narr-trigger').style.display="none";
              }
              $scope.hideNarrative = function(){
                document.getElementById('narr').style.display="none";
                document.getElementById('narr-trigger').style.display="block";
              }
              //timepicker
              $scope.hstep = 1;
              $scope.mstep = 1;
              $scope.ismeridian = true;
              $scope.toggleMode = function() {
                $scope.ismeridian = ! $scope.ismeridian;
              };
            }
          };
        } ]
  };
});





