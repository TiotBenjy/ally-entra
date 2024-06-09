import type {
  AllyDriverContract,
  LiteralStringUnion,
  Oauth2DriverConfig,
} from '@adonisjs/ally/types'

export interface EntraIdDriverContract extends AllyDriverContract<EntraIdToken, EntraIdScopes> {
  version: 'oauth2'
}

export type EntraIdDriverConfig = Oauth2DriverConfig & {
  driver: 'entra'
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string
  scopes?: LiteralStringUnion<EntraIdScopes>[]
  tenantId?: string
  authorizationEndpoint: 'common' | 'organizations' | 'consumers' | 'tenant'
  profilePictureSize?: ProfilePictureSize
}

export type EntraIdToken = {
  token: string
  type: string
  token_type: string
  scope: string
  expires_in: number
  ext_expires_in: number
  access_token: string
  refresh_token: string
  id_token: string
}

/**
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc
 */
export type EntraIdScopes = 'email' | 'offline_access' | 'openid' | 'profile'

export interface MicrosoftEntraIdProfile extends Record<string, any> {
  '@odata.context': string
  '@odata.id': string
  'businessPhones': string[]
  'displayName': string
  'givenName': string
  'jobTitle': string
  'mail': string
  'mobilePhone': string
  'officeLocation': string
  'preferredLanguage'?: any
  'surname': string
  'userPrincipalName': string
  'id': string
  'roles': string[]

  /** @default "common" */
  'tenantId'?: string
}

export interface UserFields extends Record<string, any> {
  id: string
  avatarUrl: string | null
  nickName: string
  displayName?: string | undefined
  name: string
  email: string | null
  emailVerificationState: 'verified' | 'unverified' | 'unsupported'
  roles: string[]
  original: MicrosoftEntraIdProfile | null
}

/**
 * https://learn.microsoft.com/en-us/graph/api/profilephoto-get?view=graph-rest-1.0&tabs=http#examples
 *
 * @default 48
 */
export type ProfilePictureSize = 48 | 64 | 96 | 120 | 240 | 360 | 432 | 504 | 648
