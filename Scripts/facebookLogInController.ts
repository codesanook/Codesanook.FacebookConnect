module App.Contorllers {

    $(document).on("fbLoaded", (e: JQueryEventObject, ...args: any[]) => {
        console.log("e=%s, args[0]=%s", e, args[0]);
    });

    export abstract class ControllerBase {

        delay(delayExpression: Function, delay: number): void {
            window.setTimeout(() => {
                delayExpression();
            }, delay);
        }

        redirect(url: string): void {
            window.location.href = url;
        }

        getCurrentUrl(): string {
            return window.location.href;
        };
    }

    class FacebookLogInController extends ControllerBase {
        userName = "";
        isLogIn = false;
        scope:any;   
        returnUrl:string = null; 

        constructor(
            private facebookService: Services.FacebookService,
            private $q: ng.IQService,
            private $scope: any){

            super();
            this.scope = $scope;

            this.scope.init = (returnUrl:string):void =>{
                this.returnUrl = returnUrl
                console.log("returnUrl %s", this.returnUrl);
            }
        }
        
        logIn() {
            console.log("log in called");

            return this.facebookService.logIn()
                .then((response: any) => {
                    //always get new user info
                    return this.facebookService.getUserInfo(response);
                })
                .then((userInfo: any) => {
                    console.log(userInfo);
                    //connect user with server side
                    return this.facebookService.connect(userInfo);
                })
                .then((response: any) => {
                    //action after logged in successfully
                    this.isLogIn = true;
                    if(this.returnUrl){
                        this.redirect(this.returnUrl);
                    }else{
                        this.redirect("/");
                    }
                })
                .catch((response: any) => {
                    this.handleException(response);
                })
                .finally(() => {
                    console.log("finally");
                });
        }

        handleException(response: any): void {
            if (response instanceof Services.MissingFacebookPermissionExcepiton) {
                var ex = response as Services.MissingFacebookPermissionExcepiton;
                this.facebookService.removeApp()
                    .then((response: any) => {
                        alert(`Error, please allow "${ex.missingPermission}" permission`);
                    }).catch((response: any) => {
                        console.error(response);
                    });
            } else {
                alert("Error, please retry log in again");
            }
        }

    }

    //register controller to module
    angular.module("facebookConnect")
        .controller("facebookLogInController",
        ["facebookService", "$q", "$scope", FacebookLogInController]);

}