<script setup lang="ts">
import type { Question } from '~/types/question'

const props = defineProps<{
  questions: Question[]
}>()
</script>

<template>
  <div class="space-y-3">
    <QuestionCard v-for="question in props.questions" :key="question.id" :question="question" />
  </div>
</template>
