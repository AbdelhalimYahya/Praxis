<script setup lang="ts">
import type { SubmissionResult } from '~/types/grading'

const props = defineProps<{
  result: SubmissionResult | null
}>()
</script>

<template>
  <div v-if="props.result" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Submission results</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ props.result.passedTests }} of {{ props.result.totalTests }} tests passed · {{ props.result.scorePercent }}%
        </p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-sm font-semibold"
        :class="props.result.allPassed
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'"
      >
        {{ props.result.allPassed ? 'All tests passed!' : 'Needs another pass' }}
      </span>
    </div>

    <ul class="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">
      <li
        v-for="test in props.result.results"
        :key="test.testId"
        class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-800"
      >
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ test.testId }}</span>
        <span v-if="test.hidden" class="text-gray-500 dark:text-gray-400">Hidden test · {{ test.passed ? 'passed' : 'failed' }}</span>
        <span v-else class="font-mono text-xs text-gray-600 dark:text-gray-400">
          expected {{ JSON.stringify(test.expectedOutput) }} · got {{ JSON.stringify(test.actualOutput) }}
        </span>
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          :class="test.passed
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'"
        >
          {{ test.passed ? 'Passed' : 'Failed' }}
        </span>
      </li>
    </ul>
  </div>
</template>
