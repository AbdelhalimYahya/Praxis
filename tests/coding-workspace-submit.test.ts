import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import CodingWorkspace from '../components/coding/CodingWorkspace.vue'
import SubmitResultModal from '../components/coding/SubmitResultModal.vue'
import type { SubmissionResult } from '../types/grading'
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
  fullTests: [{ id: 'full-1', input: [[3, 2, 4], 6], expectedOutput: [1, 2], hidden: true }],
}

const submission: SubmissionResult = {
  totalTests: 1,
  passedTests: 1,
  scorePercent: 100,
  allPassed: true,
  results: [{ testId: 'full-1', passed: true, actualOutput: [1, 2], expectedOutput: [1, 2], hidden: true }],
}

describe('SubmitResultModal', () => {
  it('shows loading, perfect-submission, and error states', async () => {
    const loading = mount(SubmitResultModal, { props: { open: true, submitting: true } })
    expect(loading.text()).toContain('Running the full test suite')
    loading.unmount()

    const success = mount(SubmitResultModal, { props: { open: true, result: submission } })
    expect(success.text()).toContain('100%')
    expect(success.text()).toContain('Perfect submission')
    await success.get('button[aria-label="Close submission summary"]').trigger('click')
    expect(success.emitted('close')).toHaveLength(1)
    success.unmount()

    const failure = mount(SubmitResultModal, { props: { open: true, error: 'Piston is unavailable.' } })
    await failure.get('button').trigger('click')
    expect(failure.emitted('close')).toHaveLength(1)
    failure.unmount()
  })
})

describe('CodingWorkspace submit flow', () => {
  beforeEach(() => {
    window.localStorage.clear()
    runTestsMock.mockReset()
  })

  it('submits the full suite and shows the summary modal', async () => {
    runTestsMock.mockResolvedValue({ ...submission, stdout: 'full stdout', stderr: '' })
    const wrapper = mount(CodingWorkspace, { props: { question } })

    await wrapper.get('[data-testid="submit-button"]').trigger('click')
    await flushPromises()

    expect(runTestsMock).toHaveBeenCalledWith(question, 'function twoSum(nums, target) {}', 'javascript', question.fullTests)
    expect(wrapper.text()).toContain('Submission results')
    expect(wrapper.text()).toContain('Perfect submission')
    wrapper.unmount()
  })
})
