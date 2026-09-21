import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import QuestionList from '../components/questions/QuestionList.vue'
import QuestionNavigator from '../components/questions/QuestionNavigator.vue'
import type { Question } from '../types/question'

const verbalQuestion: Question = {
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

const codingQuestion: Question = {
  id: 'sample-c-01',
  sectionId: 'sample',
  type: 'coding',
  title: 'Sample coding',
  prompt: 'Implement something.',
  difficulty: 'medium',
  tags: ['sample'],
  points: 10,
  functionName: 'sampleFunction',
  languageBoilerplate: { javascript: 'function sampleFunction() {}' },
  setupTests: [],
  fullTests: [],
}

const nuxtLinkStub = {
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

describe('question browsing', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
  })

  it('lists verbal and coding questions with workspace links', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const wrapper = mount(QuestionList, {
      props: { questions: [verbalQuestion, codingQuestion] },
      global: { plugins: [pinia], stubs: { NuxtLink: nuxtLinkStub } },
    })

    expect(wrapper.text()).toContain('Sample verbal')
    expect(wrapper.text()).toContain('Sample coding')
    expect(wrapper.find('a[href="/sections/sample/sample-v-01"]').exists()).toBe(true)
    expect(wrapper.find('a[href="/sections/sample/sample-c-01"]').exists()).toBe(true)
  })

  it('navigates between ordered questions', () => {
    const wrapper = mount(QuestionNavigator, {
      props: { currentId: 'sample-v-01', questions: [verbalQuestion, codingQuestion] },
      global: { stubs: { NuxtLink: nuxtLinkStub } },
    })

    expect(wrapper.find('a[href="/sections/sample/sample-c-01"]').text()).toContain('Sample coding')
  })
})
