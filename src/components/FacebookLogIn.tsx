import * as React from 'react';
import Api from '../Api';
// TODO create showIntroLogInModal(); for give more information to user why do we need this information
import '../scss/style.scss'

const FacebookLogIn: React.FunctionComponent<IProps> = props => {
    const handleOnClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
        const facebookService = new FacebookService();
        try {
            event.preventDefault();
            document.getElementById('fb-login').style.display = 'none';
            document.getElementById('loading').style.display = 'block';
            var response = await facebookService.logIn();
            let userInfo = await facebookService.getUserInfo(response);
            await facebookService.connect(userInfo);

            location.href = safeUrlRelativeToRoot(props.returnUrlRelativeToRoot);

        } catch (ex) {
            facebookService.handleException(ex);
            document.getElementById('fb-login').style.display = 'block';
            document.getElementById('loading').style.display = 'none';
        }
    };

    const safeUrlRelativeToRoot = (returnUrl: string): string => {
        if (!returnUrl) return '/';

        // Add / prefix to make replace work both with and without / in return URL
        // Expected output is URL has / prefix
        return `/${returnUrl}`.replace(/\/+/, '/');
    };


    return (
        <div className='modal-login'>
            <div className='container-facebook'>
                <div id='fb-login'>
                    <p className='head-text'>Log in to Codesanook</p>
                    <a className='btn-fb-login' onClick={handleOnClick}>
                        <i className='fa fa-facebook-official' aria-hidden='true'></i>
                        Log In with Facebook
                    </a>
                    <div className='body-text'>
                        <p>เราจำเป็นต้องให้คุณ log in ด้วย facebook เนื่องจาก</p>
                        <p>codesanook.com ต้องการให้คุณใช้งานได้ง่าย</p>
                        <p>ลดขั้นตอนการลงทะเบียนที่ต้องกรอกข้อมูลต่างๆ</p>
                        <p>เราเพียงต้องการข้อมูลเหล่านี้จาก Facebook ของคุณเท่านี้</p>
                        <p>- ชื่อ</p>
                        <p>- อีเมล์</p>
                    </div>
                    <div className='footer'>
                        <a className='btn-back' href='/'>Back to home</a>
                    </div>
                </div>
                <div id='loading' >
                    <p>Logging in...</p>
                    <div className='spinner'>
                        <div className='double-bounce1'></div>
                        <div className='double-bounce2'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface IProps {
    returnUrlRelativeToRoot?: string;
}

interface IFb {
    login(callback: (response: any) => any, scope: FbScope): void;
    getLoginStatus(callback: (response: any) => any, forceGetLogInStatus: boolean): void;
    api(url: string, callback: (response: any) => any): void;
    api(url: string, method: string, callback: (response: any) => any): void;
}

declare let FB: IFb;//reference existing variable from Facebook SDK

// Custom exception
class MissingFacebookPermissionException extends Error {
    constructor(public missingPermission: string) {
        super(`missing ${missingPermission} permission`);
    }
}

class FbScope {
    public return_scopes: boolean = true;
    public scope: string;

    constructor(private requiredPermissions: string[]) {
        this.scope = requiredPermissions.join(',');
    }

    validateHasAllRequiredPermissions(grantedPermissions: string): void {
        for (let index = 0; index < this.requiredPermissions.length - 1; index++) {
            let permissionToCheck = this.requiredPermissions[index];
            let foundIndex = grantedPermissions.indexOf(permissionToCheck);
            console.log(`found permission at index ${foundIndex}`);
            if (foundIndex < 0) {
                throw new MissingFacebookPermissionException(permissionToCheck);
            }
        }
    }
}

class FacebookService {
    private readonly fbScope: FbScope = new FbScope(['email', 'public_profile']);

    logIn(): Promise<any> {
        let promise = new Promise<void>((resolve, reject) => {
            FB.login(response => {
                try {
                    if (response.status === 'connected') {
                        let grantedScopes: string = response.authResponse.grantedScopes;
                        // Also validate if user allow all required permission
                        this.fbScope.validateHasAllRequiredPermissions(grantedScopes);
                        resolve(response);
                    } else if (response.status === 'not_authorized') {
                        // The person is logged into Facebook, but not your app.
                        reject(response);
                    } else {
                        // The person is not logged into Facebook, so we're not sure if
                        // they are logged into this app or not.
                        reject('user not logged into Facebook');
                    }

                } catch (ex) {
                    reject(ex);
                }

            }, this.fbScope);
        });
        return promise;
    }

    getLogInStatus(): Promise<any> {
        let promise = new Promise<void>((resolve, reject) => {
            const forceGetLogInStatus = true;
            FB.getLoginStatus(response => {
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
                    console.log('get log in status \n%o\n', response);
                    resolve(response);

                } catch (ex) {
                    reject(ex);
                }

            }, forceGetLogInStatus);
        });
        return promise;
    }

    getUserInfo(response: any): Promise<any> {
        let promise = new Promise<any>((resolve, reject) => {
            const authResponse = response.authResponse;
            const grantedScopes = response.authResponse.grantedScopes;
            console.log('grantedScopes \n%o\n', grantedScopes);
            const graphApiUrl = `/${authResponse.userID}?fields=picture.width(540).height(540),id,first_name,last_name,email`;

            FB.api(graphApiUrl, response => {
                if (!response || response.error) {
                    reject(response ? response.error : 'error getting user info')
                } else {
                    let userInfo = {
                        facebookAccessToken: authResponse.accessToken,
                        facebookAppScopeUserId: response.id,
                        profilePictureUrl: response.picture.data.url,
                        firstName: response.first_name,
                        lastName: response.last_name,
                        email: response.email
                    };
                    resolve(userInfo);
                }
            });
        });

        return promise;
    }

    async connect(user: any): Promise<any> {
        const url = '/facebook/connect';// URL is from custom route
        return Api.post<any>(url, user);
    }

    async handleException(response: any): Promise<void> {
        if (!(response instanceof MissingFacebookPermissionException)) {
            alert('Error, please retry log in again');
            return;
        }

        var ex = response as MissingFacebookPermissionException;
        await this.removeApp();
        alert(`Error, please allow '${ex.missingPermission}' permission`);
    };

    // User can start log in again without any permission issue
    removeApp(): Promise<void> {
        let promise = new Promise<void>((resolve, reject) => {
            FB.api('/me/permissions', 'delete', (response: any) => {
                try {
                    console.log('remove app response \n%o\n', response);
                    resolve();
                } catch (ex) {
                    reject(ex);
                }
            });
        });

        //return promise immediately
        return promise;
    }
}

export default FacebookLogIn;
