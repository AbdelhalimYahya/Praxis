<script setup lang="ts">
import type { Question } from '~/types/question'

const route = useRoute()
const slug = String(route.params.slug)

const { getSectionBySlug } = useSections()
const { getQuestionsBySectionId } = useQuestions()
const progress = useProgress()

const section = computed(() => getSectionBySlug(slug))
const questions = computed(() => getQuestionsBySectionId(section.value?.id ?? ''))

if (!section.value) {
  throw createError({ statusCode: 404, statusMessage: `Section "${slug}" not found` })
}

const completedCount = computed(() => questions.value.filter((q: Question) => (progress.getProgress(q.id)?.bestScorePercent ?? 0) >= 100).length)

useHead({
  title: `${section.value.title} — Praxis`,
  meta: [{ name: 'description', content: section.value.description }],
})
</script>

<template>
  <section v-if="section" class="mx-auto max-w-7xl px-4 py-10">
    <div class="mb-8">
      <p class="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Section</p>
      <h1 class="mt-1 text-3xl font-bold">{{ section.title }}</h1>
      <p class="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">{{ section.description }}</p>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {{ questions.length }} questions · {{ completedCount }} completed
      </p>
    </div>

    <QuestionList v-if="questions.length" :questions="questions" />
    <div v-else class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 dark:border-gray-700">
      No questions in this section yet.
    </div>
  </section>
</template>
