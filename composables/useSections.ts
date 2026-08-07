import type { Section } from '~/types/section'
import sectionsData from '~/data/sections.json'

export function useSections() {
  const sections = ref<Section[]>(sectionsData as Section[])

  function getSectionBySlug(slug: string): Section | undefined {
    return sections.value.find((section: Section) => section.slug === slug)
  }

  function getSectionById(id: string): Section | undefined {
    return sections.value.find((section: Section) => section.id === id)
  }

  return { sections, getSectionBySlug, getSectionById }
}
