<script setup lang="ts">
import type { AiGradingResult } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'

const props = defineProps<{
  question: VerbalQuestion
}>()

const answer = ref('')
const loading = ref(false)
const result = ref<AiGradingResult | null>(null)

const { grade } = useAiGrader()
const progress = useProgress()

const wordCount = computed(() => answer.value.trim().split(/\s+/).filter(Boolean).length)
const meetsMinWords = computed(() => !props.question.minWords || wordCount.value >= props.question.minWords)

function loadDraft() {
  const draft = progress.getProgress(props.question.id)?.answerDraft
  if (draft) answer.value = draft
}

onMounted(loadDraft)

async function checkAnswer() {
  if (!answer.value.trim()) return
  loading.value = true
  try {
    result.value = await grade(props.question, answer.value)
    progress.recordVerbal(props.question.id, result.value.matchPercent, answer.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <h2 class="mb-3 text-lg font-semibold">Your answer</h2>

    <div v-if="props.question.hints?.length" class="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <p class="font-medium">Hints</p>
      <ul class="ml-4 mt-1 list-disc space-y-1">
        <li v-for="hint in props.question.hints" :key="hint">{{ hint }}</li>
      </ul>
    </div>

    <textarea
      v-model="answer"
      rows="8"
      class="w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-4 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      placeholder="Type your answer here…"
      :aria-label="`Your answer to: ${props.question.title}`"
    />

    <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-medium tabular-nums">{{ wordCount }}</span> words
        <span v-if="props.question.minWords" class="ml-1">
          · minimum {{ props.question.minWords }}
          <span :class="meetsMinWords ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ meetsMinWords ? '(met)' : '(not met)' }}
          </span>
        </span>
      </p>
      <button
        class="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading || !answer.trim()"
        @click="checkAnswer"
      >
        {{ loading ? 'Grading…' : 'Check my answer' }}
      </button>
    </div>

    <div v-if="result" class="mt-6 border-t border-gray-100 pt-6 dark:border-gray-800">
      <VerbalGradeResult :result="result" />
      <div class="mt-6">
        <AiUnderstandingPanel :result="result" />
      </div>
    </div>
  </div>
</template>
