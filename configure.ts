import type Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.defineEnvVariables({
    ENTRA_ID_AUTH_ENDPOINT: 'tenant',
    ENTRA_ID_CLIENT_ID: '',
    ENTRA_ID_CLIENT_SECRET: '',
    ENTRA_ID_CALLBACK_URL: '',
    ENTRA_ID_TENANT_ID: '',
  })

  await codemods.defineEnvValidations({
    variables: {
      ENTRA_ID_AUTH_ENDPOINT:
        "Env.schema.enum(['common', 'organizations', 'consumers', 'tenant'] as const)",
      ENTRA_ID_CLIENT_ID: 'Env.schema.string()',
      ENTRA_ID_CLIENT_SECRET: 'Env.schema.string()',
      ENTRA_ID_CALLBACK_URL: 'Env.schema.string()',
      ENTRA_ID_TENANT_ID: 'Env.schema.string.optional()',
    },
    leadingComment: 'Variables for @tiotbenjy/ally-entra-id provider',
  })
}
