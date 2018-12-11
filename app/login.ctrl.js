'use strict';
/*global angular, loginController */
angular
    .module('bodamauyjesy')
    .controller('loginController', loginController);

loginController.$inject = ['$scope', '$firebaseAuth', '$location', 'rootRef', '$timeout'];

function loginController($scope, $firebaseAuth, $location, rootRef, $timeout) {
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
            $location.path('rsvp').search({ uid: authData.uid });
        }).catch(function (error) {
            if (error) {
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
            }
            console.error("Authentication failed:", error);
        });
    };
    vm.forgotPassword = function () {
        $location.path('/nuevaContrasena1');
        $location.replace();
    };
    vm.changePassword = function () {
        $location.path('/cambiarContrasena');
        $location.replace();
    };
}
