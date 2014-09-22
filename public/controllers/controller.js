var ctrlModule = angular.module('ctrlModule', []);

ctrlModule.controller('IndexCtrl', function($http, $scope, $location){

	$scope.search = function(){

		$http.get('/upload/data')
			.success(function(data){
				$scope.data = data;
			});
	};

});

ctrlModule.controller('ShowCtrl', function($http, $scope){

	console.log('called show ctrl');

});