'use strict';
/*global angular, menuController, $ */
angular
    .module('adminbodamauyjesy')
    .controller('menuController', menuController);

menuController.$inject = ['$scope', '$location', 'globalInfo', 'firebaseSvc', '$rootScope'];

function menuController($scope, $location, globalInfo, firebaseSvc, $rootScope) {
    $scope.sitioWebName = globalInfo.sitioWebName;
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
    $scope.mostrarMenu = $rootScope.isAuthenticated;
    $scope.salir = function () {
        firebaseSvc.salir();
        $scope.mostrarMenu = $rootScope.isAuthenticated = false;
        $location.path('/login');
    };

    $rootScope.$watch('isAuthenticated', function() {
        $scope.mostrarMenu = $rootScope.isAuthenticated;
    });
}
