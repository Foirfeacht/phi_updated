defineDynamicDirective(function() {
  return {
    name : 'customProblems',
    directive : [ 'dataStateHelper', function(dataStateHelper) {
      return {
        restrict : 'E',
        scope : {
          'phiData' : '='
        },
        templateUrl : '../data_vault/store/customProblemsStoreId/phi/directives/items/customProblems.html',
        link : function(scope, element, attrs, controller) {
          scope.addProblem = function() {
            var newObj = {
              'active' : true
            };
            if (!scope.phiData.problems) {
              scope.phiData.problems = [];
            }
            scope.phiData.problems.push(newObj);
          };

          scope.isDirty = function(obj) {
            return dataStateHelper.isDirty(obj);
          };
        }
      };
    } ]
  };
});