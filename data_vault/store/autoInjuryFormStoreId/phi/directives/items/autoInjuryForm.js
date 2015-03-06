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
            link : function($scope, element, attrs, controller, $window) {
            
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
                    data.field("record/" + updatedInjuryFormId + "/aftermathConfused").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/aftermathDisoriented").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/aftermathLightheaded").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/aftermathNausea").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/aftermathVision").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/aftermathBuzz").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomConfused").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomDisoriented").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomLightheaded").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomNausea").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomVision").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/symptomBuzz").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultIrritation").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultRestless").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultForgetful").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultSleepless").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultConcentration").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultMemory").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultHeatTolerance").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/resultAlcTolerance").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/headrest").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/seatBelt").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/seatBeltType").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/vehicleYear").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/vehicleMake").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/vehicleModel").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/vehicleStopped").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/driverBrake").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/estimatedSpeed").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/vehicleMoving").setWatchable(true).register(); 
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitHead").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitChest").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitShoulder").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitArm").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitHip").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitLeg").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitKnee").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/bodyPartHitOther").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/seatBeltInjury").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/seatBeltInjuryDesc").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/estimatedDamageUSD").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/trunkForward").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/trunkTurned").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/headForward").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/headTurned").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/otherVehicleYear").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/otherVehicleMoving").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/otherVehicleEstimatedSpeed").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/otherVehicleMovingDesc").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/offWork").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/offWorkFrom").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/offWorkTo").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/workEffortRequired").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/workAggPain").setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/accidentDesc").setWatchable(true).register();
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
              
              //some checkbox fields
              
              $scope.collisionAftermath = ['CONFUSED', 'NAUSEATED', 'DISORIENTED', 'BLURRED VISION', 'LIGHTHEADED', 'RING/BUZZ IN EARS'];

              $scope.aftermathSelection = [];

              $scope.toggleAftermathSelection = function toggleAftermathSelection(aftermathName) {
                   var idx = $scope.aftermathSelection.indexOf(aftermathName);

                   // is currently selected
                   if (idx > -1) {
                     $scope.aftermathSelection.splice(idx, 1);
                   }

                   // is newly selected
                   else {
                     $scope.aftermathSelection.push(aftermathName);
                   }
                 };

              $scope.collisionSymptoms = ['CONFUSED', 'NAUSEATED', 'DISORIENTED', 'BLURRED VISION', 'LIGHTHEADED', 'RING/BUZZ IN EARS'];

              /*$scope.collisionAftermath = [
                {name: 'CONFUSED', selected: false},
                {name: 'NAUSEATED', selected: false},
                {name: 'DISORIENTED', selected: false},
                {name: 'BLURRED VISION', selected: false},
                {name: 'LIGHTHEADED', selected: false},
                {name: 'RING/BUZZ IN EARS', selected: false},
              ];

              $scope.aftermathSelection = [];

              $scope.selectedAftermath = function selectedAftermath() {
                return filterFilter($scope.fruits, { selected: true });
              };

              $scope.$watch('aftermath|filter:{selected:true}', function (nv) {
                $scope.aftermathSelection = nv.map(function (aftermath) {
                  return aftermath.name;
                });
              }, true);
*/

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

              // dom manipulation - temporary working with dom in controllers
              var windowEl = angular.element($window);
       
              
              windowEl.on('scroll', function () {
                console.log('window scrolled')
                var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                if( scrollTop > 92 ){
                  document.getElementsByClassName('trigger').style.top='0';
                }
              });


              var narr = document.getElementById('narr');
              var lmenu = document.getElementById('left-menu');
              var aif = document.getElementById('aif');

              $scope.showMenu = function(){
                lmenu.style.display = (lmenu.style.display === 'none') ? 'block' : 'none'; 
                aif.className = (lmenu.style.display === 'none') ? 'col-md-12' : 'col-md-9';

                if(narr){narr.style.display === 'none'}
              };

              $scope.showNarrative = function(){

                narr.style.display = (narr.style.display === 'none') ? 'block' : 'none';
                aif.className = (narr.style.display === 'none') ? 'col-md-12' : 'col-md-9'; 
                lmenu.style.display ='none';
              };

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






