<script setup lang="ts">
import type { AiGradingResult } from '~/types/grading'

const props = defineProps<{
  result: AiGradingResult
}>()
</script>

<template>
  <div class="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/40">
    <h3 class="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
      What the AI understood from your answer
    </h3>
    <p class="text-sm leading-relaxed text-sky-900 dark:text-sky-100">
      {{ props.result.aiUnderstanding }}
    </p>
    <p class="mt-3 text-xs text-sky-700 dark:text-sky-400">
      The AI paraphrases your answer in its own words so you can tell whether it misread anything.
    </p>
  </div>
</template>
