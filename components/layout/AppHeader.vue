<script setup lang="ts">
const route = useRoute()

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Progress', to: '/progress' },
  { label: 'About', to: '/about' },
]

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleDark() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const mobileOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
      <NuxtLink to="/" class="text-lg font-bold tracking-tight">
        Praxis<span class="text-indigo-600 dark:text-indigo-400">.</span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          :class="{ 'text-gray-900 dark:text-white': route.path === link.to }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark"
        >
          <span v-if="isDark" aria-hidden="true">☀</span>
          <span v-else aria-hidden="true">🌙</span>
        </button>

        <button
          class="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Toggle navigation menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span v-if="!mobileOpen" aria-hidden="true">☰</span>
          <span v-else aria-hidden="true">✕</span>
        </button>
      </div>
    </div>

    <nav v-if="mobileOpen" class="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800">
      <NuxtLink
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        class="block rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        @click="mobileOpen = false"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
