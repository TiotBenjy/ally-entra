export { stubsRoot } from './stubs/main.js'
export { configure } from './configure.js'
import { EntraIdDriver } from './src/entra_id.js'
import type { EntraIdDriverConfig } from './src/types/main.js'
import type { HttpContext } from '@adonisjs/core/http'

export function entraId(config: EntraIdDriverConfig) {
  return (ctx: HttpContext) => new EntraIdDriver(ctx, config)
}
