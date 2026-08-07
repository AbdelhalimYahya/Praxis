<script setup lang="ts">
const route = useRoute()

const showSidebar = computed(() => route.path.startsWith('/sections/'))
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <AppHeader />
    <div class="flex flex-1">
      <AppSidebar v-if="showSidebar" />
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
    <AppFooter />
  </div>
</template>
