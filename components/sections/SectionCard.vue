<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { Section } from '~/types/section'

const props = defineProps<{
  section: Section
  progress: number
}>()
</script>

<template>
  <NuxtLink
    :to="`/sections/${props.section.slug}`"
    class="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="flex items-start justify-between">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl dark:bg-indigo-950">
        <Icon :icon="props.section.icon" class="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
      </div>
      <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        {{ props.section.questionCount ?? 0 }} questions
      </span>
    </div>

    <div>
      <h2 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-indigo-400">
        {{ props.section.title }}
      </h2>
      <p class="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
        {{ props.section.description }}
      </p>
    </div>

    <div class="mt-auto">
      <ProgressBar :percent="props.progress" />
      <p class="mt-1 text-right text-xs font-medium tabular-nums text-gray-500 dark:text-gray-400">
        {{ props.progress }}%
      </p>
    </div>
  </NuxtLink>
</template>
