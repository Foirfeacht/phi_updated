'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('vrcApp', ['ngRoute', 'ngResource', 'ngTable', 'ui.bootstrap', 'ui.date', 'ngMaterial', 'angularMoment']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/dyndirective'});
}]);

app.config([ "datepickerConfig", "datepickerPopupConfig", function(datepickerConfig, datepickerPopupConfig) {
	  datepickerConfig.showWeeks = false;
	  datepickerPopupConfig.showButtonBar = false;
	  datepickerPopupConfig.datepickerPopup = "MM/dd/yyyy HH:mm";
	} ]);

app.constant('angularMomentConfig', {
    preprocess: 'unix', // optional
    timezone: 'Europe/London' // optional
});


