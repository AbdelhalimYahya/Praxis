<script setup lang="ts">
import type { Section } from '~/types/section'

const props = defineProps<{
  section: Section
  percent: number
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="w-40 shrink-0 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
      {{ props.section.title }}
    </span>
    <div class="flex-1">
      <ProgressBar :percent="props.percent" />
    </div>
    <span class="w-10 text-right text-sm font-semibold tabular-nums text-gray-600 dark:text-gray-300">
      {{ props.percent }}%
    </span>
  </div>
</template>
