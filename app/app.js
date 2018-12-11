'use strict';
/*global angular, ApplicationConfig, Firebase, ApplicationRun */
angular
    .module('bodamauyjesy', ['ngRoute', 'firebase', 'toaster', 'ngAnimate', 'ui.bootstrap'])
    .constant('FirebaseUrl', 'https://mauyjesy.firebaseio.com')
    .service('rootRef', ['FirebaseUrl', Firebase])
    .config(ApplicationConfig)
    .run(ApplicationRun);

ApplicationConfig.$inject = ['$routeProvider'];
ApplicationRun.$inject = ['$rootScope', '$location', '$anchorScroll', '$timeout'];

function ApplicationRun($rootScope, $location, $anchorScroll, $timeout) {
    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        //$element.scrollTop(0);
        $location.replace();
        if (current.originalPath !== '/' && current.originalPath !== '') {
            $location.hash('rsvp');
        } else {
            if (previous && previous.originalPath !== '/' && previous.originalPath !== '') {
                $location.hash('rsvp');
            } else {
                $location.hash('logo');
            }
        }
        $anchorScroll();
    });
    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $location.path("/");
        }
    });
    $timeout(function () {
        $('.loaderOverlay').fadeOut('slow');
    });

}

function ApplicationConfig($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'app/login.html',
            controller: 'loginController',
            controllerAs: 'loginCtrl'
        })
        .when('/rsvp', {
            templateUrl: 'app/rsvp.html',
            controller: 'rsvpController',
            controllerAs: 'rsvpCtrl',
            resolve: {
                userInfo: function (rootRef, $firebaseObject, $route) {
                    var invitadosRef = rootRef.child('invitados');
                    return $firebaseObject(invitadosRef.child($route.current.params.uid)).$loaded();
                },
                currentAuth: function ($firebaseAuth, rootRef) {
                    return $firebaseAuth(rootRef).$requireAuth();
                }
            }
        })
        .when('/nuevaContrasena1', {
            templateUrl: 'app/nuevacontrasena1.html',
            controller: 'envContController',
            controllerAs: 'envContCtrl'
        })
        .when('/nuevaContrasena2', {
            templateUrl: 'app/nuevacontrasena2.html',
            controller: 'nvaContController',
            controllerAs: 'nvaContCtrl'
        })
        .when('/cambiarContrasena', {
            templateUrl: 'app/cambiarContrasena.html',
            controller: 'cambiarContController',
            controllerAs: 'cambiarContCtrl'
        });
}
