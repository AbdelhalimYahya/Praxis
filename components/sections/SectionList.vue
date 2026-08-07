<script setup lang="ts">
import type { Section } from '~/types/section'

const props = defineProps<{
  sections: Section[]
}>()

const progress = useProgress()
</script>

<template>
  <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <SectionCard
      v-for="section in props.sections"
      :key="section.slug"
      :section="section"
      :progress="progress.getSectionPercent(section.id)"
    />
  </div>
</template>
