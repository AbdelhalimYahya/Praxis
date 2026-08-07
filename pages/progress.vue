<script setup lang="ts">
import type { QuestionProgress } from '~/types/progress'

const { sections } = useSections()
const { getQuestionById } = useQuestions()
const progress = useProgress()
const progressStore = useProgressStore()

useHead({
  title: 'Progress — Praxis',
  meta: [{ name: 'description', content: 'Your interview prep progress across all tracks.' }],
})

const overall = computed(() => progress.getOverallPercent())

type AttemptEntry = { question: ReturnType<typeof getQuestionById>; record: QuestionProgress }

const attempted = computed<AttemptEntry[]>(() =>
  (Object.entries(progressStore.storage) as [string, QuestionProgress][])
    .map(([questionId, record]) => ({
      question: getQuestionById(questionId),
      record,
    }))
    .filter((entry) => entry.question)
    .sort((a, b) => b.record.lastAttemptAt.localeCompare(a.record.lastAttemptAt)),
)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function resetProgress() {
  if (confirm('Reset all progress? This cannot be undone.')) {
    progress.reset()
  }
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 py-10">
    <h1 class="text-3xl font-bold">Your progress</h1>

    <div class="mt-6 grid gap-6">
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <p class="text-sm font-medium uppercase tracking-wide text-gray-500">Overall</p>
        <p class="mt-1 text-4xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{{ overall }}%</p>
        <div class="mt-4">
          <ProgressBar :percent="overall" />
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 class="mb-4 font-semibold">Per section</h2>
        <div class="space-y-3">
          <div
            v-for="section in sections"
            :key="section.slug"
            class="flex items-center gap-3"
          >
            <ScoreSummary :section="section" :percent="progress.getSectionPercent(section.id)" />
            <span
              v-if="!progress.isSectionStarted(section.id)"
              class="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            >
              Not started
            </span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 class="mb-4 font-semibold">Attempted questions</h2>
        <div v-if="attempted.length" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="entry in attempted" :key="entry.question!.id" class="flex items-center justify-between gap-4 py-3">
            <div class="min-w-0">
              <NuxtLink
                :to="`/sections/${entry.question!.sectionId}/${entry.question!.id}`"
                class="block truncate font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
              >
                {{ entry.question!.title }}
              </NuxtLink>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ entry.question!.type }} · {{ entry.record.attempts }} attempt(s) · {{ formatDate(entry.record.lastAttemptAt) }}
              </p>
            </div>
            <span class="shrink-0 text-lg font-bold tabular-nums text-indigo-600 dark:text-indigo-400">{{ entry.record.bestScorePercent }}%</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No questions attempted yet.
        </p>
      </div>

      <button
        class="self-start rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"
        @click="resetProgress"
      >
        Reset progress
      </button>
    </div>
  </section>
</template>
