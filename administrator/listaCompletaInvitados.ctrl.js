'use strict';
/*global angular, listaCompletaInvitadosController, confirm, alert */
angular
    .module('adminbodamauyjesy')
    .controller('listaCompletaInvitadosController', listaCompletaInvitadosController);

listaCompletaInvitadosController.$inject = ['firebaseSvc', 'allInvitados', '$scope',
    'exportarTabla', '$route', 'utilidadesSvc', 'toaster', 'prompt'
];

function listaCompletaInvitadosController(firebaseSvc, allInvitados, $scope,
    exportarTabla, $route, utilidadesSvc, toaster, prompt) {
    var listaCompleta = this,
        EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;

    listaCompleta.exportarTabla = exportarTabla;
    listaCompleta.allInvitados = allInvitados;
    listaCompleta.hideEditDeleteBtn = [];
    listaCompleta.hideSaveCancelBtn = [];
    listaCompleta.disableInput = [];
    listaCompleta.mostrarNuevoInvitado = false;
    listaCompleta.nuevoInvitado = {};
    listaCompleta.editando = false;
    listaCompleta.$route = $route;

    listaCompleta.allInvitados.forEach(
        function (value, index) {
            listaCompleta.disableInput[index] = true;
            listaCompleta.hideEditDeleteBtn[index] = true;
            listaCompleta.hideSaveCancelBtn[index] = false;
        }
    );

    listaCompleta.editar = function (index) {
        listaCompleta.disableInput[index] = false;
        listaCompleta.hideEditDeleteBtn[index] = false;
        listaCompleta.hideSaveCancelBtn[index] = true;
        listaCompleta.editando = true;
    };

    listaCompleta.borrar = function (index) {
        prompt({
            "title": "Confirmación",
            "message": "¿Seguro que quiere eliminar al invitado?",
            "buttons": [{
                "label": "Sí, estoy seguro",
                "primary": true,
                "cancel": false
            }, {
                "label": "No",
                "cancel": true
            }]
        }).then(function (result) {
            if (result.cancel === false) {
                //Si existe usuario, entonces tambien hay que borrarlo
                var emailToDelete = listaCompleta.allInvitados[index].email,
                    usuarioExiste = listaCompleta.usuarioExiste(listaCompleta.allInvitados[index]);
                listaCompleta.allInvitados.$remove(index)
                    .then(function (ref) {
                        if (usuarioExiste) {
                            firebaseSvc.borrarUsuario(ref.key(), emailToDelete)
                                .then(function (response) {
                                    firebaseSvc.getAllInvitados()
                                        .then(function (result) {
                                            toaster.pop('success', 'Éxito', 'Usuario borrado');
                                            listaCompleta.allInvitados = result;
                                        });
                                });
                        } else {
                            toaster.pop('success', 'Éxito', 'Usuario borrado');
                        }
                    });
            }
        });

    };

    listaCompleta.guardar = function (index) {
        if (listaCompleta.validarCampos(listaCompleta.allInvitados[index])) {
            /*NOTA: no estamos creando nuevos usuarios cuando se ingresa un email a un invitado
            que no tiene usuario porque no estamos mostrando el campo password al editar un usario
            Para crear un usuario de un invitado existente, se debe borrar el usuario y luego hacer
            clic en crear usuario.
            ** Puede cambiar si hago el Editar más completo y que incluya las claves. **
            */
            listaCompleta.allInvitados.$save(index)
                .then(function (ref) {
                    if (ref.key() === listaCompleta.allInvitados[index].$id) {
                        toaster.pop('success', 'Éxito', 'Invitado actualizado correctamente');
                    }
                });
            listaCompleta.disableInput[index] = true;
            listaCompleta.hideEditDeleteBtn[index] = true;
            listaCompleta.hideSaveCancelBtn[index] = false;
            listaCompleta.editando = false;
        }
    };

    listaCompleta.cancelar = function (index) {
        listaCompleta.disableInput[index] = true;
        listaCompleta.hideEditDeleteBtn[index] = true;
        listaCompleta.hideSaveCancelBtn[index] = false;
        listaCompleta.editando = false;
    };

    listaCompleta.cancelarNuevoInvitado = function () {
        listaCompleta.mostrarNuevoInvitado = false;
    };

    listaCompleta.agregarInvitado = function () {
        listaCompleta.nuevoInvitado = {};
        listaCompleta.nuevoInvitado.isAdmin = "No";
        listaCompleta.nuevoInvitado.status = "pendiente";
        listaCompleta.mostrarNuevoInvitado = true;
    };

    listaCompleta.guardarNuevoInvitado = function () {
        if (listaCompleta.validarCampos(listaCompleta.nuevoInvitado)) {
            var usuarioExiste = listaCompleta.usuarioExiste(listaCompleta.nuevoInvitado);
            //Si no existe, entonce crear nuevo usuario
            if (!usuarioExiste && listaCompleta.nuevoInvitado.email !== undefined && listaCompleta.nuevoInvitado.email !== '') {
                listaCompleta.crearNuevoUsuario(listaCompleta.nuevoInvitado);
            } else {
                if (usuarioExiste) {
                    toaster.pop('error', 'Ocurrió un error', 'El email ' + listaCompleta.nuevoInvitado.email + ' ya existe');
                } else {
                    listaCompleta.guardarInvitadoSinUsuario(listaCompleta.nuevoInvitado);
                }
            }
            listaCompleta.mostrarNuevoInvitado = false;
        }
    };

    listaCompleta.crearNuevoUsuario = function (newUsuario) {
        var nuevoUsuario = {
            email: newUsuario.email,
            password: newUsuario.password
        };
        firebaseSvc.crearUsuario(nuevoUsuario)
            .then(function (userResult) {
                if (userResult && userResult.uid) {
                    firebaseSvc.getInvitadoByUid(userResult.uid)
                        .then(function (invitado) {
                            listaCompleta.guardarInvitado(invitado);
                            listaCompleta.$route.reload();
                        });
                }
            })
            .catch(function (error) {
                toaster.pop('error', "Ocurrió un error", "El usuario no se pudo guardar");
                console.log(error);
            });
    };

    listaCompleta.guardarInvitado = function (invitado) {
        invitado.nombre = listaCompleta.nuevoInvitado.nombre;
        invitado.email = listaCompleta.nuevoInvitado.email;
        invitado.telefono = listaCompleta.nuevoInvitado.telefono ? listaCompleta.nuevoInvitado.telefono : null;
        invitado.grupoId = listaCompleta.nuevoInvitado.grupoId;
        invitado.status = listaCompleta.nuevoInvitado.status;
        invitado.isAdmin = listaCompleta.nuevoInvitado.isAdmin === 'true' ? true : false;
        invitado.$save()
            .then(function () {
                toaster.pop('success', 'Éxito', 'Éxito guardando a ' + listaCompleta.nuevoInvitado.nombre);
                console.log('Éxito guardando a: ' + listaCompleta.nuevoInvitado.nombre);
            }, function (error) {
                toaster.pop('error', 'Ocurrió un error', 'Error guardando a ' + listaCompleta.nuevoInvitado.nombre);
                console.log('Error guardando a: ' + listaCompleta.nuevoInvitado.nombre + ' ' + error);
            });
    };

    listaCompleta.guardarInvitadoSinUsuario = function (invitado) {
        var objInvitado = {
            nombre: invitado.nombre,
            email: null,
            telefono: invitado.telefono ? invitado.telefono : null,
            isAdmin: invitado.isAdmin === 'true' ? true : false,
            grupoId: invitado.grupoId,
            status: invitado.status
        };
        listaCompleta.allInvitados.$add(objInvitado)
            .then(function (ref) {
                var id = ref.key();
                //listaCompleta.logs.push('Se creó el usuario ' + objInvitado.nombre + ' con id: ' + id);
                var index = listaCompleta.allInvitados.$indexFor(id);
                listaCompleta.allInvitados.$save(index)
                    .then(function (ref) {
                        //listaCompleta.logs.push('Se agregó el usuario ' + _this.allInvitados.$getRecord(id).nombre + ' a la lista de invitados.');
                        listaCompleta.$route.reload();
                    });
            });
    };

    listaCompleta.usuarioExiste = function (invitado) {
        var result = false;
        listaCompleta.allInvitados.forEach(
            function (value) {
                if (invitado.email && invitado.email === value.email) {
                    result = true;
                }
                // if (invitado.nombre === value.nombre) {
                //     alert("El nombre ya existe");
                //     result = true;
                // }
            }
        );
        return result;
    };

    listaCompleta.borrarTodos = function () {
        prompt({
            "title": "Confirmación",
            "message": "¿Seguro que quiere eliminar a todos los invitados? También se borrarán los accesos de todos los invitados excepto el suyo.",
            "buttons": [{
                "label": "Sí, estoy seguro",
                "primary": true,
                "cancel": false
            }, {
                "label": "No",
                "cancel": true
            }]
        }).then(function (result) {
            if (result.cancel === false) {
                var authData = firebaseSvc.getAuth();
                if (authData) {
                    listaCompleta.allInvitados.forEach(
                        function (value, index) {
                            if (authData.uid !== value.$id) {
                                //Si existe usuario, entonces tambien hay que borrarlo
                                var emailToDelete = listaCompleta.allInvitados[index].email,
                                    usuarioExiste = listaCompleta.usuarioExiste(listaCompleta.allInvitados[index]);
                                listaCompleta.allInvitados.$remove(index)
                                    .then(function (ref) {
                                        if (usuarioExiste) {
                                            firebaseSvc.borrarUsuario(ref.key(), emailToDelete);
                                        }
                                    });
                            }
                        }
                    );
                    toaster.pop('success', 'Éxito', 'Se borraron todos los usuarios.');
                } else {
                    toaster.pop('info', 'Información', 'No se puedo retomar su Id, por lo tanto, no se elimirán todos los usuarios.');
                }
            }
        });
    };

    listaCompleta.validarCampos = function (invitadoPorGuardar) {
        if (invitadoPorGuardar.nombre === undefined || invitadoPorGuardar.nombre === '') {
            toaster.pop('error', 'Cuidado', 'Debe ingresar un nombre');
            return false;
        }
        if (invitadoPorGuardar.email !== undefined && invitadoPorGuardar.email !== '') {
            if (utilidadesSvc.isEmailValid(invitadoPorGuardar.email)) {
                if ((invitadoPorGuardar.password === undefined || invitadoPorGuardar.password === '') && !listaCompleta.editando) {
                    toaster.pop('error', 'Cuidado', 'Debe ingresar una contraseña');
                    return false;
                }
            } else {
                toaster.pop('error', 'Cuidado', 'Debe ingresar un email válido');
                return false;
            }
        }
        if (invitadoPorGuardar.grupoId === undefined || invitadoPorGuardar.grupoId === '' || isNaN(invitadoPorGuardar.grupoId)) {
            toaster.pop('error', 'Cuidado', 'Debe ingresar un número para el grupo al que pertenece el usuario');
            return false;
        }
        return true;
    };
}
