'use strict';
/*global angular, firebaseSvc */
angular
    .module('bodamauyjesy')
    .service('firebaseSvc', firebaseSvc);

firebaseSvc.$inject = ['rootRef', '$firebaseObject', '$firebaseArray', '$q'];

function firebaseSvc(rootRef, $firebaseObject, $firebaseArray, $q) {
    var invitadosRef = rootRef.child('invitados'),
        authsRef = rootRef.child('auths'),
        service = {
            getInvitado: getInvitado, //uid
            getInvitadosRelacionados: getInvitadosRelacionados, //grupoId
            getInvitadosRelacionadosArray: getInvitadosRelacionadosArray,
            actualizarStatus: actualizarStatus, //uid
            guardarAuth: guardarAuth,
            salir: salir
        };
    return service;

    function getInvitado(uid) {
        return $firebaseObject(invitadosRef.child(uid)).$loaded();
    }

    function getInvitadosRelacionados(grupoId) {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.orderByChild("grupoId").equalTo(grupoId)).$loaded()
            .then(function (users) {
                deferred.resolve(users);
            });
        return deferred.promise;
    }

    function getInvitadosRelacionadosArray(grupoId) {
        var deferred = $q.defer();
        $firebaseArray(invitadosRef.orderByChild("grupoId").equalTo(grupoId)).$loaded()
            .then(function (users) {
                deferred.resolve(users);
            });
        return deferred.promise;
    }

    function actualizarStatus(uid) {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.child(uid)).$loaded()
            .then(function (user) {
                deferred.resolve(user);
            });
        return deferred.promise;
    }

    function guardarAuth(uid, password) {
        var obj = $firebaseObject(authsRef.child(uid));
        obj.$loaded()
            .then(function (data) {
                data.password = password;
                data.$save();
            })
            .catch(function (error) {
                toaster.pop('error', 'Ocurrió un error', 'Error guardando clave para: ' + uid, error);
            });
    }

    function salir() {
        return rootRef.unauth();
    }
}
