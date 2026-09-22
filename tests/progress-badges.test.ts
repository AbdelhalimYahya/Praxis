import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuestionCard from '../components/questions/QuestionCard.vue'
import SectionList from '../components/sections/SectionList.vue'
import { useProgressStore } from '~/stores/progress.store'
import { useProgress } from '~/composables/useProgress'
import { useSections } from '~/composables/useSections'
import type { Question } from '../types/question'

vi.mock('@iconify/vue', () => ({
  Icon: { template: '<span aria-hidden="true" />' },
}))

const nuxtLinkStub = {
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

const sampleQuestion: Question = {
  id: 'sample-v-01',
  sectionId: 'sample',
  type: 'verbal',
  title: 'Sample verbal',
  prompt: 'Explain something.',
  difficulty: 'easy',
  tags: ['sample'],
  points: 5,
  idealAnswer: 'A complete explanation.',
  keyPoints: ['One important point'],
}

describe('progress badges', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('shows best scores and completion on question cards', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useProgressStore()
    store.recordAttempt(sampleQuestion.id, 'verbal', 80, 'draft')
    const wrapper = mount(QuestionCard, {
      props: { question: sampleQuestion },
      global: { plugins: [pinia], stubs: { NuxtLink: nuxtLinkStub } },
    })

    expect(wrapper.text()).toContain('80%')
    store.recordAttempt(sampleQuestion.id, 'verbal', 100, 'draft')
    await nextTick()
    expect(wrapper.find('[aria-label="Completed"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('propagates section percentages to section cards', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useProgressStore()
    store.recordAttempt('js-v-01', 'verbal', 100, 'draft')
    const { sections } = useSections()
    const expected = useProgress().getSectionPercent('javascript-fundamentals')
    const wrapper = mount(SectionList, {
      props: { sections: sections.value },
      global: { plugins: [pinia], stubs: { NuxtLink: nuxtLinkStub } },
    })

    expect(expected).toBeGreaterThan(0)
    expect(wrapper.text()).toContain(`${expected}%`)
    wrapper.unmount()
  })
})
