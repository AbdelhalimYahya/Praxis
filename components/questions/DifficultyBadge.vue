<script setup lang="ts">
import type { Question } from '~/types/question'

const props = defineProps<{
  difficulty: Question['difficulty']
}>()

const styles: Record<Question['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  hard: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
}

const labels: Record<Question['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}
</script>

<template>
  <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide" :class="styles[props.difficulty]">
    {{ labels[props.difficulty] }}
  </span>
</template>
