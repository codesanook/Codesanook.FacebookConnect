//http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide/
interface JQuery {
    modal(): JQuery;
}

module App.Services {

    declare function sprintf(format: string, ...val: any[]): string;

    export interface ISetting {
        apiEndpoint: string;
    }

    export class FbScope {

        public return_scopes: boolean = true;
        public scope: string;

        constructor(private requiredPermissions: string[]) {
            this.scope = requiredPermissions.join(",");
        }

        validateHasAllRequiredPermissions(grantedPermissions: string): void {
            for (var index = 0; index < this.requiredPermissions.length - 1; index++) {
                var permissionToCheck = this.requiredPermissions[index];
                var foundIndex = grantedPermissions.indexOf(permissionToCheck);
                console.log(`found permission at index ${foundIndex}`);

                if (foundIndex < 0) {
                    //throw new Error(`Please log in again and allow ${permissionToCheck} permission.`);
                    throw new MissingFacebookPermissionExcepiton(permissionToCheck);
                }
            }
        }
    }


    export interface IFb {
        login(callback: (response: any) => any, scope: FbScope): void;
        getLoginStatus(callback: (response: any) => any, forceGetLogInStatus: boolean): void;
        api(url: string, callback: (response: any) => any): void;
        api(url: string, method: string, callback: (response: any) => any): void;
    }

    //define global variable
    declare var FB: IFb;
    declare var Setting: ISetting;
    declare var antiForgeryToken: string;

    export class MissingFacebookPermissionExcepiton extends Error {
        constructor(public missingPermission: string) {
            super(`missing ${missingPermission} permission`);

        }
    }

    export class FacebookService {

        private fbScope: FbScope = new FbScope(["email", "public_profile"]);

        private getAntiForgeryToken() {
            return $("[name='__RequestVerificationToken']").val();
        }

        constructor(
            private $q: ng.IQService,
            private $http: ng.IHttpService,
            private $document: ng.IDocumentService) {
        }

        logIn(): ng.IPromise<any> {

            var deferred = this.$q.defer();
            FB.login((response: any) => {
                try {
                    if (response.status === 'connected') {

                        var grantedScopes: string = response.authResponse.grantedScopes;
                        this.fbScope.validateHasAllRequiredPermissions(grantedScopes);

                        deferred.resolve(response);
                    } else if (response.status === 'not_authorized') {
                        // The person is logged into Facebook, but not your app.
                        deferred.reject(response);
                    } else {
                        // The person is not logged into Facebook, so we're not sure if
                        // they are logged into this app or not.
                        deferred.reject("user not logged into Facebook");
                    }

                } catch (ex) {
                    console.log("dir");
                    console.dir(ex);
                    console.log("end dir");
                    deferred.reject(ex);
                }


            }, this.fbScope);
            return deferred.promise;
        }


        getLogInStatus(): ng.IPromise<any> {

            var deferred = this.$q.defer();
            const forceGetLogInStatus = true;
            FB.getLoginStatus((response: any) => {

                try {
                    // The response object is returned with a status field that lets the
                    // app know the current login status of the person.
                    // Full docs on the response object can be found in the documentation
                    // for FB.getLoginStatus().

                    //list of response.status 
                    //'connected', use connected to our app

                    //not_authorized, The person is logged into Facebook, but not your app.

                    //other status
                    // The person is not logged into Facebook, so we're not sure if
                    // they are logged into this app or not.

                    //useful properties that can get from response
                    //response.authResponse.userID,
                    //response.authResponse.accessToken

                    console.log("get log in status \n%o\n", response);
                    deferred.resolve(response);

                } catch (ex) {
                    deferred.reject(ex);
                }

            }, forceGetLogInStatus);

            return deferred.promise;
        }


        getUserInfo(response: any): ng.IPromise<any> {
            var authResponse = response.authResponse;
            var grantedScopes = response.authResponse.grantedScopes;
            console.log("grantedScopes \n%o\n", grantedScopes);
            var deferred = this.$q.defer();
            var graphApiUrl = sprintf('/%s?fields=picture.width(540).height(540),id,first_name,last_name,email',
                authResponse.userID);

            FB.api(graphApiUrl, (queryResponse: any) => {
                var userInfo: any = {};
                userInfo.facebookAccessToken = authResponse.accessToken;
                userInfo.facebookAppScopeUserId = queryResponse.id;
                userInfo.profilePictureUrl = queryResponse.picture.data.url;
                userInfo.firstName = queryResponse.first_name;
                userInfo.lastName = queryResponse.last_name;
                userInfo.email = queryResponse.email;
                deferred.resolve(userInfo);
            });

            return deferred.promise;
        }

