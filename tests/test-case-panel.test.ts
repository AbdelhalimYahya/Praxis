import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TestCasePanel from '../components/coding/TestCasePanel.vue'
import type { TestRunResult } from '../types/grading'
import type { TestCase } from '../types/question'

const cases: TestCase[] = [
  { id: 'setup-1', input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], description: 'Basic case' },
  { id: 'setup-2', input: [[3, 2, 4], 6], expectedOutput: [1, 2], description: 'Second case' },
]

const results: TestRunResult[] = [
  { testId: 'setup-1', passed: true, actualOutput: [0, 1], expectedOutput: [0, 1] },
  { testId: 'setup-2', passed: false, actualOutput: [0, 0], expectedOutput: [1, 2] },
]

describe('TestCasePanel', () => {
  it('renders inputs, expected outputs, actual outputs, and statuses', () => {
    const wrapper = mount(TestCasePanel, { props: { cases, results } })
    const text = wrapper.text()

    expect(text).toContain('Basic case')
    expect(text).toContain('[[2,7,11,15],9]')
    expect(text).toContain('[0,1]')
    expect(text).toContain('[0,0]')
    expect(text).toContain('Passed')
    expect(text).toContain('Failed')
  })

  it('marks unexecuted tests as pending', () => {
    const wrapper = mount(TestCasePanel, { props: { cases } })

    expect(wrapper.text()).toContain('Pending')
    expect(wrapper.text()).toContain('—')
  })
})
