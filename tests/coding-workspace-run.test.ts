import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import CodingWorkspace from '../components/coding/CodingWorkspace.vue'
import type { CodingQuestion } from '../types/question'
import { runTests } from '~/utils/testRunner'

vi.mock('@guolao/vue-monaco-editor', () => ({
  VueMonacoEditor: {
    name: 'VueMonacoEditor',
    props: ['value', 'language', 'theme', 'options', 'width', 'height'],
    emits: ['update:value'],
    template: '<div class="monaco-stub" />',
  },
}))

vi.mock('~/utils/testRunner', () => ({
  runTests: vi.fn(),
}))

mockNuxtImport('useColorMode', () => () => ({ value: 'light' }))

const runTestsMock = vi.mocked(runTests)

const question: CodingQuestion = {
  id: 'js-c-01',
  sectionId: 'javascript-fundamentals',
  type: 'coding',
  title: 'Two Sum',
  prompt: 'Return indices.',
  difficulty: 'easy',
  tags: ['arrays'],
  points: 10,
  functionName: 'twoSum',
  languageBoilerplate: { javascript: 'function twoSum(nums, target) {}' },
  setupTests: [{ id: 'setup-1', input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] }],
  fullTests: [],
}

describe('CodingWorkspace run flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    runTestsMock.mockReset()
  })

  it('runs sample tests and shows passing results plus console output', async () => {
    runTestsMock.mockResolvedValue({
      totalTests: 1,
      passedTests: 1,
      scorePercent: 100,
      allPassed: true,
      results: [{ testId: 'setup-1', passed: true, actualOutput: [0, 1], expectedOutput: [0, 1] }],
      stdout: 'sample stdout',
      stderr: '',
    })
    const wrapper = mount(CodingWorkspace, { props: { question } })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(runTestsMock).toHaveBeenCalledWith(question, 'function twoSum(nums, target) {}', 'javascript', question.setupTests)
    expect(wrapper.text()).toContain('Passed')
    expect(wrapper.text()).toContain('sample stdout')
    wrapper.unmount()
  })

  it('surfaces runner failures without crashing', async () => {
    runTestsMock.mockRejectedValue(new Error('Piston request failed with status 500.'))
    const wrapper = mount(CodingWorkspace, { props: { question } })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Piston request failed with status 500.')
    expect(wrapper.text()).toContain('Pending')
    wrapper.unmount()
  })
})
