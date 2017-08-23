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
            constructor(facebookService, $q) {
                super();
                this.facebookService = facebookService;
                this.$q = $q;
                this.userName = "";
                this.isLogIn = false;
            }
            init(returnUrl) {
                console.log("returnUrl %s", returnUrl);
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
                    this.redirect("/");
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
            .controller("facebookLogInController", ["facebookService", "$q", FacebookLogInController]);
    })(Contorllers = App.Contorllers || (App.Contorllers = {}));
})(App || (App = {}));
