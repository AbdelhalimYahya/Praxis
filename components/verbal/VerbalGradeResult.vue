<script setup lang="ts">
import type { AiGradingResult } from '~/types/grading'

const props = defineProps<{
  result: AiGradingResult
}>()

const verdictStyles: Record<AiGradingResult['verdict'], string> = {
  excellent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  good: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  partial: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'off-topic': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

const verdictLabels: Record<AiGradingResult['verdict'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  partial: 'Partial',
  'off-topic': 'Off-topic',
}

const circumference = 2 * Math.PI * 52
const strokeDashoffset = computed(() => circumference - (circumference * props.result.matchPercent) / 100)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div class="relative h-32 w-32 shrink-0" role="img" :aria-label="`${props.result.matchPercent}% match`">
      <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke-width="10" class="stroke-gray-100 dark:stroke-gray-800" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke-width="10"
          stroke-linecap="round"
          class="stroke-indigo-500 transition-all duration-700"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{{ props.result.matchPercent }}%</span>
        <span class="text-xs text-gray-500">match</span>
      </div>
    </div>

    <div class="min-w-0 flex-1 space-y-3">
      <span class="inline-block rounded-full px-3 py-1 text-sm font-semibold" :class="verdictStyles[props.result.verdict]">
        {{ verdictLabels[props.result.verdict] }}
      </span>

      <div class="space-y-2">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Feedback</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ props.result.feedback }}</p>
      </div>

      <div v-if="props.result.missingPoints.length">
        <p class="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">Missing key points</p>
        <ul class="ml-4 list-disc space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
          <li v-for="point in props.result.missingPoints" :key="point">{{ point }}</li>
        </ul>
      </div>

      <p class="text-xs text-gray-400 dark:text-gray-500">
        Graded by <span class="font-medium">{{ props.result.rawModelUsed }}</span>
      </p>
    </div>
  </div>
</template>
