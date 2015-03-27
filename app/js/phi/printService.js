app.service('printService', function($rootScope) {

	var getId, updatedInjuryFormId;

	getId = function(updatedInjuryFormId){
		this.updatedInjuryFormId = updatedInjuryFormId;
		$rootScope.$broadcast("valuesUpdated");
	}

	return {
		updatedInjuryFormId: updatedInjuryFormId,
		getId: getId
	}

});/**
 * Created by vmaltsev on 3/27/2015.
 */
