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

              // powering subtabs
			$scope.subjectiveSelectedTab = 'report';

			$scope.subjectiveSelect = function(item){
				$scope.subjectiveSelectedTab = item;
			};

              $scope.planSelectedTab = 'frequency';

              $scope.planSelect = function(item){
                $scope.planSelectedTab = item;
              };



              var leftTrigger = document.getElementById('left-trigger');
              var rightTrigger = document.getElementById('right-trigger');
              $scope.toggleLeft = function() {
                $mdSidenav('left').toggle()
                    .then(function() {
                      $('.md-sidenav-backdrop').hide();
                    });
              };
              $scope.toggleRight = function() {
                $mdSidenav('right').toggle()
                    .then(function(){
                      $('.md-sidenav-backdrop').hide();
                    });
                };


            $scope.classTwo = 'flipped';
            $scope.classOne = 'flipped';

            $scope.rightState = false;
            $scope.leftState = false;

            $scope.toggleRightButton = function() {
              if ($scope.classTwo === "flipped"){
                $scope.classTwo = "notFlipped";
              } else {
                $scope.classTwo = "flipped";
              }
            };
   

            $scope.toggleLeftButton = function() {
              if ($scope.classOne === "flipped"){
                $scope.classOne = "notFlipped";
              } else {
                $scope.classOne = "flipped";
              }
            };

				//datepicker
				$scope.startOfCare = new Date();
				$scope.demographicsDoi =  new Date();
				$scope.demographicsExamDate =  new Date();
				$scope.planSignatureDate = new Date();

				$scope.datePickers = {
					firstOpened: false,
					secondOpened: false,
					thirdOpened: false,
					dischargeOpened: false,
					signatureOpened: false,
					pRdateOfInjuryOpened: false,
					pRdateOfSurgeryOpened: false
				};

				$scope.minDate = new Date();
				$scope.openOne = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.firstOpened = true;
				};

				$scope.openTwo = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.secondOpened = true;
				};

				$scope.openThree = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.thirdOpened = true;
				};

				$scope.openDischarged = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.dischargeOpened = true;
				};

				$scope.openSignature = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.signatureOpened = true;
				};

				$scope.openPRdateOfInjury = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.pRdateOfInjuryOpened = true;
				};

				$scope.openPRdateOfSurgery = function($event) {
					$event.preventDefault();
					$event.stopPropagation();

					$scope.datePickers.pRdateOfSurgeryOpened = true;
				};



				$scope.dateOptions = {
					formatYear: 'yy',
					startingDay: 1
				};

				$scope.format = 'yyyy/MM/dd';
        
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
                    data.field("record/" + updatedBestPTId + "/demographicsRefDiagnosis").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsTreatmentDiagnosis").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsRefICD").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsTreatmentICD").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsInjury").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsDoi").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsExamDate").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/demographicsExamTime").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportDateOfInjury").setStartValue(new Date()).setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportDateOfSurgery").setStartValue(new Date()).setWatchable(true).register();

                    data.field("record/" + updatedBestPTId + "/patientReport.cSpine").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.tSpine").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.lSpine").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.shoulder.which").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.wristHand").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.wristHand.which").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.hip").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.hip.which").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.knee").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.knee.which").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.ankleFoot").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.ankleFoot.which").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.other").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.otherText").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function1Prior1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function1Current1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function2Prior2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function2Current2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function3Prior3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReport.function3Current3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportChiefComplaint").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSummaryPatient").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportImpairment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportLimitation").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPriorLevelRadio").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPriorLevel").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportMedicalManagement").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportImagingResults").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportImagingResultsReported").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportAltTreatment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportAltTreatmentReported").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportMedicalHistory").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPastPT").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPastPTReported").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.lives").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.housing").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.entry").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.accessibility").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.employment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.employmentComment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.workStatus").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.hand").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSocialHistory.comment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPainLocation").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.now").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.worst").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.usual").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.best").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.radiates").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.radiatesTo").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.radiatesFrom").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.characteristic").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.timing").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.timingOther").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.activity").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportPain.time").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSleepDisruption").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportSleepOther").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/patientReportExpectations").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.none").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.falls").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.cardiac").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.siezures").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.diabetes").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.hypertension").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.other").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.general.otherText").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.leftLowerExtremity").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.leftLowerExtremityPercentage").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.rightLowerExtremity").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.rightLowerExtremityPercentage").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.leftUpperExtremity").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.leftUpperExtremityPercentage").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.rightUpperExtremity").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.weight.rightUpperExtremityPercentage").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.functional.driving").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.functional.stair").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.functional.lifting").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.mobility").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.excercise.none").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.excercise.arom").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.excercise.prom").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.excercise.other").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.excercise.otherText").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.rom").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.totalShoulder").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.totalElbow").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.totalHip").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.totalKnee").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.tendon").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.spinalFusion").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.rotator").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.aclr").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.other").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.sp.otherText").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.safety").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.safetyText").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.bracing").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.bracingMustWear").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/precautions.limitations").setWatchable(true).register();

                    data.field("record/" + updatedBestPTId + "/subjectiveDashScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveDash").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveLEFSScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveLEFS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveOswestryScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveOswestry").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveNeckScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveNeck").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveBackScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveBack").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveABCScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveABC").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectivePSFSScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectivePSFS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveGROCScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveGROC").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveFABQScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveFABQ").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveOptimalScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveOptimal").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveSF36Score").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveSF36").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveLysholmScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveLysholm").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveWOMACScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveWOMAC").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveQBPDSScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveQBPDS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveRMDQScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveRMDQ").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveNPRSScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveNPRS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveMcGillScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveMcGill").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveWHYMPIScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveWHYMPIScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveRAPSScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveRAPS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveVASScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveVAS").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveBarthelScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveBarthel").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveKatzScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveKatz").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveGeriatricScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveGeriatric").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveInstrumentalScore").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/subjectiveInstrumental").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentFunction1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentCurrent1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentGoal1").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentFunction2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentCurrent2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentGoal2").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentFunction3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentCurrent3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentGoal3").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentShortTerm").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/assessmentLongTerm").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planFrequencyTimes").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planFrequencyWeekMonth").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planFrequencyFor").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planFrequencyNotes").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeDate").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeStairs").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeStairsNumber").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeLivingSituation").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeLivingSituationOther").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeLivingSituationNotes").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeNurse").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeCareGiver").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeOccTherapy").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeSpeechTherapy").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeSocial").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeHome").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeOther").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeOtherNotes").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeSkilledServices").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeObstacles").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/dischargeEquipment").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planSignatureName").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planSignatureDate").setWatchable(true).register();
                    data.field("record/" + updatedBestPTId + "/planSignatureNotes").setWatchable(true).register();

                   
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

              //timepicker
              //
              $scope.demographicsExamTime = new Date();      

              $scope.hstep = 1;
              $scope.mstep = 15;
              $scope.ismeridian = true;

            }
          };
        } ]
  };
});









