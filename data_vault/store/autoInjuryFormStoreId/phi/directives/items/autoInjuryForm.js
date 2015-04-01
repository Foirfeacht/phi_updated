defineDynamicDirective(function() {
  return {
    name : 'autoInjuryForm',
    directive : [
        'phiContext',
        'dynPhiDataSyncService',
        'dashboardService',
        'vault',
        '$mdSidenav',
        '$http',
		'printService',
        function(phiContext, dynPhiDataSyncService, dashboardService, vault, $http, $mdSidenav, printService) {
          return {
            restrict : 'E',
            scope : {
              'phiData' : '='
            },
            //require: "^dyndirective",
            templateUrl : '../data_vault/store/autoInjuryFormStoreId/phi/directives/items/autoInjuryForm.html',
            controller: function($scope, $mdSidenav, $http, printService) {
              var leftTrigger = document.getElementById('left-trigger');
              var rightTrigger = document.getElementById('right-trigger');
              $scope.toggleLeft = function() {
                $mdSidenav('left').toggle()
					.then(function() {
						$('.md-sidenav-backdrop').hide();
						if ($('.md-sidenav-backdrop').hasClass('md-closed')) {
							$scope.rightState = false;
							$scope.leftState = false;
							console.log('clicked');
							$('md-content').css('width', '60%');
						}
					});
              };
              $scope.toggleRight = function() {
                $mdSidenav('right').toggle()
					.then(function(){
						$('.md-sidenav-backdrop').hide();
						if($('.md-sidenav-backdrop').hasClass('md-closed')){
							$scope.rightState = false;
							$scope.leftState = false;
							console.log('clicked');

						}
					});

			  };
				$scope.$watch('isOpen', function(){console.log('isopen')});
              $scope.rightState = false;
              $scope.leftState = false;
              $scope.leftIsOpen = false;
              $scope.rightIsOpen = false;
				$scope.updatedInjuryFormId = printService.updatedInjuryFormId;

				$scope.printPDF = function() {
					var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/injuryForms/';
					var data = dynPhiDataSyncService.initModel($scope, rootPath);
					var subPath = "record/" + $scope.updatedInjuryFormId + "/narrative";
					var request = '../../../f402/servlet/rest/PdfPrint/VaultQ?id=' + rootPath + subPath;

					$http.get(request)
						.success(function(data) {
							console.log('printed');
						})
						.error(function (data) {
							console.log('Error: ' + data);
						});
				};
            },
            link : function($scope, element, attrs, controller) {
            
              // Init data
              $scope.items = [];

				$scope.$watch('updatedInjuryFormId', function() {
					printService.getId($scope.latLng);
				});

				$scope.$on('valuesUpdated', function() {
					$scope.updatedInjuryFormId = printService.updatedInjuryFormId;
				});

              // narrative

              $scope.narrative = '';
              var narrativeEl = document.getElementById('narrative-text');
              var narrativeContainer = document.getElementById('narrative-txa');
              $scope.narrative = narrativeEl.textContent;
              

              $scope.$watch(function () {
                 return narrativeEl.innerHTML;
              }, function(val) {
                 $scope.updateNarrative();
                 narrativeContainer.value = $scope.narrative;
              });


              $scope.updateNarrative = function(){
                $scope.narrative = narrativeEl.textContent;
              }

				// date

				$scope.initDate = function(){
					$scope.date = new Date($scope.date);
					$scope.dateCollision.date = new Date($scope.dateCollision.date);
					scope.dateCollision.time = new Date($scope.dateCollision.time);
				}





              function equalIdsPredicate(injuryForm) {
                return injuryForm.id === updatedInjuryFormId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedInjuryForm = updates[i].obj;
                  var updatedInjuryFormId = updatedInjuryForm.id;
					$scope.updatedInjuryFormId = updatedInjuryFormId;
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
                    data.field("record/" + updatedInjuryFormId + "/dateCollision.date").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedInjuryFormId + "/dateCollision.time").setStartValue(new Date()).setWatchable(true).register();
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
                    data.field("record/" + updatedInjuryFormId + "/narrative").setWatchable(true).register();
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

              $scope.classOne = 'flipped';
              $scope.classTwo = 'flipped';

              $scope.toggleLeftButton = function() {
                if ($scope.classOne === "flipped"){
                  $scope.classOne = "notFlipped";
                } else {
                  $scope.classOne = "flipped";
                }
              };

              $scope.toggleRightButton = function() {
                if ($scope.classTwo === "flipped"){
                  $scope.classTwo = "notFlipped";
                } else {
                  $scope.classTwo = "flipped";
                }
              };


            }
          };
        } ]
  };
});









