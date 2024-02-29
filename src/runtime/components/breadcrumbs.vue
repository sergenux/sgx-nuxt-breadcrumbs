<template>
  <component :is="as" v-if="breadcrumbs.visible">
    <slot v-bind="slot">
      <ul class="sgx-breadcrumbs">
        <li v-for="(item, index) in breadcrumbs.items" :key="index">
          <NuxtLink v-if="!item.current" :to="item.to">
            {{ item.label }}
          </NuxtLink>
          <span v-else>{{ item.label }}</span>
        </li>
      </ul>
    </slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useBreadcrumbs } from '../composables/breadcrumbs'

interface Props {
  as?: string
}

interface Slot {
  items: BreadcrumbsItem[]
  [key: string]: unknown
}

interface BreadcrumbsItem {
  label: string
  to: string
  current: boolean
  [key: string]: unknown
}

withDefaults(defineProps<Props>(), { as: 'div' })
defineSlots<{ default(props: Slot): any }>()

const breadcrumbs = useBreadcrumbs()

const slot = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items, visible, ...other } = breadcrumbs.value
  return { items, ...other }
})
</script>

<style scoped>
.sgx-breadcrumbs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sgx-breadcrumbs li {
  margin: 0;
  padding: 0;
  display: inline-block;
}

.sgx-breadcrumbs li:not(:last-child):after {
  content: '>';
  margin: 0 0.5rem;
}
</style>
