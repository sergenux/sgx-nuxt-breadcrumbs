# sgx-nuxt-breadcrumbs

Breadcrumbs feature for Nuxt.

## Setup

1.  Install package:

```bash
npm install sgx-nuxt-breadcrumbs
```

2. Add package to `modules` in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['sgx-nuxt-breadcrumbs']
})
```

3. Add `<SgxBreadcrumbs>` component to layout or `app.vue`:

```vue
<template>
  <div>
    <SgxBreadcrumbs />
    <NuxtPage />
  </div>
</template>
```

## Configuration

**Type:**

```ts
interface NuxtConfig {
  sgxBreadcrumbs?: ModuleOptions
}

interface ModuleOptions {
  // Prefix for components and composables
  // Default: 'Sgx'
  prefix?: string

  // Add/remove trailing slash for items
  // Default: undefined
  trailingSlash?: boolean
}
```

**Usage:**

Set module options to `sgxBreadcrumbs` in `nuxt.config.ts`:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['sgx-nuxt-breadcrumbs'],
  sgxBreadcrumbs: {
    // Module options...
  }
})
```

## Page properties

**Type:**

```ts
interface PageMeta {
  // Base page title
  // Default: Auto-title from URL slug
  title?: string

  // Custom item/items before
  breadcrumbsBefore?: BreadcrumbsItem | BreadcrumbsItem[]

  // Breadcrumbs item
  breadcrumbsItem?: BreadcrumbsItem

  // Custom item/items after
  breadcrumbsAfter?: BreadcrumbsItem | BreadcrumbsItem[]

  // Breadcrumbs params
  breadcrumbs?: {
    // Component visibility
    visible?: boolean

    // Custom params
    [key: string]: unknown
  }
}

// Item params
interface BreadcrumbsItem {
  // Label
  // Default: Inherit from base page title
  label?: string

  // Path
  // Default: From router
  to?: string

  // Exclude item from breadcrumbs
  // Default: false
  excluded?: boolean

  // Exclude previous items from breadcrumbs
  // Default: false
  previousExcluded?: boolean

  // Custom params
  [key: string]: unknown
}
```

**Usage:**

Auto-title from URL slug if no params:

```vue
<script setup lang="ts">
definePageMeta({
  // Empty...
})
</script>
```

Base page title:

```vue
<script setup lang="ts">
definePageMeta({
  title: 'List of posts'
})
</script>
```

Override base page title for breadcrumbs:

```vue
<script setup lang="ts">
definePageMeta({
  title: 'List of posts',
  breadcrumbsItem: {
    label: 'Posts'
  }
})
</script>
```

Set custom path for breadcrumbs item:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbsItem: {
    to: '/my-custom/path'
  }
})
</script>
```

Exclude item from breadcrumbs:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbsItem: {
    excluded: true
  }
})
</script>
```

Exclude all previous items from breadcrumbs:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbsItem: {
    previousExcluded: true
  }
})
</script>
```

Custom params for item:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbsItem: {
    myIcon: 'my-icon',
    myParam1: 'my-param-1',
    myParam2: 'my-param-2'
    // Other...
  }
})
</script>
```

Hide breadcrumbs component:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbs: {
    visible: false
  }
})
</script>
```

Custom params for breadcrumbs:

```vue
<script setup lang="ts">
definePageMeta({
  breadcrumbs: {
    myParam1: 'my-param-1',
    myParam2: 'my-param-2'
    // Other...
  }
})
</script>
```

Dynamic params:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: async (route) => {
    const data = await fetchData(route.params)

    // Base page title
    route.meta.title = data.title

    // Item
    route.meta.breadcrumbsItem = {
      // label: data.title
      to: data.slug
      // Other params...
    }

    // Add categories
    route.meta.breadcrumbsBefore = data.categories.map((category) => {
      return { label: category.name, to: '/categories/' + category.slug }
    })
  }
})
</script>
```

Along with breadcrumbsBefore, breadcrumbsAfter can be used on list page like product list with filter. Last breadcrumbs item can have path "/products?brand=some-brand" with label "Products (Brand: Some Brand)" and previous item will be "Products" with path "/products" which resets the filter.

## Components

### `<SgxBreadcrumbs>`

**Types:**

```ts
interface Props {
  // Element
  // Default: 'div'
  as?: string
}

interface Slot {
  // Breadcrumbs items
  items: Item[]

  // Breadcrumbs custom params
  [key: string]: unknown
}

// Breadcrumbs item
interface Item {
  label: string
  to: string

  // Active item
  current: boolean

  // Item custom params
  [key: string]: unknown
}
```

**Usage:**

Basic usage:

```vue
<template>
  <SgxBreadcrumbs />
</template>
```

Override component template:

```vue
<template>
  <SgxBreadcrumbs v-slot="{ items, myParam1, myParam2 }">
    <ul>
      <li v-for="(item, index) in items" :key="index">
        <NuxtLink v-if="!item.current" :to="item.to">
          <i>{{ item.myParamIcon }}</i>
          <span>{{ item.label }}</span>
        </NuxtLink>
        <span v-else>{{ item.label }}</span>
      </li>
    </ul>
    <p>{{ myParam1 }}</p>
    <p>{{ myParam2 }}</p>
  </SgxBreadcrumbs>
</template>
```

## Composables

### `useSgxBreadcrumbs`

**Type:**

```ts
interface Composable {
  (): ComputedRef<Result>
}

interface Result {
  // Breadcrumbs items
  items: Item[]

  // Component visibility
  visible: boolean

  // Breadcrumbs custom params
  [key: string]: unknown
}

// Breadcrumbs item
interface Item {
  label: string
  to: string

  // Active item
  current: boolean

  // Item custom params
  [key: string]: unknown
}
```

**Usage:**

```vue
<template>
  <div v-if="breadcrumbs.visible">
    <ul>
      <li v-for="(item, index) in breadcrumbs.items" :key="index">
        <NuxtLink v-if="!item.current" :to="item.to">
          <i>{{ item.myParamIcon }}</i>
          <span>{{ item.label }}</span>
        </NuxtLink>
        <span v-else>{{ item.label }}</span>
      </li>
    </ul>
    <div>{{ breadcrumbs.myParam1 }}</div>
    <div>{{ breadcrumbs.myParam2 }}</div>
  </div>
</template>

<script setup lang="ts">
const breadcrumbs = useSgxBreadcrumbs()
</script>
```

## Example

Pages:

```bash [Directory Structure]
-| blog/
---| index.vue
---| post-1.vue
---| post-2.vue
---| post-3.vue
-| index.vue
```

Generated auto-breadcrumbs:

- `/` - Home
- `/blog` - Home > Blog
- `/blog/post-1` - Home > Blog > Post 1
- `/blog/post-2` - Home > Blog > Post 2
- `/blog/post-3` - Home > Blog > Post 3

## Development

```bash
# Clone repository
git clone https://github.com/sergenux/sgx-nuxt-breadcrumbs.git

# Change directory
cd sgx-nuxt-breadcrumbs

# Install dependencies
npm install

# Prepare types
npm run dev:prepare

# Develop with playground
npm run dev

# Build playground
npm run dev:build

# Code checks
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:fix
```
