'use strict';
/*global angular, firebaseSvc */
angular
    .module('adminbodamauyjesy')
    .service('firebaseSvc', firebaseSvc);

firebaseSvc.$inject = ['rootRef', '$firebaseObject', '$q', '$firebaseAuth', '$firebaseArray', '$rootScope', 'toaster'];

function firebaseSvc(rootRef, $firebaseObject, $q, $firebaseAuth, $firebaseArray, $rootScope, toaster) {
    var invitadosRef = rootRef.child('invitados'),
        authsRef = rootRef.child('auths'),
        isAuthenticated = false,
        service = {
            crearUsuario: crearUsuario, //usuario
            getAllInvitados: getAllInvitados,
            getInvitadoByUid: getInvitadoByUid, //uid
            getInvitadoByEmail: getInvitadoByEmail, //email
            actualizarStatus: actualizarStatus, //uid
            getInvitadosConfirmados: getInvitadosConfirmados,
            getInvitadosRechazados: getInvitadosRechazados,
            getInvitadosPendientes: getInvitadosPendientes,
            getInvitadoSinEmail: getInvitadoSinEmail,
            salir: salir,
            isAuthenticated: isAuthenticated,
            getAuth: getAuth,
            guardarAuth: guardarAuth,
            borrarUsuario: borrarUsuario
        };
    return service;

    function crearUsuario(usuario) {
        var deferred = $q.defer(),
            auth = $firebaseAuth(rootRef),
            password = usuario.password,
            that = this;
        auth.$createUser({
                email: usuario.email,
                password: usuario.password
            })
            .then(function (userData) {
                that.guardarAuth(userData.uid, password);
                deferred.resolve(userData);
            })
            .catch(function (error) {
                switch (error.code) {
                    case 'EMAIL_TAKEN':
                        //toaster.pop('error', 'Ocurrió un error', 'El email ' + usuario.email + ' ya existe');
                        deferred.resolve(error.code);
                        break;
                    default:
                        toaster.pop('error', 'Error al crear al usuario ' + usuario.email, error);
                        break;
                }
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

    function getAllInvitados() {
        var deferred = $q.defer();
        $firebaseArray(invitadosRef.orderByChild("grupoId"))
            .$loaded()
            .then(function (allInvitados) {
                deferred.resolve(allInvitados);
            });
        return deferred.promise;
    }

    function getInvitadoByUid(uid) {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.child(uid))
            .$loaded()
            .then(function (user) {
                deferred.resolve(user);
            });
        return deferred.promise;
    }

    function getInvitadoByEmail(email) {
        var deferred = $q.defer();
        $firebaseArray(invitadosRef.orderByChild('email')
                .equalTo(email))
            .$loaded()
            .then(function (user) {
                deferred.resolve(user);
            });
        return deferred.promise;
    }

    function actualizarStatus(uid) {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.child(uid))
            .$loaded()
            .then(function (user) {
                deferred.resolve(user);
            });
        return deferred.promise;
    }

    function getInvitadosConfirmados() {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.orderByChild("status")
                .equalTo('confirmado'))
            .$loaded()
            .then(function (users) {
                deferred.resolve(users);
            });
        return deferred.promise;
    }

    function getInvitadosRechazados() {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.orderByChild("status")
                .equalTo('rechazado'))
            .$loaded()
            .then(function (users) {
                deferred.resolve(users);
            });
        return deferred.promise;
    }

    function getInvitadosPendientes() {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.orderByChild("status")
                .equalTo('pendiente'))
            .$loaded()
            .then(function (users) {
                deferred.resolve(users);
            });
        return deferred.promise;
    }

    function getInvitadoSinEmail(invitado) {
        var deferred = $q.defer();
        $firebaseObject(invitadosRef.orderByChild("nombre")
                .equalTo(invitado.nombre))
            .$loaded()
            .then(function (user) {
                deferred.resolve(user);
            });
        return deferred.promise;
    }

    function getAuth() {
        var auth = $firebaseAuth(rootRef);
        return auth.$getAuth();
    }

    function salir() {
        $rootScope.isAuthenticated = false;
        return rootRef.unauth();
    }

    function borrarUsuario(uid, email) {
        var deferred = $q.defer(),
            auth = $firebaseAuth(rootRef);

        $firebaseObject(authsRef.child(uid))
            .$loaded()
            .then(function (user) {
                auth.$removeUser({
                    email: email,
                    password: user.password
                }).then(function (response) {
                    //También hay que borrar la contraseña
                    user.$remove();
                    deferred.resolve(response);
                }).catch(function (error) {
                    toaster.pop('error', 'Ocurrió un error', 'Error borrando al usuario');
                    console.log("Error: ", error);
                });
            });
        return deferred.promise;
    }
}
