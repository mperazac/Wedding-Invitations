'use strict';
/*global angular, ApplicationConfig, Firebase, ApplicationRun */
angular
    .module('adminbodamauyjesy', ['ngRoute', 'firebase', 'ui.bootstrap', 
        'chart.js', 'toaster', 'blockUI', 'cgPrompt'])
    .constant('FirebaseUrl', 'https://mauyjesy.firebaseio.com')
    .constant('globalInfo', {
        sitioWebName: 'Boda de Mau & Jesy'
    })
    .service('rootRef', ['FirebaseUrl', Firebase])
    .config(ApplicationConfig)
    .run(ApplicationRun);

ApplicationConfig.$inject = ['$routeProvider', '$locationProvider', 'blockUIConfig'];
ApplicationRun.$inject = ['$rootScope', '$location', 'rootRef'];

function ApplicationRun($rootScope, $location, rootRef) {
    if (rootRef.getAuth()) {
        $rootScope.isAuthenticated = true;
    } else {
        $rootScope.isAuthenticated = false;
    }
    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        $location.replace();
        if (error === "AUTH_REQUIRED") {
            $rootScope.isAuthenticated = false;
            $location.path("/login");
        }
    });
}

function ApplicationConfig($routeProvider, $locationProvider, blockUIConfig) {
    blockUIConfig.message = 'Cargando...';
    blockUIConfig.delay = 100;
    blockUIConfig.blockBrowserNavigation = true;
    $routeProvider
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl'
        })
        .when('/', {
            templateUrl: 'resumen.html',
            controller: 'resumenController',
            controllerAs: 'resumenCtrl',
            resolve: {
                currentAuth: function ($firebaseAuth, rootRef) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return $firebaseAuth(rootRef)
                        .$requireAuth();
                },
                allInvitados: function ($firebaseArray, rootRef) {
                    var invitadosRef = rootRef.child('invitados');
                    return $firebaseArray(invitadosRef)
                        .$loaded();
                }
            }
        })
        .when('/checklist', {
            templateUrl: 'checklist.html',
            controller: 'checklistController',
            controllerAs: 'checklistCtrl',
            resolve: {
                currentAuth: function ($firebaseAuth, rootRef) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return $firebaseAuth(rootRef)
                        .$requireAuth();
                }
            }
        })
        .when('/listaCompletaInvitados', {
            templateUrl: 'listaCompletaInvitados.html',
            controller: 'listaCompletaInvitadosController',
            controllerAs: 'listaCtrl',
            resolve: {
                currentAuth: function ($firebaseAuth, rootRef) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return $firebaseAuth(rootRef)
                        .$requireAuth();
                },
                allInvitados: function ($firebaseArray, rootRef) {
                    var invitadosRef = rootRef.child('invitados');
                    return $firebaseArray(invitadosRef.orderByChild("grupoId"))
                        .$loaded();
                }
            }
        })
        .when('/nuevaContrasena1', {
            templateUrl: 'nuevacontrasena1.html',
            controller: 'envContController',
            controllerAs: 'envContCtrl'
        })
        .when('/nuevaContrasena2', {
            templateUrl: 'nuevacontrasena2.html',
            controller: 'nvaContController',
            controllerAs: 'nvaContCtrl'
        })
        .when('/subirlista', {
            templateUrl: 'subirlista.html',
            controller: 'subirlistaController',
            controllerAs: 'subirlistaCtrl',
            resolve: {
                currentAuth: function ($firebaseAuth, rootRef) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return $firebaseAuth(rootRef)
                        .$requireAuth();
                }
            }
        })
        .when('/cambiarContrasena', {
            templateUrl: 'cambiarContrasena.html',
            controller: 'cambiarContController',
            controllerAs: 'cambiarContCtrl'
        });
}
