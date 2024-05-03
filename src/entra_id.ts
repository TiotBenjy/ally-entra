import { Oauth2Driver } from '@adonisjs/ally'
import type { HttpContext } from '@adonisjs/core/http'
import type { ApiRequestContract, RedirectRequestContract } from '@adonisjs/ally/types'
import type { EntraIdDriverConfig, EntraIdScopes, EntraIdToken } from './types/main.js'

export class EntraIdDriver extends Oauth2Driver<EntraIdToken, EntraIdScopes> {
    /**
     * The URL for the redirect request. The user will be redirected on this page
     * to authorize the request.
     *
     * Do not define query strings in this URL.
     */
    protected authorizeUrl = 'https://login.microsoftonline.com/{authType}/oauth2/v2.0/authorize'

    /**
     * The URL to hit to exchange the authorization code for the access token
     *
     * Do not define query strings in this URL.
     */
    protected accessTokenUrl = 'https://login.microsoftonline.com/{authType}/oauth2/v2.0/token'

    /**
     * The URL to hit to get the user details
     *
     * Do not define query strings in this URL.
     */
    protected userInfoUrl = 'https://graph.microsoft.com/v1.0/me'

    /**
     * The param name for the authorization code. Read the documentation of your oauth
     * provider and update the param name to match the query string field name in
     * which the oauth provider sends the authorization_code post redirect.
     */
    protected codeParamName = 'code'

    /**
     * The param name for the error. Read the documentation of your oauth provider and update
     * the param name to match the query string field name in which the oauth provider sends
     * the error post redirect
     */
    protected errorParamName = 'error_description'

    /**
     * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
     * approach is to prefix the oauth provider name to `oauth_state` value. For example:
     * For example: "facebook_oauth_state"
     */
    protected stateCookieName = 'entraid_oauth_state'

    /**
     * Parameter name to be used for sending and receiving the state from.
     * Read the documentation of your oauth provider and update the param
     * name to match the query string used by the provider for exchanging
     * the state.
     */
    protected stateParamName = 'state'

    /**
     * Parameter name for sending the scopes to the oauth provider.
     */
    protected scopeParamName = 'scope'

    /**
     * The separator indentifier for defining multiple scopes
     */
    protected scopesSeparator = ' '

    /*
     * Set the authorization endpoint
     * @see https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols#endpoints
     */

    constructor(
        ctx: HttpContext,
        public config: EntraIdDriverConfig
    ) {
        super(ctx, config)

        this.loadState()
    }

    protected configureRedirectRequest(request: RedirectRequestContract<EntraIdScopes>) {
        request.scopes(this.config.scopes || ['openid', 'profile', 'email', 'offline_access'])
        // todo: implement this
    }

    /**
     * Returns the HTTP request with the authorization header set
     */
    protected getAuthenticatedRequest(url: string, token: string) {
        const request = this.httpClient(url)
        // todo: implement this
        request.parseAs('json')
        return request
    }

    /**
     * Fetches the user info from the Twitch API
     */
    protected async getUserInfo(token: string, callback?: (request: ApiRequestContract) => void) {
        const request = this.getAuthenticatedRequest(this.userInfoUrl, token)
        if (typeof callback === 'function') {
            callback(request)
        }

        // const body = await request.get()
        // const user = body.data[0]

        // todo: implement this

        return {
            id: "",
            nickName: "user.login",
            name: "user.display_name",
            email: "user.email",
            emailVerificationState: 'unsupported' as const,
            avatarUrl: "user.profile_image_url",
            original: "user",
        }
    }

    /**
     * Find if the current error code is for access denied
     */
    accessDenied(): boolean {
        const error = this.getError()
        if (!error) {
            return false
        }

        return error === 'access_denied'
    }

    /**
     * Returns details for the authorized user
     */
    async user(callback?: (request: ApiRequestContract) => void) {
        const token = await this.accessToken(callback)
        const user = await this.getUserInfo(token.token, callback)

        return {
            ...user,
            token,
        }
    }

    /**
     * Finds the user by the access token
     */
    async userFromToken(token: string, callback?: (request: ApiRequestContract) => void) {
        const user = await this.getUserInfo(token, callback)

        return {
            ...user,
            token: { token, type: 'bearer' as const },
        }
    }
}