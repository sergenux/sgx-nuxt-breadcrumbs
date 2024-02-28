import { name, version } from '../package.json'
import { defu } from 'defu'
import {
  addComponent,
  addImports,
  createResolver,
  defineNuxtModule
} from '@nuxt/kit'

export interface ModuleOptions {
  prefix?: string
  trailingSlash?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'sgxBreadcrumbs'
  },
  defaults: {
    prefix: 'Sgx',
    trailingSlash: undefined
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.build.transpile.push(resolve('runtime'))

    nuxt.options.appConfig.sgxBreadcrumbs = defu(
      nuxt.options.appConfig.sgxBreadcrumbs,
      options
    )

    addComponent({
      name: `${options.prefix}Breadcrumbs`,
      filePath: resolve('runtime/components/breadcrumbs.vue')
    })

    addImports({
      name: 'useBreadcrumbs',
      as: `use${options.prefix}Breadcrumbs`,
      from: resolve('runtime/composables/breadcrumbs')
    })
  }
})

declare module '#app/../pages/runtime/composables' {
  interface PageMeta {
    title?: string
    breadcrumbsBefore?: BreadcrumbsItem | BreadcrumbsItem[]
    breadcrumbsItem?: BreadcrumbsItem
    breadcrumbsAfter?: BreadcrumbsItem | BreadcrumbsItem[]
    breadcrumbs?: {
      visible?: boolean
      [key: string]: unknown
    }
  }

  interface BreadcrumbsItem {
    label?: string
    to?: string
    excluded?: boolean
    previousExcluded?: boolean
    [key: string]: unknown
  }
}

declare module '@nuxt/schema' {
  interface AppConfig {
    sgxBreadcrumbs?: ModuleOptions
  }

  interface PublicRuntimeConfig {
    sgxBreadcrumbs?: ModuleOptions
  }
}
