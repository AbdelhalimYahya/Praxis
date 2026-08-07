<script setup lang="ts">
import type { Question } from '~/types/question'

const props = defineProps<{
  currentId: string
  questions: Question[]
}>()

const index = computed(() => props.questions.findIndex((question) => question.id === props.currentId))
const prev = computed(() => (index.value > 0 ? props.questions[index.value - 1] : undefined))
const next = computed(() => (index.value >= 0 && index.value < props.questions.length - 1 ? props.questions[index.value + 1] : undefined))
</script>

<template>
  <div class="flex items-center justify-between gap-3">
    <NuxtLink
      v-if="prev"
      :to="`/sections/${prev.sectionId}/${prev.id}`"
      class="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      ← {{ prev.title }}
    </NuxtLink>
    <span v-else aria-hidden="true" />
    <NuxtLink
      v-if="next"
      :to="`/sections/${next.sectionId}/${next.id}`"
      class="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      {{ next.title }} →
    </NuxtLink>
  </div>
</template>
