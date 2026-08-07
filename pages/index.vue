<script setup lang="ts">
const { sections } = useSections()
const progress = useProgress()

useHead({
  title: 'Praxis — Interview Prep',
  meta: [{ name: 'description', content: 'Practice interview questions across frontend, backend, system design and more, with AI answer grading and in-browser coding challenges.' }],
})
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-12">
    <div class="mb-10 max-w-2xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Interview prep tracks</h1>
      <p class="mt-3 text-gray-600 dark:text-gray-400">
        Pick a track, answer questions, and get graded. Verbal answers are checked by AI; coding challenges run against real test suites in your browser.
      </p>
    </div>

    <SectionList :sections="sections" />
  </section>
</template>
