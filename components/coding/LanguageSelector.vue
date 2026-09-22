<script setup lang="ts">
import type { CodingQuestion, Language } from '~/types/question'
import languagesData from '~/data/languages.json'

const props = defineProps<{
  question: CodingQuestion
  modelValue: string
  code: string
}>()

const emit = defineEmits<{
  'update:modelValue': [languageId: string]
  'update:code': [code: string]
}>()

const languages = languagesData as Language[]

function draftKey(languageId: string): string {
  return `praxis.code.${props.question.id}.${languageId}`
}

function loadDraft(languageId: string, fallback = ''): string {
  const { value } = useLocalStorage<string>(draftKey(languageId), fallback)
  return value.value
}

function saveDraft(languageId: string, code: string) {
  useLocalStorage<string>(draftKey(languageId), code).set(code)
}

function selectLanguage(languageId: string) {
  if (languageId === props.modelValue) return

  if (props.code.trim().length > 0) {
    saveDraft(props.modelValue, props.code)
  }

  const draft = loadDraft(languageId)
  const boilerplate = props.question.languageBoilerplate[languageId]
  const nextCode = draft || boilerplate || props.code

  emit('update:modelValue', languageId)
  emit('update:code', nextCode)
  saveDraft(languageId, nextCode)
}
</script>

<template>
  <label class="flex flex-wrap items-center gap-3 text-sm">
    <span class="font-medium text-gray-700 dark:text-gray-300">Language</span>
    <select
      :value="props.modelValue"
      aria-label="Programming language"
      class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      @change="selectLanguage(($event.target as HTMLSelectElement).value)"
    >
      <option v-for="language in languages" :key="language.id" :value="language.id">
        {{ language.label }}
      </option>
    </select>
  </label>
</template>
