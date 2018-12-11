'use strict';
/*global angular, rsvpController */
angular
    .module('bodamauyjesy')
    .controller('rsvpController', rsvpController);

rsvpController.$inject = ['firebaseSvc', '$timeout', 'userInfo', '$location', 'uibButtonConfig'];

function rsvpController(firebaseSvc, $timeout, userInfo, $location, uibButtonConfig) {
    var rsvp = this;
    rsvp.nombre = '';
    // rsvp.status = [];
    rsvp.invitados = [];
    rsvp.confirmadoLabel = [];
    rsvp.mensajes = {
        primeraPersona: [],
        terceraPersona: []
    };
    rsvp.mensajes.primeraPersona = ['Asistiré', 'Pendiente', 'No asistiré'];
    rsvp.mensajes.terceraPersona = ['Asistirá', 'Pendiente', 'No asistirá'];
    uibButtonConfig.activeClass = 'selectedRsvpBtn';
    if (userInfo.grupoId) {
        rsvp.nombre = userInfo.nombre;
        firebaseSvc.getInvitadosRelacionadosArray(userInfo.grupoId)
            .then(function (result) {
                // var i = 0;
                // result.forEach(function (childSnapshot) {
                //     rsvp.status[i++] = childSnapshot.status;
                // });
                rsvp.invitados = result;
            });
    }else{
        alert("Invitado no existe en la bases de datos.");
    }

    rsvp.actualizarStatus = function (index) {
        rsvp.confirmadoLabel[index] = false;
        rsvp.invitados.$save(index)
            .then(function (ref) {
                if (ref.key() === rsvp.invitados[index].$id) {
                    rsvp.confirmadoLabel[index] = true;
                    $timeout(function () {
                        rsvp.confirmadoLabel[index] = false;
                    }, 2000);
                } else {
                    console.log("Error guardando nuevo status del invitado: " + rsvp.invitados[index].nombre);
                    console.log(error);
                }

            });
    };

    // rsvp.actualizarStatus = function (invitado, uid, status, index) {
    //     rsvp.confirmadoLabel[index] = false;
    //     //invitado.status = status;
    //     //rsvp.status[index] = status;
    //     firebaseSvc.actualizarStatus(uid).then(function (thisInvitado) {
    //         thisInvitado.status = status;
    //         thisInvitado.$save()
    //             .then(function () {
    //                 rsvp.confirmadoLabel[index] = true;
    //                 $timeout(function () {
    //                     rsvp.confirmadoLabel[index] = false;
    //                 }, 2000);
    //             }, function (error) {
    //                 console.log("Error:", error);
    //             });
    //     });
    // };

    rsvp.salir = function () {
        firebaseSvc.salir();
        $location.path('/');
        $location.url($location.path());
    };
}
