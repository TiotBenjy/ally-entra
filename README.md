`@tiotbenjy/ally-entra-id` is a Entra ID driver for [AdonisJS Ally](https://docs.adonisjs.com/guides/social-auth).

## Getting Started

This package is available in the npm registry.

```bash
npm install @tiotbenjy/ally-entra-id
```

Next, configure the package by running the following command.

```bash
node ace configure @tiotbenjy/ally-entra-id
```

Then register the service inside the configuration file `config/ally.ts`.

```ts
// config/ally.ts
import { defineConfig } from '@adonisjs/ally'
import { entraId } from '@tiotbenjy/ally-entra-id'
import env from '#start/env'

const allyConfig = defineConfig({
  entra: entraId({
    clientId: env.get('ENTRA_ID_CLIENT_ID'),
    clientSecret: env.get('ENTRA_ID_CLIENT_SECRET'),
    callbackUrl: env.get('ENTRA_ID_CALLBACK_URL'),
    authorizationEndpoint: env.get('ENTRA_ID_AUTH_ENDPOINT'),
    scopes: ['openid', 'email'],
    // tenantId not required if authorizationEndpoint is :
    // 'common' or 'organizations' or 'consumers'
    tenantId: env.get('ENTRA_ID_TENANT_ID'),
  }),
})
```

And you can now use the `ally` instance into routes files `start/routes.ts`.

```ts
// start/routes.ts
import router from '@adonisjs/core/services/router'

router.get('/login', async ({ ally }) => {
  return ally.use('entra').redirect()
})

router.get('/entra/callback', async ({ ally }) => {
  const entra = ally.use('entra')

  /**
   * User has denied access by canceling
   * the login flow
   */
  if (entra.accessDenied()) {
    return 'You have cancelled the login process or did not grant access to your profile'
  }

  /**
   * Microsoft responded with some error
   */
  if (entra.hasError()) {
    return entra.getError()
  }

  const user = await entra.user()
})
```

## Work based on

- [AdonisJS Ally](https://v6-alpha.adonisjs.com/docs/social_auth)
- [adonis-ally-azure-ad](https://github.com/AlexanderYW/adonis-ally-azure-ad/tree/main)
- [@rlanz/ally-twitch](https://github.com/RomainLanz/ally-twitch)
