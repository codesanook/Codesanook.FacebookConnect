var App;
(function (App) {
    var Services;
    (function (Services) {
        class FbScope {
            constructor(requiredPermissions) {
                this.requiredPermissions = requiredPermissions;
                this.return_scopes = true;
                this.scope = requiredPermissions.join(",");
            }
            validateHasAllRequiredPermissions(grantedPermissions) {
                for (var index = 0; index < this.requiredPermissions.length - 1; index++) {
                    var permissionToCheck = this.requiredPermissions[index];
                    var foundIndex = grantedPermissions.indexOf(permissionToCheck);
                    console.log(`found permission at index ${foundIndex}`);
                    if (foundIndex < 0) {
                        throw new MissingFacebookPermissionExcepiton(permissionToCheck);
                    }
                }
            }
        }
        Services.FbScope = FbScope;
        class MissingFacebookPermissionExcepiton extends Error {
            constructor(missingPermission) {
                super(`missing ${missingPermission} permission`);
                this.missingPermission = missingPermission;
            }
        }
        Services.MissingFacebookPermissionExcepiton = MissingFacebookPermissionExcepiton;
        class FacebookService {
            constructor($q, $http, $document) {
                this.$q = $q;
                this.$http = $http;
                this.$document = $document;
                this.fbScope = new FbScope(["email", "public_profile"]);
            }
            getAntiForgeryToken() {
                return $("[name='__RequestVerificationToken']").val();
            }
            logIn() {
                var deferred = this.$q.defer();
                FB.login((response) => {
                    try {
                        if (response.status === 'connected') {
                            var grantedScopes = response.authResponse.grantedScopes;
                            this.fbScope.validateHasAllRequiredPermissions(grantedScopes);
                            deferred.resolve(response);
                        }
                        else if (response.status === 'not_authorized') {
                            deferred.reject(response);
                        }
                        else {
                            deferred.reject("user not logged into Facebook");
                        }
                    }
                    catch (ex) {
                        console.log("dir");
                        console.dir(ex);
                        console.log("end dir");
                        deferred.reject(ex);
                    }
                }, this.fbScope);
                return deferred.promise;
            }
            getLogInStatus() {
                var deferred = this.$q.defer();
                const forceGetLogInStatus = true;
                FB.getLoginStatus((response) => {
                    try {
                        console.log("get log in status \n%o\n", response);
                        deferred.resolve(response);
                    }
                    catch (ex) {
                        deferred.reject(ex);
                    }
                }, forceGetLogInStatus);
                return deferred.promise;
            }
            getUserInfo(response) {
                var authResponse = response.authResponse;
                var grantedScopes = response.authResponse.grantedScopes;
                console.log("grantedScopes \n%o\n", grantedScopes);
                var deferred = this.$q.defer();
                var graphApiUrl = sprintf('/%s?fields=picture.width(540).height(540),id,first_name,last_name,email', authResponse.userID);
                FB.api(graphApiUrl, (queryResponse) => {
                    var userInfo = {};
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
            removeApp() {
                var deferred = this.$q.defer();
                FB.api('/me/permissions', 'delete', (response) => {
                    try {
                        console.log("remove app response \n%o\n", response);
                        deferred.resolve(response);
                    }
                    catch (ex) {
                        deferred.reject(ex);
                    }
                });
                return deferred.promise;
            }
            connect(user) {
                var deferred = this.$q.defer();
                var url = sprintf("/facebook/connect/");
                var method = "POST";
                var req = {
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
                this.$http(req).then((response) => {
                    deferred.resolve({});
                }).catch((response) => {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            isExistingUser(user) {
                var deferred = this.$q.defer();
                var url = sprintf("%s/users/existing?facebookId=%s", Setting.apiEndpoint, user.facebookAppScopeUserId);
                var req = {
                    method: "GET",
                    url: url,
                    headers: {
                        'Content-Type': "application/json",
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                };
                this.$http(req)
                    .then((response) => {
                    var data = { existingUser: response.data.existingUser };
                    deferred.resolve({ data: data });
                }).catch((response) => {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            isExistingUserWithEmail(user) {
                var deferred = this.$q.defer();
                var url = sprintf("%s/users/existing?email=%s", Setting.apiEndpoint, user.emailFromFacebook);
                var req = {
                    method: "GET",
                    url: url,
                    headers: {
                        'Content-Type': "application/json",
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                };
                this.$http(req)
                    .then((response) => {
                    deferred.resolve({
                        data: {
                            existingUser: response.data.existingUser
                        }
                    });
                })
                    .catch((response) => {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            updateUserWithFacebook(user) {
                var deferred = this.$q.defer();
                var url = sprintf("%s/users/facebook", Setting.apiEndpoint);
                var req = {
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
                    .then((response) => {
                    deferred.resolve({});
                }).catch((response) => {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
            registerNewUser(user) {
                var deferred = this.$q.defer();
                var url = sprintf("%s/users/facebook", Setting.apiEndpoint);
                var req = {
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
                    .then((response) => {
                    deferred.resolve({ data: { userId: response } });
                }).catch((response) => {
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
            }
            ;
            onSuccessLoggedIn(callback) {
                callback();
            }
            onErrorLoggedIn(callback) {
                callback();
            }
        }
        Services.FacebookService = FacebookService;
        angular.module("facebookConnect")
            .service("facebookService", ["$q", "$http", "$document", FacebookService]);
    })(Services = App.Services || (App.Services = {}));
})(App || (App = {}));
