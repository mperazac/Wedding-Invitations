'use strict';
/*global angular, envContController */
angular
    .module('bodamauyjesy')
    .controller('envContController', envContController);

envContController.$inject = ['$scope', '$location', 'rootRef', '$timeout', 'toaster'];

function envContController($scope, $location, rootRef, $timeout, toaster) {
    var vm = this;
    vm.txtEmail = '';
    vm.txtPassOld = '';
    vm.txtPassNew = '';
    vm.invalido = false;
    vm.success = false;
    vm.errorMsj = "";

    vm.forgotPassword = function () {
        vm.success = false;
        vm.invalido = false;
        if (vm.txtEmail === undefined) {
            vm.txtEmail = '';
        }
        rootRef.resetPassword({
            email: vm.txtEmail
        }, function (error) {
            if (error) {
                switch (error.code) {
                    case "INVALID_USER":
                        // toaster.pop('error', 'Ocurrió un error', 'Email inválido o no existe');
                        vm.errorMsj = "Email inválido o no existe.";
                        break;
                    case "ROUTE_NOT_FOUND":
                        vm.errorMsj = "Debe primero ingresar su email para que le enviemos una contraseña temporal.";
                        // toaster.pop('warning', 'Cuidado', 'Debe primero ingresar su email para que le enviemos una contraseña temporal');
                        break;
                    default:
                        vm.errorMsj = "Ha ocurrido un error.";
                        // toaster.pop('error', 'Ocurrió un error', 'Contacte a los novios');
                        console.log("Error resetting password:", error);
                }
                vm.invalido = true;
            } else {
                vm.successMsj = "Correo con contraseña temporal enviado satisfactoriamente. Espere a ser redirigido.";
                // toaster.pop('success', 'Contraseña temporal enviada', 'Revise su correo. Espere a ser redirigido');
                vm.success = true;
                $timeout(function () {
                    $location.path('/nuevaContrasena2');
                }, 2000);
            }
            $scope.$digest();
        });
    };
    vm.cancelar = function () {
        $location.path('/');
    };
}
