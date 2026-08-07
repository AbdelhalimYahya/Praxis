<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const props = defineProps<{
  source: string
}>()

const md = new MarkdownIt({ html: false, linkify: true })

const html = computed(() => md.render(props.source))
</script>

<template>
  <div
    class="prose-sm prose max-w-none text-gray-700 dark:text-gray-300
      prose-headings:text-gray-900 dark:prose-headings:text-gray-100
      prose-a:text-indigo-600 dark:prose-a:text-indigo-400
      prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-medium dark:prose-code:bg-gray-800
      prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950"
    v-html="html"
  />
</template>
