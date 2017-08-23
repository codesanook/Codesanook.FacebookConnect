var App;
(function (App) {
    var Contorllers;
    (function (Contorllers) {
        $(document).on("fbLoaded", (e, ...args) => {
            console.log("e=%s, args[0]=%s", e, args[0]);
        });
        class ControllerBase {
            delay(delayExpression, delay) {
                window.setTimeout(() => {
                    delayExpression();
                }, delay);
            }
            redirect(url) {
                window.location.href = url;
            }
            getCurrentUrl() {
                return window.location.href;
            }
            ;
        }
        Contorllers.ControllerBase = ControllerBase;
        class FacebookLogInController extends ControllerBase {
            constructor(facebookService, $q, $scope) {
                super();
                this.facebookService = facebookService;
                this.$q = $q;
                this.$scope = $scope;
                this.userName = "";
                this.isLogIn = false;
                this.returnUrl = null;
                this.scope = $scope;
                this.scope.init = (returnUrl) => {
                    this.returnUrl = returnUrl;
                    console.log("returnUrl %s", this.returnUrl);
                };
            }
            logIn() {
                console.log("log in called");
                return this.facebookService.logIn()
                    .then((response) => {
                    return this.facebookService.getUserInfo(response);
                })
                    .then((userInfo) => {
                    console.log(userInfo);
                    return this.facebookService.connect(userInfo);
                })
                    .then((response) => {
                    this.isLogIn = true;
                    if (this.returnUrl) {
                        this.redirect(this.returnUrl);
                    }
                    else {
                        this.redirect("/");
                    }
                })
                    .catch((response) => {
                    this.handleException(response);
                })
                    .finally(() => {
                    console.log("finally");
                });
            }
            handleException(response) {
                if (response instanceof App.Services.MissingFacebookPermissionExcepiton) {
                    var ex = response;
                    this.facebookService.removeApp()
                        .then((response) => {
                        alert(`Error, please allow "${ex.missingPermission}" permission`);
                    }).catch((response) => {
                        console.error(response);
                    });
                }
                else {
                    alert("Error, please retry log in again");
                }
            }
        }
        angular.module("facebookConnect")
            .controller("facebookLogInController", ["facebookService", "$q", "$scope", FacebookLogInController]);
    })(Contorllers = App.Contorllers || (App.Contorllers = {}));
})(App || (App = {}));
