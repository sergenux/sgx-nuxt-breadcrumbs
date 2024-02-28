import { computed, useRoute, useRouter, type ComputedRef } from '#imports'
import { type RouteRecordNormalized } from '#vue-router'
import { defu } from 'defu'
import { titleCase } from 'scule'
import {
  joinURL,
  parseFilename,
  withTrailingSlash,
  withoutTrailingSlash
} from 'ufo'

export interface Result {
  items: Item[]
  visible: boolean
  [key: string]: unknown
}

export interface Item {
  label: string
  to: string
  current: boolean
  [key: string]: unknown
}

export function useBreadcrumbs(): ComputedRef<Result> {
  const items = useBreadcrumbsItems()
  const meta = useBreadcrumbsMeta()
  return computed(() => ({
    items: items.value,
    visible: true,
    ...meta.value
  }))
}

function useBreadcrumbsItems() {
  const config = useBreadcrumbsConfig()
  const flatNavChain = useFlatNavChain()
  const items = computed(() => {
    let sliceIndex = 0
    return flatNavChain.value
      .filter(({ params }) => !params.excluded)
      .map(({ path, basePath, routeMeta, params }, index) => {
        params.previousExcluded && (sliceIndex = index)

        // To
        let to = params.to ?? path
        const absoluteUrlRegex = /^(?:\w+:)?\/\/|^\//
        if (!absoluteUrlRegex.test(to)) {
          to = joinURL(basePath, to)
        }
        if (config.value.trailingSlash !== undefined) {
          to = config.value.trailingSlash
            ? withTrailingSlash(to)
            : withoutTrailingSlash(to)
        }

        // Label
        let label = params.label ?? routeMeta.title ?? ''
        if (!label) {
          const labelPath = withoutTrailingSlash(to)
          const basename = parseFilename(labelPath, { strict: false })
          label = basename ? titleCase(basename) : 'Home'
        }

        return { ...params, label, to }
      })
      .slice(sliceIndex)
      .map((item, index, array) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { label, to, excluded, previousExcluded, ...other } = item
        const current = index == array.length - 1
        return { label, to, current, ...other }
      })
  })
  return items
}

function useFlatNavChain() {
  const navChain = useNavChain()
  return computed(() =>
    navChain.value.flatMap((nav) =>
      [
        nav.routeMeta.breadcrumbsBefore ?? [],
        { ...nav.routeMeta.breadcrumbsItem },
        nav.routeMeta.breadcrumbsAfter ?? []
      ]
        .flat()
        .map((params) => ({ ...nav, params }))
    )
  )
}

function useNavChain() {
  const route = useRoute()
  const routes = useRoutes()
  const pathChain = usePathChain()
  return computed(() =>
    pathChain.value.flatMap((path) => {
      if (withoutTrailingSlash(route.path) == path) {
        return {
          path: route.path,
          basePath: withoutTrailingSlash(
            (route.matched.at(-1) || route).path.replace(/:.*$/, '')
          ),
          routeMeta: route.meta
        }
      } else if (routes.value[path]) {
        return {
          path: routes.value[path].path,
          basePath: path,
          routeMeta: routes.value[path].meta
        }
      }
      return []
    })
  )
}

function useRoutes() {
  const router = useRouter()
  return computed(() =>
    router
      .getRoutes()
      .reduce((result: { [key: string]: RouteRecordNormalized }, item) => {
        if (!item.children.length) {
          result[withoutTrailingSlash(item.path)] = item
        }
        return result
      }, {})
  )
}

function usePathChain() {
  const route = useRoute()
  return computed(() => [
    '/',
    ...route.path
      .split('/')
      .filter((item) => item)
      .map((item, index, array) => `/${array.slice(0, index + 1).join('/')}`)
  ])
}

function useBreadcrumbsMeta() {
  const route = useRoute()
  return computed(() =>
    defu(
      route.meta.breadcrumbs,
      ...route.matched.map((item) => item.meta.breadcrumbs)
    )
  )
}

function useBreadcrumbsConfig() {
  const appConfig = useAppConfig()
  const runtimeConfig = useRuntimeConfig()
  return computed(() =>
    defu(runtimeConfig.public.sgxBreadcrumbs, appConfig.sgxBreadcrumbs)
  )
}
