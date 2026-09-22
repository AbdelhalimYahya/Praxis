<script setup lang="ts">
import type { SubmissionResult } from '~/types/grading'

const props = withDefaults(
  defineProps<{
    open: boolean
    result?: SubmissionResult | null
    submitting?: boolean
    error?: string
  }>(),
  {
    result: null,
    submitting: false,
    error: '',
  },
)

const emit = defineEmits<{
  close: []
  retry: []
}>()
</script>

<template>
  <div v-if="props.open" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4" role="dialog" aria-modal="true" aria-label="Submission summary">
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
      <div class="flex items-start justify-between gap-3">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Submission summary</h2>
        <button
          class="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Close submission summary"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div v-if="props.submitting" class="mt-6 flex flex-col items-center gap-3 py-6 text-center">
        <span class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" aria-hidden="true" />
        <p class="text-sm text-gray-600 dark:text-gray-400">Running the full test suite…</p>
      </div>

      <div v-else-if="props.error" class="mt-4">
        <p role="alert" class="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{{ props.error }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium dark:border-gray-700" @click="emit('close')">Close</button>
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500" @click="emit('retry')">Retry</button>
        </div>
      </div>

      <div v-else-if="props.result" class="mt-4 text-center">
        <p class="text-5xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{{ props.result.scorePercent }}%</p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ props.result.passedTests }} of {{ props.result.totalTests }} tests passed
        </p>
        <p
          v-if="props.result.allPassed"
          class="mx-auto mt-4 w-fit rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
        >
          Perfect submission
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <button class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium dark:border-gray-700" @click="emit('close')">Close</button>
          <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500" @click="emit('retry')">Retry</button>
        </div>
      </div>
    </div>
  </div>
</template>
