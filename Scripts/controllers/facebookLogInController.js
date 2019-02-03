"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var facebookService_1 = require("../services/facebookService");
$(document).on("fbLoaded", function (e) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    console.log("e=%s, args[0]=%s", e, args[0]);
});
var ControllerBase = (function () {
    function ControllerBase() {
    }
    ControllerBase.prototype.delay = function (delayExpression, delay) {
        window.setTimeout(function () {
            delayExpression();
        }, delay);
    };
    ControllerBase.prototype.redirect = function (url) {
        window.location.href = url;
    };
    ControllerBase.prototype.getCurrentUrl = function () {
        return window.location.href;
    };
    ;
    return ControllerBase;
}());
exports.ControllerBase = ControllerBase;
var FacebookLogInController = (function (_super) {
    __extends(FacebookLogInController, _super);
    function FacebookLogInController(facebookService) {
        var _this = _super.call(this) || this;
        _this.facebookService = facebookService;
        return _this;
    }
    FacebookLogInController.prototype.init = function (returnUrl) {
        this.returnUrl = returnUrl;
        console.log("returnUrl %s", this.returnUrl);
    };
    FacebookLogInController.prototype.logIn = function () {
        var _this = this;
        console.log("log in called");
        this.facebookService.logIn()
            .then(function (response) {
            return _this.facebookService.getUserInfo(response);
        })
            .then(function (userInfo) {
            console.log(userInfo);
            return _this.facebookService.connect(userInfo);
        })
            .then(function (response) {
            _this.isLogIn = true;
            if (_this.returnUrl) {
                _this.redirect(_this.returnUrl);
            }
            else {
                _this.redirect("/");
            }
        })
            .catch(function (response) {
            _this.handleException(response);
        })
            .finally(function () {
            console.log("finally");
        });
    };
    FacebookLogInController.prototype.handleException = function (response) {
        if (response instanceof facebookService_1.MissingFacebookPermissionExcepiton) {
            var ex = response;
            this.facebookService.removeApp()
                .then(function (response) {
                alert("Error, please allow \"" + ex.missingPermission + "\" permission");
            }).catch(function (response) {
                console.error(response);
            });
        }
        else {
            alert("Error, please retry log in again");
        }
    };
    return FacebookLogInController;
}(ControllerBase));
exports.default = FacebookLogInController;
