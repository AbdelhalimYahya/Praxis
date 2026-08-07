<script setup lang="ts">
const error = useError()

const title = computed(() => {
  if (error.value?.statusCode === 404) return 'Page not found'
  return 'Something went wrong'
})

function handleClearError() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center dark:bg-gray-950">
    <p class="text-6xl font-bold text-gray-900 dark:text-gray-100">
      {{ error?.statusCode || 'Error' }}
    </p>
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {{ title }}
    </h1>
    <p class="max-w-md text-gray-600 dark:text-gray-400">
      {{ error?.statusMessage || error?.message }}
    </p>
    <button class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500" @click="handleClearError">
      Back to home
    </button>
  </div>
</template>
