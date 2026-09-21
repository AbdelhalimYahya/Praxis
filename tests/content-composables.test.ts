import { describe, expect, it } from 'vitest'
import type { Section } from '../types/section'
import { useQuestions } from '../composables/useQuestions'
import { useSections } from '../composables/useSections'

describe('content composables', () => {
  it('exposes seventeen uniquely ordered sections', () => {
    const { sections, getSectionBySlug } = useSections()

    expect(sections.value).toHaveLength(17)
    expect(new Set(sections.value.map((section: Section) => section.id)).size).toBe(17)
    expect(sections.value.map((section: Section) => section.order).sort((a: number, b: number) => a - b)).toEqual(
      sections.value.map((_: Section, index: number) => index + 1),
    )
    expect(getSectionBySlug('javascript-fundamentals')?.title).toBe('JavaScript Fundamentals')
    expect(getSectionBySlug('missing-section')).toBeUndefined()
  })

  it('resolves questions by section and by id', () => {
    const { allQuestions, getQuestionById, getQuestionsBySectionId } = useQuestions()
    const javascriptQuestions = getQuestionsBySectionId('javascript-fundamentals')

    expect(allQuestions.length).toBeGreaterThan(0)
    expect(javascriptQuestions.length).toBeGreaterThan(0)
    expect(javascriptQuestions.every((question) => question.sectionId === 'javascript-fundamentals')).toBe(true)
    expect(getQuestionById('js-v-01')?.sectionId).toBe('javascript-fundamentals')
    expect(getQuestionById('missing-question')).toBeUndefined()
  })
})
