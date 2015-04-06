defineDynamicDirective(function() {
  return {
    name : 'bestPT',
    directive : [
        'phiContext',
        'dynPhiDataSyncService',
        'dashboardService',
        'vault',
        '$mdSidenav',
        '$http',
        'vaultPdfPrint',
        function(phiContext, dynPhiDataSyncService, dashboardService, vault, $http, $mdSidenav, vaultPdfPrint) {
          return {
            restrict : 'E',
            scope : {
              'phiData' : '='
            },
            //require: "^dyndirective",
            templateUrl : '../data_vault/store/bestPTStoreId/phi/directives/items/bestPT.html',
            controller: function($scope, $mdSidenav, $http, vaultPdfPrint) {

              // powering tabs
              $scope.tabData = {
                selectedIndex : 0
              };
              $scope.next = function() {
                $scope.tabData.selectedIndex = Math.min($scope.tabData.selectedIndex + 1, 2) ;
              };
              $scope.previous = function() {
                $scope.tabData.selectedIndex = Math.max($scope.tabData.selectedIndex - 1, 0);
              };



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
            },
            link : function($scope, element, attrs, controller) {

               $scope.toggleLeft();
            
              // Init data
              $scope.items = [];

              
              
              $scope.printPdf = function(){
                var $e = angular.element(narrativeContainer);
                $e.triggerHandler('input');
                var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/bestPT/';
                var data = dynPhiDataSyncService.initModel($scope, rootPath);
                var subPath = "record/" + $scope.updatedbestPTId + "/narrative";
                var path = rootPath + subPath;
                vaultPdfPrint.printPdf('vaultQ', path);   
              }

              // narrative
                             
              /*

              $scope.narrative = '';
              var narrativeEl = document.getElementById('narrative-text');
              var narrativeContainer = document.getElementById('narrative-txa');
              
              

              $scope.$watch(function () {
                 return narrativeEl.innerHTML;
              }, function(val) {
                 $scope.updateNarrative();
                 narrativeContainer.value = $scope.narrativeText;
        
              });


              $scope.updateNarrative = function(){
                $scope.narrative = narrativeEl.textContent;
              }

              */

        // date

        $scope.initDate = function(){
          $scope.startOfCare = new Date($scope.startOfCare);
          $scope.dateCollision.demographics.doi = new Date($scope.demographics.doi);
          $scope.dateCollision.demographics.examDate = new Date($scope.dateCollision.demographics.examDate);
          $scope.dateCollision.demographics.examTime = new Date($scope.dateCollision.demographics.examTime);
        }





              function equalIdsPredicate(bestPT) {
                return bestPT.id === updatedBestPTId;
              }

              // Warm-up data sync service
              function applyUpdatesFn(currentValue, updates) {
                for (var i = 0; i < updates.length; i++) {
                  var updatedBestPT = updates[i].obj;
                  var updatedBestPTId = updatedBestPT.id;
                  $scope.updatedBestPTId = updatedBestPTId;
                  console.log(updatedBestPTId)
                  var updatedBestPTIsActive = updatedBestPT.active;

                  var currentBestPTWithSameId = _.find(currentValue, function equalIdsPredicate(bestPT) {
                    return bestPT.id === updatedBestPTId;
                  });
                  if (currentBestPTWithSameId) {
                    if (updatedBestPTIsActive) {
                      currentValue.splice(currentValue.indexOf(currentBestPTWithSameId), 1, updatedBestPT);
                    } else {
                      currentValue.splice(currentValue.indexOf(currentBestPTWithSameId), 1);
                    }
                  } else {
                    if (updatedBestPTIsActive) {
                      currentValue.push(updatedBestPT);
                    }
                  }



                  if (updatedBestPTIsActive) {
                    // Register eager fields
                    data.field("record/" + updatedBestPTId + "/startOfCare").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/refPhysician").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/name").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.refDiagnosis").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.treatmentDiagnosis").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.refICD").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.treatmentICD").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.injury").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.doi").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.examDate").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographics.examTime").setStartValue(new Date()).setWatchable(true).register();

                   
                  } else {
                    // Deregister all child fields
                    data.deregisterAllFieldsWithPathStartsWith("record/" + updatedBestPTId);
                  }
                }
                // Pull newly registered fields
                data.pullNewlyRegisteredFields();
                return currentValue;
              }

              function extractUpdateFn(currentValue, latestSynchronizedValue) {
                return undefined;
              }

              var rootPath = '/provider/' + phiContext.providerId + '/patient/' + phiContext.patientId + '/bestPT/';
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
                  var bestPT = _.find($scope.data.records, function(bestPT) {
                    return bestPT.id === newId;
                  });
                  // ... and select it
                  $scope.onSelect(bestPT);
                });
                return Promise.resolve();
              };

              $scope.onItemSelect = function(selectedBestPT) {
                if (selectedBestPT) {
                  if (selectedBestPT.active) {
                    //data.field("record/" + selectedHist.id + "/endDate").setStartValue(false).setWatchable(true).register();
                    data.pullNewlyRegisteredFields();
                  }
                  $scope.selectedBestPT = data.asClassicJsObject().record[selectedBestPT.id];

                  
                } else {
                  $scope.selectedBestPT = null;
                }
              };

              $scope.onItemRemoved = function(deactivatedBestPT) {
                if (deactivatedBestPT) {
                  data.field('records').putUpdate(deactivatedBestPT);
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









