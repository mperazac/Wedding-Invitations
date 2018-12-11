'use strict';
/*global angular, cambiarContController */
angular
    .module('bodamauyjesy')
    .controller('cambiarContController', cambiarContController);

cambiarContController.$inject = ['$scope', '$location', 'rootRef', '$timeout', 'firebaseSvc', '$firebaseAuth', 'toaster'];

function cambiarContController($scope, $location, rootRef, $timeout, firebaseSvc, $firebaseAuth, toaster) {
    var vm = this;
    vm.txtEmail = '';
    vm.txtPassOld = '';
    vm.txtPassNew = '';
    vm.invalido = false;
    vm.success = false;
    vm.errorMsj = "";
    vm.firebaseSvc = firebaseSvc;

    vm.cambiar = function () {
        vm.invalido = false;
        if (vm.txtEmail === undefined) {
            vm.txtEmail = '';
        }
        rootRef.changePassword({
            email: vm.txtEmail,
            oldPassword: vm.txtPassOld,
            newPassword: vm.txtPassNew
        }, function (error) {
            if (error) {
                vm.invalido = true;
                switch (error.code) {
                    case 'INVALID_PASSWORD':
                        vm.errorMsj = "Contraseña inválida.";
                        // toaster.pop('error', 'Ocurrió un error', 'Contraseña inválida');
                        break;
                    case 'INVALID_USER':
                        vm.errorMsj = "Email inválido.";
                        // toaster.pop('error', 'Ocurrió un error', 'Email inválido');
                        break;
                    default:
                        vm.errorMsj = "Ha ocurrido un error.";
                        // toaster.pop('error', 'Ocurrió un error', 'No se pudo cambiar la contraseña');
                        console.log('Error changing password:', error);
                }
            } else {
                toaster.pop('success', 'Éxito', 'Contraseña cambiada');
                var auth = $firebaseAuth(rootRef);
                auth.$authWithPassword({
                    email: vm.txtEmail,
                    password: vm.txtPassNew
                }).then(function (authData) {
                    vm.firebaseSvc.guardarAuth(authData.uid, vm.txtPassNew);
                    $location.path('rsvp').search({ uid: authData.uid });
                }).catch(function (error) {
                    switch (error.code) {
                        case "INVALID_EMAIL":
                            vm.errorMsj = "Email inválido o no existe.";
                            // toaster.pop('error', 'Ocurrió un error', 'Email inválido o no existe');
                            break;
                        case "INVALID_PASSWORD":
                            vm.errorMsj = "Contraseña inválida.";
                            // toaster.pop('error', 'Ocurrió un error', 'Contraseña inválida');
                            break;
                        default:
                            vm.errorMsj = "Ha ocurrido un error. Contacte a los novios.";
                            // toaster.pop('error', 'Ocurrió un error', 'Contacte a los novios');
                            console.log("Error resetting password:", error);
                    }
                    vm.invalido = true;
                });
            }
            $scope.$digest();
        });
    };
    vm.cancelar = function () {
        $location.path('/');
    };
}
