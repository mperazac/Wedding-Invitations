'use strict';
/*global angular, loginController */
angular
    .module('adminbodamauyjesy')
    .controller('loginController', loginController);

loginController.$inject = ['$scope', '$firebaseAuth', '$location', 'rootRef', 'firebaseSvc', '$timeout', '$rootScope'];

function loginController($scope, $firebaseAuth, $location, rootRef, firebaseSvc, $timeout, $rootScope) {
    var vm = this;
    vm.txtEmail = '';
    vm.txtPass = '';
    vm.invalido = false;

    vm.login = function () {
        vm.invalido = false;
        var auth = $firebaseAuth(rootRef);
        auth.$authWithPassword({
            email: vm.txtEmail,
            password: vm.txtPass
        }).then(function (authData) {
            firebaseSvc.actualizarStatus(authData.uid).then(function (user) {
                if (user.isAdmin) {
                    $location.path('/');
                    $rootScope.isAuthenticated = true;
                } else {
                    vm.errorMsj = "Usted no tiene permiso para ingresar a esta área.";
                    vm.invalido = true;
                    $rootScope.isAuthenticated = false;
                }
            });
        }).catch(function (error) {
            switch (error.code) {
                case "INVALID_EMAIL":
                    vm.errorMsj = "Email inválido o no existe.";
                    break;
                case "INVALID_PASSWORD":
                    vm.errorMsj = "Contraseña inválida.";
                    break;
                default:
                    vm.errorMsj = "Ha ocurrido un error. Contacte a los novios.";
                    console.log("Error resetting password:", error);
            }
            vm.invalido = true;
        });
    };

    vm.forgotPassword = function () {
        $location.path('/nuevaContrasena1');
    };
    vm.changePassword = function () {
        $location.path('/cambiarContrasena');
        $location.replace();
    };
}
