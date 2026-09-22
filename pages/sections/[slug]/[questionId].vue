<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const questionId = String(route.params.questionId)

const { getSectionBySlug } = useSections()
const { getQuestionById, getQuestionsBySectionId } = useQuestions()

const question = computed(() => getQuestionById(questionId))
const codingQuestion = computed(() => (question.value?.type === 'coding' ? question.value : undefined))
const section = computed(() => getSectionBySlug(slug))
const sectionQuestions = computed(() => getQuestionsBySectionId(slug))

if (!section.value || !question.value || question.value.sectionId !== slug) {
  throw createError({ statusCode: 404, statusMessage: 'Question not found' })
}

useHead({
  title: `${question.value.title} — Praxis`,
  meta: [{ name: 'description', content: question.value.prompt }],
})
</script>

<template>
  <section v-if="question" class="mx-auto max-w-4xl px-4 py-10">
    <div class="mb-6">
      <NuxtLink
        :to="`/sections/${slug}`"
        class="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        ← {{ section?.title }}
      </NuxtLink>
      <div class="mt-3 flex flex-wrap items-center gap-3">
        <span
          class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          {{ question.type }}
        </span>
        <DifficultyBadge :difficulty="question.difficulty" />
        <span class="text-sm text-gray-500 dark:text-gray-400">{{ question.points }} pts</span>
      </div>
      <h1 class="mt-3 text-3xl font-bold">{{ question.title }}</h1>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <MarkdownRenderer :source="question.prompt" />
    </div>

    <div class="mt-6">
      <VerbalAnswerEditor v-if="question.type === 'verbal'" :question="question" />
      <CodingWorkspace v-else-if="codingQuestion" :question="codingQuestion" />
    </div>

    <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800">
      <QuestionNavigator :current-id="question.id" :questions="sectionQuestions" />
    </div>
  </section>
</template>
