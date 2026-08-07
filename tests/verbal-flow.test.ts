import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { useProgressStore } from '~/stores/progress.store'
import VerbalAnswerEditor from '~/components/verbal/VerbalAnswerEditor.vue'
import type { VerbalQuestion } from '~/types/question'

// The real @iconify/vue Icon fetches icon data from the network on mount,
// which happy-dom cannot complete — stub it out to keep the tests offline.
vi.mock('@iconify/vue', () => ({
  Icon: { template: '<span aria-hidden="true" />' },
}))

const verbalQuestion: VerbalQuestion = {
  id: 'js-v-01',
  sectionId: 'javascript-fundamentals',
  type: 'verbal',
  title: 'What is a closure?',
  prompt: 'Explain what a closure is and when you would use one.',
  difficulty: 'medium',
  tags: ['closures'],
  points: 10,
  hints: ['Think about lexical scope'],
  minWords: 5,
  idealAnswer: 'A closure is a function that captures its lexical scope even after the outer function returns.',
  keyPoints: ['Captures the outer scope', 'Keeps the scope alive after return', 'Enables data privacy'],
}

let wrapper: VueWrapper | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('VerbalAnswerEditor full flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  function mountEditor() {
    const pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(VerbalAnswerEditor, {
      props: { question: verbalQuestion },
      global: { plugins: [pinia] },
    })
    return wrapper
  }

  it('disables the grade button while the answer is empty', () => {
    const w = mountEditor()
    expect((w.get('button').element as HTMLButtonElement).disabled).toBe(true)
  })

  it('flags the min-words requirement as not met for a short answer', async () => {
    const w = mountEditor()
    await w.get('textarea').setValue('too short')
    expect(w.text()).toContain('(not met)')
  })

  it('grades an answer end-to-end and renders the full result panel', async () => {
    const w = mountEditor()
    const answer =
      'A closure captures the outer scope and keeps it alive after the outer function returns, which enables data privacy.'
    await w.get('textarea').setValue(answer)
    await w.get('button').trigger('click')
    await flushPromises()

    const text = w.text()
    expect(text).toMatch(/\d+%/)
    expect(text).toContain('match')
    expect(text).toMatch(/Excellent|Good|Partial|Off-topic/)
    expect(text).toContain('Graded by')
    expect(text).toContain('stub')
    expect(text).toContain('Missing key points')
    expect(text).toContain('What the AI understood from your answer')
  })

  it('records the attempt in the progress store with a stub score', async () => {
    const w = mountEditor()
    await w.get('textarea').setValue('A closure captures the outer scope and keeps it alive after return.')
    await w.get('button').trigger('click')
    await flushPromises()

    const store = useProgressStore()
    const progress = store.getProgress(verbalQuestion.id)
    expect(progress?.type).toBe('verbal')
    expect(progress?.attempts).toBe(1)
    expect(progress?.bestScorePercent).toBeGreaterThanOrEqual(20)
    expect(progress?.bestScorePercent).toBeLessThanOrEqual(95)
    expect(progress?.answerDraft).toContain('closure')
  })
})
