import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LanguageSelector from '../components/coding/LanguageSelector.vue'
import type { CodingQuestion } from '../types/question'

const question: CodingQuestion = {
  id: 'sample-c-01',
  sectionId: 'sample',
  type: 'coding',
  title: 'Sample coding',
  prompt: 'Implement sampleFunction.',
  difficulty: 'easy',
  tags: ['sample'],
  points: 10,
  functionName: 'sampleFunction',
  languageBoilerplate: {
    javascript: 'function sampleFunction() {}',
    python: 'def sample_function():\n    pass',
  },
  setupTests: [],
  fullTests: [],
}

describe('LanguageSelector', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('loads boilerplate when switching to an untouched language', async () => {
    const wrapper = mount(LanguageSelector, {
      props: { question, modelValue: 'javascript', code: question.languageBoilerplate.javascript },
    })

    await wrapper.get('select').setValue('python')

    expect(wrapper.emitted('update:modelValue')).toEqual([['python']])
    expect(wrapper.emitted('update:code')).toEqual([[question.languageBoilerplate.python]])
  })

  it('preserves per-language drafts instead of overwriting custom code', async () => {
    const wrapper = mount(LanguageSelector, {
      props: { question, modelValue: 'javascript', code: 'function sampleFunction() { return 1 }' },
    })

    await wrapper.get('select').setValue('python')
    await wrapper.setProps({ modelValue: 'python', code: 'def sample_function():\n    return 1' })
    await wrapper.get('select').setValue('javascript')

    expect(wrapper.emitted('update:code')?.[1]).toEqual(['function sampleFunction() { return 1 }'])
  })
})
