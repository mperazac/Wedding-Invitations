'use strict';
/*global angular, checklistController, $ */
angular
    .module('adminbodamauyjesy')
    .controller('checklistController', checklistController);

checklistController.$inject = ['firebaseSvc', '$location', 'exportarTabla'];

function checklistController(firebaseSvc, $location, exportarTabla) {
    var checklist = this;
    checklist.exportarTabla = exportarTabla;
    checklist.xlf = null;
    checklist.confirmados = [];
    checklist.rechazados = [];
    checklist.pendientes = [];
    firebaseSvc.getInvitadosConfirmados()
        .then(function(result) {
            checklist.confirmados = result;
        });
    firebaseSvc.getInvitadosRechazados()
        .then(function(result) {
            checklist.rechazados = result;
        });
    firebaseSvc.getInvitadosPendientes()
        .then(function(result) {
            checklist.pendientes = result;
        });
}
