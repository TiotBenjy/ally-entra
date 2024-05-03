import type { HttpContext } from '@adonisjs/core/http'
import type { EntraIdDriverConfig, EntraIdDriverContract } from './main.js'

declare module '@adonisjs/ally/types' {
  export interface AllyDriversList {
    entraId: (config: EntraIdDriverConfig, ctx: HttpContext) => EntraIdDriverContract
  }
}
