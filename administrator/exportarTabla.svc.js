'use strict';
/*global angular, exportarTabla */
angular
    .module('adminbodamauyjesy')
    .factory('exportarTabla', exportarTabla);

exportarTabla.$inject = [];

function exportarTabla() {
    var service = {
            exportExcel: exportExcel,
            exportPDF: exportPDF
        };
    return service;

    function exportExcel (tableId) {
        $(tableId).tableExport({ type: 'excel', escape: 'false' });
    }
    function exportPDF (tableId) {
        $(tableId).tableExport({ type: 'pdf', escape: 'false' });
    }


}
