<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  questionId: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center dark:border-gray-700 dark:bg-gray-900/40"
  >
    <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-200/70 dark:bg-gray-800">
      <Icon icon="mdi:code-tags" class="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
    </div>
    <div>
      <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Coding workspace coming soon</h2>
      <p class="mx-auto mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
        The code editor, test harness, and run/submit flow for this question are being built.
      </p>
    </div>
    <span class="rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
      {{ questionId }} · question id
    </span>
  </div>
</template>
