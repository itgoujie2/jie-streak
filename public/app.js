angular.module('streak', ['ctrlModule', 'ngRoute'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
		$routeProvider
			.when('/', {
				templateUrl : '/views/partials/index.html',
				controller : 'IndexCtrl'
			})
			.when('/show', {
				templateUrl : '/views/partials/show.html',
				controller : 'ShowCtrl'
			})
			.otherwise({
				redirectTo : '/'
			});

		$locationProvider.html5Mode(true);
	}]);