<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    stdout?: string
    stderr?: string
  }>(),
  {
    stdout: '',
    stderr: '',
  },
)
</script>

<template>
  <div class="rounded-xl bg-gray-950 p-4 font-mono text-xs text-gray-100 dark:bg-black">
    <p class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Console output</p>
    <p v-if="!props.stdout && !props.stderr" class="text-gray-400">Run the sample tests to see program output here.</p>
    <pre v-if="props.stdout" class="whitespace-pre-wrap break-words" data-testid="run-stdout">{{ props.stdout }}</pre>
    <pre v-if="props.stderr" class="mt-2 whitespace-pre-wrap break-words text-rose-300" data-testid="run-stderr">{{ props.stderr }}</pre>
  </div>
</template>
