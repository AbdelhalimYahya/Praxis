<script setup lang="ts">
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'

const props = withDefaults(
  defineProps<{
    code: string
    language: string
    dark?: boolean
    height?: string
  }>(),
  {
    dark: false,
    height: '480px',
  },
)

const emit = defineEmits<{
  'update:code': [code: string]
}>()

const codeModel = computed({
  get: () => props.code,
  set: (value: string | undefined) => emit('update:code', value ?? ''),
})

const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  minimap: { enabled: false },
  padding: { top: 12 },
  scrollBeyondLastLine: false,
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700" :style="{ minHeight: '320px', height: props.height }">
    <VueMonacoEditor
      v-model:value="codeModel"
      :language="props.language"
      :theme="props.dark ? 'vs-dark' : 'vs'"
      :options="editorOptions"
      width="100%"
      :height="props.height"
    >
      <template #default>
        <p class="p-4 text-sm text-gray-500 dark:text-gray-400">Loading editor…</p>
      </template>
      <template #failure>
        <p class="p-4 text-sm text-rose-600 dark:text-rose-400">The editor failed to load. Check your connection and reload.</p>
      </template>
    </VueMonacoEditor>
  </div>
</template>
