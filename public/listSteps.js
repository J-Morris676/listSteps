var listStepsApp = angular.module('listStepsApp', ['ngSanitize']);

listStepsApp.controller('listStepsCtrl', function ($scope, $http) {
	$http.get('/api/steps').then(function(response) {
		$scope.steps = response.data;
	});
	
	$scope.openFile = function(filePath) {
		$http.post('/api/openFile', {filePath: filePath});
	}
});

listStepsApp.filter('highlight', function () {
	return function (text, search, caseSensitive) {
		if (text && (search || angular.isNumber(search))) {
			text = text.toString();
			search = search.toString();
									console.log(search);

			if (caseSensitive) {
				return text.split(search).join('<span class="ui-match">' + search + '</span>');
			} else {
				return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
			}
		} else {
			return text;
		}
	};
});