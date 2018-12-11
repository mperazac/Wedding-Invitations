'use strict';
/*global angular, subirlistaController, $ */
angular
    .module('adminbodamauyjesy')
    .controller('subirlistaController', subirlistaController);

subirlistaController.$inject = ['$scope', 'firebaseSvc', '$location', 'jsXlsxService', '$timeout', 'utilidadesSvc', 'blockUI'];

function subirlistaController($scope, firebaseSvc, $location, jsXlsxService, $timeout, utilidadesSvc, blockUI) {
    var subirlista = this;
    subirlista.xlf = null;
    subirlista.usuarioExcel = [];
    subirlista.logs = [];
    subirlista.showProgressBar = false;
    subirlista.uploadProgress = 0;
    subirlista.progressCounter = 0;
    subirlista.subirNuevosUsuarios = function () {
        subirlista.uploadProgress = 0;
        subirlista.logs = [];
        if (subirlista.xlf) {
            subirlista.showProgressBar = true;
            blockUI.start();
            jsXlsxService.getXlsxinJson(subirlista.xlf)
                .then(function (result) {
                    if (result) {
                        firebaseSvc.getAllInvitados()
                            .then(function (allInvitados) {
                                subirlista.allInvitados = allInvitados;
                                var usuarios = JSON.parse(result),
                                    usuariosExcel = '';
                                if (usuarios === 'undefined' || usuarios.lista === 'undefined') {
                                    //No existe la hoja de excel con nombre "lista".
                                    subirlista.uploadProgress = 100;
                                    subirlista.enviarAlLog('La hoja de Excel no tiene el formato correcto, ' +
                                        'la hoja de los invitados debe de llamarse "lista"', 'bueno');
                                    return;
                                } else {
                                    usuariosExcel = usuarios.lista;
                                }
                                for (var i = 0; i < usuariosExcel.length; i++) {
                                    (function (i) {
                                        $timeout(function () {
                                            subirlista.usuarioExcel[i] = usuariosExcel[i];
                                            var usuarioExiste = subirlista.invitadoExiste(subirlista.usuarioExcel[i]);
                                            //Si no existe, entonce crear nuevo usuario
                                            if (usuarioExiste === -1) {
                                                if (subirlista.usuarioExcel[i].email && utilidadesSvc.isEmailValid(subirlista.usuarioExcel[i].email) && subirlista.usuarioExcel[i].password) {
                                                    subirlista.crearNuevoUsuario(subirlista.usuarioExcel[i], i);
                                                } else {
                                                    subirlista.enviarAlLog('El email o la contraseña de ' + subirlista.usuarioExcel[i].nombre + ' no son válidos, ' +
                                                        'por lo que no se creará un usuario pero sí un invitado.', 'info');
                                                    subirlista.guardarInvitadoSinUsuario(subirlista.usuarioExcel[i], i);
                                                }
                                            }
                                            //Si el usuario sí existe, entonces
                                            else {
                                                //Si existe pero no tenía email, entonces se podría crear un nuevo usuario
                                                if (!subirlista.allInvitados[usuarioExiste].email && subirlista.usuarioExcel[i].email && utilidadesSvc.isEmailValid(subirlista.usuarioExcel[i].email) && subirlista.usuarioExcel[i].password) {
                                                    subirlista.crearNuevoUsuario(subirlista.usuarioExcel[i], i, usuarioExiste);
                                                }
                                                //solamente actualizar info del usuario
                                                else {
                                                    subirlista.actualizarInvitado(subirlista.allInvitados[usuarioExiste].$id, usuarioExiste, subirlista.usuarioExcel[i]);
                                                }
                                            }
                                            subirlista.uploadProgress = ((i + 1) / usuariosExcel.length) * 100;
                                        }, 2000);
                                    })(i);
                                }
                            });
                    }
                });
        }
    };

    $scope.$watch('subirlistaCtrl.uploadProgress', 
        function(newValue, oldValue) {
            if(newValue === 100){
                blockUI.stop();
            }
    });


    subirlista.crearNuevoUsuario = function (nuevoUsuario, i, viejoInvitadoIndex) {
        firebaseSvc.crearUsuario(nuevoUsuario)
            .then(function (userResult) {
                if (userResult && userResult.uid) {
                    firebaseSvc.getInvitadoByUid(userResult.uid)
                        .then(function (invitado) {
                            subirlista.enviarAlLog("Éxito creando el usuario: " + subirlista.usuarioExcel[i].nombre, 'bueno');
                            subirlista.guardarInvitado(invitado, i);
                            if (viejoInvitadoIndex !== undefined) {
                                subirlista.deleteInvitadoByUid(viejoInvitadoIndex);
                            }
                        });
                } else {
                    if (userResult === 'EMAIL_TAKEN') {
                        firebaseSvc.getInvitadoByEmail(nuevoUsuario.email)
                            .then(function (invitado) {
                                subirlista.guardarInvitadoArray(invitado, i);
                                if (viejoInvitadoIndex !== undefined) {
                                    subirlista.deleteInvitadoByUid(viejoInvitadoIndex);
                                }
                            });
                    }
                }
            })
            .catch(function (error) {
                subirlista.enviarAlLog(error, 'error');
            });
    }

    subirlista.deleteInvitadoByUid = function (viejoInvitadoIndex) {
        subirlista.allInvitados.$remove(viejoInvitadoIndex)
            .then(function (ref) {
                subirlista.enviarAlLog("Invitado " + ref.key() + " borrado satisfactoriamente.", 'bueno');
            });
    }


    subirlista.invitadoExiste = function (invitadoExcel) {
        var _index = -1;
        subirlista.allInvitados.forEach(
            function (value, index) {
                if (invitadoExcel.nombre === value.nombre) {
                    _index = index;
                }
            }
        );
        return _index;
    }

    subirlista.actualizarInvitado = function (uid, index, nuevaInfo) {
        var _this = this;
        this.allInvitados[index].nombre = nuevaInfo.nombre;
        this.allInvitados[index].telefono = nuevaInfo.telefono ? nuevaInfo.telefono : null;
        this.allInvitados[index].status = nuevaInfo.status;
        this.allInvitados[index].grupoId = nuevaInfo.grupoId;
        this.allInvitados[index].isAdmin = nuevaInfo.isAdmin === 'true' ? true : false;
        this.allInvitados[index].email = nuevaInfo.email && utilidadesSvc.isEmailValid(nuevaInfo.email) ? nuevaInfo.email : null;
        this.allInvitados.$save(index)
            .then(function (success) {
                subirlista.enviarAlLog("Éxito actualizando invitado: " + _this.allInvitados.$getRecord(success.key()).nombre, 'bueno'); //success.key());
            }, function (error) {
                subirlista.enviarAlLog("Error actualizando invitado: " + _this.allInvitados.$getRecord(success.key()).nombre + ". Error: " + error, 'error');
            });
    }

    subirlista.guardarInvitado = function (invitado, i) {
        invitado.nombre = subirlista.usuarioExcel[i].nombre;
        invitado.telefono = subirlista.usuarioExcel[i].telefono ? subirlista.usuarioExcel[i].telefono : null;
        invitado.status = subirlista.usuarioExcel[i].status;
        invitado.grupoId = subirlista.usuarioExcel[i].grupoId;
        invitado.isAdmin = subirlista.usuarioExcel[i].isAdmin === 'true' ? true : false;
        invitado.email = subirlista.usuarioExcel[i].email ? subirlista.usuarioExcel[i].email : null;
        invitado.$save()
            .then(function (success) {
                subirlista.enviarAlLog("Éxito creando invitado: " + subirlista.usuarioExcel[i].nombre, 'bueno');
            }, function (error) {
                subirlista.enviarAlLog("Error creando invitado: " + subirlista.usuarioExcel[i].nombre + ". Error: " + error, 'error');
            });
    }

    subirlista.guardarInvitadoArray = function (invitado, i) {
        if (invitado && invitado.length > 0) {
            invitado[0].nombre = subirlista.usuarioExcel[i].nombre;
            invitado[0].telefono = subirlista.usuarioExcel[i].telefono ? subirlista.usuarioExcel[i].telefono : null;
            invitado[0].status = subirlista.usuarioExcel[i].status;
            //invitado[0].uid = subirlista.usuarioExcel[i].uid; No es necesario actualizarlo
            invitado[0].grupoId = subirlista.usuarioExcel[i].grupoId;
            invitado[0].isAdmin = subirlista.usuarioExcel[i].isAdmin === 'true' ? true : false;
            invitado[0].email = subirlista.usuarioExcel[i].email;
            invitado.$save(0)
                .then(function (success) {
                    subirlista.enviarAlLog("Éxito guardando a: " + subirlista.usuarioExcel[i].nombre, 'bueno');
                }, function (error) {
                    subirlista.enviarAlLog("Error guardando a: " + subirlista.usuarioExcel[i].nombre + " " + error, 'error');
                });
        } else {
            subirlista.enviarAlLog("No se creará al invitado " + subirlista.usuarioExcel[i].nombre +
                " porque el email " + subirlista.usuarioExcel[i].email + " ya existe pero nunca se creo un invitado relacionado." +
                " Contacte al proveedor para que borre el usuario manualmente.", 'error');
        }
    }

    subirlista.guardarInvitadoSinUsuario = function (invitado, i) {
        var _this = this,
            objInvitado = {
                nombre: subirlista.usuarioExcel[i].nombre,
                email: null,
                isAdmin: subirlista.usuarioExcel[i].isAdmin === 'true' ? true : false,
                grupoId: subirlista.usuarioExcel[i].grupoId,
                status: subirlista.usuarioExcel[i].status,
                telefono: subirlista.usuarioExcel[i].telefono ? subirlista.usuarioExcel[i].telefono : null
            }
        subirlista.allInvitados.$add(objInvitado)
            .then(function (ref) {
                var id = ref.key();
                subirlista.enviarAlLog('Éxito creando el usuario ' + objInvitado.nombre + ' con id: ' + id, 'bueno');
                var index = subirlista.allInvitados.$indexFor(id);
                subirlista.allInvitados.$save(index)
                    .then(function (ref) {
                        subirlista.enviarAlLog('Se agregó el usuario ' + _this.allInvitados.$getRecord(id).nombre + ' a la lista de invitados.', 'bueno');
                    });
            });
    }

    subirlista.actualizarInvitadoSinEmail = function (invitado, i) {
        invitado.nombre = subirlista.usuarioExcel[i].nombre;
        invitado.telefono = subirlista.usuarioExcel[i].telefono ? subirlista.usuarioExcel[i].telefono : null;
        invitado.email = subirlista.usuarioExcel[i].email ? subirlista.usuarioExcel[i].email : null;
        invitado.isAdmin = subirlista.usuarioExcel[i].isAdmin === 'true' ? true : false;
        invitado.grupoId = subirlista.usuarioExcel[i].grupoId;
        invitado.status = subirlista.usuarioExcel[i].status;
        invitado.$save(objInvitado)
            .then(function (ref) {
                var id = ref.key();
                subirlista.enviarAlLog('Agregando invitado sin email al array de invitados: ' + id, 'bueno');
                var index = subirlista.allInvitados.$indexFor(id);
                subirlista.allInvitados.$save(index)
                    .then(function (ref) {
                        subirlista.enviarAlLog('Guardado usuario sin email:' + id, 'bueno');
                    });
            });
    }

    subirlista.enviarAlLog = function (msj, tipo) {
        subirlista.logs.push({
            msj: msj,
            tipo: tipo
        });
    }
}
