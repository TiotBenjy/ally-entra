import type Configure from '@adonisjs/core/commands/configure'

export async function configure(command: Configure) {
    const codemods = await command.createCodemods()

    await codemods.updateRcFile((rcFile) => {
        rcFile.addProvider('@tiotbenjy/ally-entra-id/entra_id_provider')
    })

    await codemods.defineEnvVariables({
        ENTRA_ID_AUTH_ENDPOINT: 'tenant',
        ENTRA_ID_CLIENT_ID: '<your_client_id>',
        ENTRA_ID_CLIENT_SECRET: '<your_client_secret>',
        ENTRA_ID_CALLBACK_URL: '<your_callback_url>',
        ENTRA_ID_TENANT_ID: '<your_tenant_id>',
    })

    await codemods.defineEnvValidations({
        variables: {
            ENTRA_ID_AUTH_ENDPOINT: 'Env.schema.enum(["common", "organizations", "consumers", "tenant"])',
            ENTRA_ID_CLIENT_ID: 'Env.schema.string()',
            ENTRA_ID_CLIENT_SECRET: 'Env.schema.string()',
            ENTRA_ID_CALLBACK_URL: 'Env.schema.string()',
            ENTRA_ID_TENANT_ID: 'Env.schema.string().optional()',
        },
        leadingComment: 'Variables for @tiotbenjy/ally-entra-id provider',
    })
}