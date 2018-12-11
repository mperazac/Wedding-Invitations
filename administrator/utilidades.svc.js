'use strict';
/*global angular, utilidadesSvc */
angular
    .module('adminbodamauyjesy')
    .service('utilidadesSvc', utilidadesSvc);

utilidadesSvc.$inject = [];

function utilidadesSvc() {
    var emailRegExp = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/,
        service = {
            isEmailValid: isEmailValid
        };
    return service;

    function isEmailValid(email) {
        var isMatchRegex = false;
        if (email) {
            isMatchRegex = emailRegExp.test(email);
            if (isMatchRegex) {
                return true;
            }
        } else {
            return true;
        }
        return false;
    }
}