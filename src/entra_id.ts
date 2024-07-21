import { Oauth2Driver } from '@adonisjs/ally'
import type { HttpContext } from '@adonisjs/core/http'
import type { ApiRequestContract, RedirectRequestContract } from '@adonisjs/ally/types'
import { EntraIdDriverConfig, EntraIdScopes, EntraIdToken, UserFields } from './types/main.js'

export class EntraIdDriver extends Oauth2Driver<EntraIdToken, EntraIdScopes> {
  //The URL for the redirect request.
  protected authorizeUrl: string =
    'https://login.microsoftonline.com/{authType}/oauth2/v2.0/authorize'

  //The URL to hit to exchange the authorization code for the access token.
  protected accessTokenUrl: string =
    'https://login.microsoftonline.com/{authType}/oauth2/v2.0/token'

  //The URL to hit to get the user details.
  protected userInfoUrl: string = 'https://graph.microsoft.com/v1.0/me'

  //The param name for the authorization code. Read the documentation of oauth provider
  protected codeParamName: string = 'code'

  // The param name for the error.
  protected errorParamName: string = 'error'

  //Cookie name for storing the CSRF token./
  protected stateCookieName: string = 'entraid_oauth_state'

  //Parameter name to be used for sending and receiving the state from.
  protected stateParamName: string = 'state'

  //Parameter name for sending the scopes to the oauth provider.
  protected scopeParamName: string = 'scope'

  // The separator identifier for defining multiple scopes
  protected scopesSeparator: string = ' '

  /*
   * Authorization endpoint (common, organizations, consumers, tenant)
   * Included in this.config.authorizationEndpoint
   * @see https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols#endpoints
   */

  constructor(
    ctx: HttpContext,
    public config: EntraIdDriverConfig
  ) {
    super(ctx, config)

    if (this.config.authorizationEndpoint === 'tenant') {
      // check if tenantId is defined
      if (!this.config.tenantId) {
        throw new Error('Tenant ID is required when using the tenant authorization endpoint')
      }

      this.authorizeUrl = this.authorizeUrl.replace('{authType}', this.config.tenantId)
      this.accessTokenUrl = this.accessTokenUrl.replace('{authType}', this.config.tenantId)
    } else {
      this.authorizeUrl = this.authorizeUrl.replace('{authType}', this.config.authorizationEndpoint)
      this.accessTokenUrl = this.accessTokenUrl.replace(
        '{authType}',
        this.config.authorizationEndpoint
      )
    }

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()

    // Perform stateless authentication. Only applicable for an Oauth2 client.
    this.stateless()
  }

  protected configureRedirectRequest(request: RedirectRequestContract<EntraIdScopes>) {
    // client_id and redirect_uri are already set by the base class
    request.param('response_type', 'code')
    request.scopes(this.config.scopes || ['openid', 'profile', 'email', 'offline_access'])
    request.param('response_mode', 'query')
  }

  /**
   * Returns the HTTP request with the authorization header set
   */
  protected getAuthenticatedRequest(
    url: string,
    token: string,
    parseAs?: 'json' | 'buffer' | 'text'
  ) {
    const request = this.httpClient(url)
    request.header('Authorization', `Bearer ${token}`)
    request.header('Accept', 'application/json')
    request.parseAs(parseAs ?? 'json')
    return request
  }

  /**
   * Fetches the user info from the Microsoft Graph API
   */
  protected async getUserInfo(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<UserFields> {
    const request = this.getAuthenticatedRequest(this.userInfoUrl, token)
    if (typeof callback === 'function') {
      callback(request)
    }

    const user: any = await request.get()
    const avatarUrl: string | null = await this.getUserProfilePicture(token)

    return {
      id: user.id,
      nickName: user.id,
      displayName: user.displayName,
      avatarUrl: avatarUrl,
      name: `${user.givenName}${user.surname ? ` ${user.surname}` : ''}`,
      email: user.mail ? (user.mail as string) : (null as null),
      emailVerificationState: 'unsupported' as const,
      roles: user.roles || [],
      original: user,
    }
  }

  /**
   * Find if the current error code is for access denied
   */
  accessDenied(): boolean {
    const error: string | null = this.getError()
    if (!error) {
      return false
    }

    return (
      error === 'access_denied' ||
      error === 'invalid_grant' ||
      error === 'unauthorized' ||
      error === 'forbidden'
    )
  }

  /**
   * Returns details for the authorized user
   */
  async user(callback?: (request: ApiRequestContract) => void): Promise<
    UserFields & {
      token: EntraIdToken
    }
  > {
    const token: EntraIdToken = await this.accessToken(callback)
    const user: UserFields = await this.getUserInfo(token.token, callback)

    return {
      ...user,
      token,
    }
  }

  /**
   * Finds the user by the access token
   */
  async userFromToken(
    token: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<
    UserFields & {
      token: { token: string; type: 'bearer' }
    }
  > {
    const user: UserFields = await this.getUserInfo(token, callback)

    return {
      ...user,
      token: { token, type: 'bearer' as const },
    }
  }

  /**
   * Get the user profile picture from the Microsoft Graph API
   */
  async getUserProfilePicture(token: string): Promise<string | null> {
    try {
      const profilePictureSize: number = this.config.profilePictureSize || 48

      const urlToCall = `${this.userInfoUrl}/photos/${profilePictureSize}x${profilePictureSize}/$value`

      const request = this.getAuthenticatedRequest(urlToCall, token, 'buffer')
      const response = await request.get()

      let image = null
      if (response) {
        const decoded: string = Buffer.from(response).toString('base64')
        image = `data:image/jpeg;base64, ${decoded}`
      }
      return image
    } catch (e) {
      return null
    }
  }
}
