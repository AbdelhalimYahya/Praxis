<script setup lang="ts">
import type { TestRunResult } from '~/types/grading'
import type { TestCase } from '~/types/question'

const props = withDefaults(
  defineProps<{
    cases: TestCase[]
    results?: TestRunResult[]
  }>(),
  {
    results: () => [],
  },
)

const resultsById = computed(() => new Map(props.results.map((result) => [result.testId, result])))

function formatValue(value: unknown): string {
  try {
    const formatted = JSON.stringify(value)
    return formatted ?? String(value)
  } catch {
    return String(value)
  }
}

function statusFor(testId: string): 'Passed' | 'Failed' | 'Pending' {
  const result = resultsById.value.get(testId)
  if (!result) return 'Pending'
  return result.passed ? 'Passed' : 'Failed'
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
    <table class="w-full text-left text-sm">
      <thead class="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-4 py-3">Test</th>
          <th scope="col" class="px-4 py-3">Input</th>
          <th scope="col" class="px-4 py-3">Expected</th>
          <th scope="col" class="px-4 py-3">Actual</th>
          <th scope="col" class="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
        <tr v-for="testCase in props.cases" :key="testCase.id">
          <td class="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
            {{ testCase.description || testCase.id }}
          </td>
          <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatValue(testCase.input) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{{ formatValue(testCase.expectedOutput) }}</td>
          <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
            {{ resultsById.get(testCase.id) ? formatValue(resultsById.get(testCase.id)?.actualOutput) : '—' }}
          </td>
          <td class="px-4 py-3">
            <span
              class="rounded-full px-2.5 py-1 text-xs font-semibold"
              :class="{
                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300': statusFor(testCase.id) === 'Pending',
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300': statusFor(testCase.id) === 'Passed',
                'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300': statusFor(testCase.id) === 'Failed',
              }"
            >
              {{ statusFor(testCase.id) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
