<script setup lang="ts">
const props = defineProps<{
  percent: number
}>()
</script>

<template>
  <div
    class="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
    role="progressbar"
    :aria-valuenow="props.percent"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Progress"
  >
    <div
      class="h-full rounded-full bg-indigo-500 transition-all duration-500"
      :style="{ width: `${Math.min(100, Math.max(0, props.percent))}%` }"
    />
  </div>
</template>