        removeApp(): ng.IPromise<any> {
            var deferred = this.$q.defer();
            FB.api('/me/permissions', 'delete', (response: any) => {

                try {
                    console.log("remove app response \n%o\n", response);
                    deferred.resolve(response);
                } catch (ex) {
                    deferred.reject(ex);
                }
            });
            //return promise immediately
            return deferred.promise;
        }

        connect(user: any) {
            var deferred = this.$q.defer();
            var url = sprintf("/facebook/connect/");

            var method = "POST";
            var req: ng.IRequestConfig = {
                method: method,
                url: url,
                headers: {
                    'Content-Type': "application/json",
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    '__RequestVerificationToken': this.getAntiForgeryToken()
                },
                data: user
            };

            this.$http(req).then((response: any) => {
                deferred.resolve({});
            }).catch((response: any) => {
                deferred.reject(response);
            });

            return deferred.promise;
        }

        isExistingUser(user: any) {
            var deferred = this.$q.defer();
            var url = sprintf("%s/users/existing?facebookId=%s",
                Setting.apiEndpoint, user.facebookAppScopeUserId);
            var req: ng.IRequestConfig = {
                method: "GET",
                url: url,
                headers: {
                    'Content-Type': "application/json",
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            };

            this.$http(req)
                .then((response: any) => {

                    var data = { existingUser: response.data.existingUser };
                    deferred.resolve({ data: data });

                }).catch((response: any) => {
                    deferred.reject(response);
                });

            return deferred.promise;
        }



        isExistingUserWithEmail(user: any) {
            var deferred = this.$q.defer();
            var url = sprintf("%s/users/existing?email=%s", Setting.apiEndpoint, user.emailFromFacebook);
            var req: ng.IRequestConfig = {
                method: "GET",
                url: url,
                headers: {
                    'Content-Type': "application/json",
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            };

            this.$http(req)
                .then((response: any) => {
                    deferred.resolve({
                        data: {
                            existingUser: response.data.existingUser
                        }
                    });
                })
                .catch((response: any) => {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        updateUserWithFacebook(user: any) {

            var deferred = this.$q.defer();
            var url = sprintf("%s/users/facebook", Setting.apiEndpoint);

            var req: ng.IRequestConfig = {
                method: "PUT",
                url: url,
                headers: {
                    'Content-Type': "application/json",
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                data: user
            };

            this.$http(req)
                .then((response: any) => {
                    deferred.resolve({});

                }).catch((response: any) => {
                    deferred.reject(response);
                });

            return deferred.promise;
        }

        registerNewUser(user: any) {
            var deferred = this.$q.defer();
            var url = sprintf("%s/users/facebook", Setting.apiEndpoint);
            var req: ng.IRequestConfig = {
                method: "POST",
                url: url,
                headers: {
                    'Content-Type': "application/json",
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                data: user
            };
            this.$http(req)
                .then((response: any) => {
                    deferred.resolve({ data: { userId: response } });
                }).catch((response: any) => {
                    deferred.reject({ data: response });
                });

            return deferred.promise;
        }

        showIntroLogInModal() {
            var jQueryObject = this.$document.find("#introLogIn");
            jQueryObject.modal();
        }

        requestUserLogIn() {
            var deferred = this.$q.defer();
            this.showIntroLogInModal();
            this.onSuccessLoggedIn(() => {
                deferred.resolve({});
            });

            this.onErrorLoggedIn(() => {
                deferred.reject({});
            });

            return deferred.promise;
        };

        onSuccessLoggedIn(callback: () => void): void {
            callback();
        }

        onErrorLoggedIn(callback: () => void): void {
            callback();
        }

    }

    angular.module("facebookConnect")
        .service("facebookService", ["$q", "$http", "$document", FacebookService]);
}