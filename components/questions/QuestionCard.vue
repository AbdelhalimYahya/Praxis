<script setup lang="ts">
import type { Question } from '~/types/question'

const props = defineProps<{
  question: Question
}>()

const progress = useProgress()
const completed = computed(() => progress.isCompleted(props.question.id))
const bestScore = computed(() => progress.getProgress(props.question.id)?.bestScorePercent ?? null)
</script>

<template>
  <NuxtLink
    :to="`/sections/${props.question.sectionId}/${props.question.id}`"
    class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold"
      :class="completed
        ? 'border-emerald-500 bg-emerald-500 text-white'
        : 'border-gray-300 text-gray-400 dark:border-gray-600'"
      :aria-label="completed ? 'Completed' : 'Not completed'"
    >
      <svg v-if="completed" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5" aria-hidden="true">
        <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 0 1 .006 1.414l-6.5 6.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L9.5 10.586l5.79-5.29a1 1 0 0 1 1.415.006Z" clip-rule="evenodd" />
      </svg>
      <span v-else aria-hidden="true">{{ bestScore ?? '' }}</span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span
          class="text-sm font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
          :aria-label="props.question.type === 'coding' ? 'Coding question' : 'Verbal question'"
        >
          {{ props.question.type === 'coding' ? '⚙ Coding' : '✍ Verbal' }}
        </span>
        <DifficultyBadge :difficulty="props.question.difficulty" />
      </div>
      <h3 class="mt-1 truncate font-semibold text-gray-900 dark:text-gray-100">{{ props.question.title }}</h3>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        {{ props.question.points }} pts
        <span v-if="bestScore !== null" class="ml-2 font-medium tabular-nums text-indigo-600 dark:text-indigo-400">{{ bestScore }}%</span>
      </p>
    </div>

    <span class="text-gray-300 dark:text-gray-600" aria-hidden="true">→</span>
  </NuxtLink>
</template>
