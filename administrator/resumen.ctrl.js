'use strict';
/*global angular, resumenController, Chart */
angular
    .module('adminbodamauyjesy')
    .controller('resumenController', resumenController);

resumenController.$inject = ['allInvitados'];

function resumenController(allInvitados) {
    var resumen = this;
    Chart.defaults.global.colours = ['#5cb85c', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'];
    resumen.allInvitados = allInvitados;
    resumen.legend = true;
    resumen.totalInvitadosConfirmados = 0;
    resumen.totalInvitadosRechazados = 0;
    resumen.totalInvitadosPendientes = 0;
    resumen.allInvitados.forEach(
        function (value) {
            switch (value.status) {
                case 'confirmado':
                    resumen.totalInvitadosConfirmados++;
                    break;
                case 'rechazado':
                    resumen.totalInvitadosRechazados++;
                    break;
                case 'pendiente':
                    resumen.totalInvitadosPendientes++;
                    break;
                default:
                    console.log('Error al contar ' + value);
            }
        }
    );
    resumen.labels = ["Confirmados", "Pendientes", "Rechazados"];
    resumen.data = [resumen.totalInvitadosConfirmados, resumen.totalInvitadosPendientes, resumen.totalInvitadosRechazados];
}
