<script setup lang="ts">
import { Icon } from '@iconify/vue'

const { sections } = useSections()
const progress = useProgress()
const route = useRoute()
</script>

<template>
  <aside class="hidden w-64 shrink-0 border-r border-gray-200 p-4 lg:block dark:border-gray-800">
    <p class="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Sections</p>
    <nav class="space-y-1">
      <NuxtLink
        v-for="section in sections"
        :key="section.slug"
        :to="`/sections/${section.slug}`"
        class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        :class="{ 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300': route.path.startsWith(`/sections/${section.slug}`) }"
      >
        <Icon :icon="section.icon" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate">{{ section.title }}</span>
        <span class="text-xs tabular-nums text-gray-400">{{ progress.getSectionPercent(section.id) }}%</span>
      </NuxtLink>
    </nav>
  </aside>
</template>
