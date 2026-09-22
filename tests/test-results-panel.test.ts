import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TestResultsPanel from '../components/coding/TestResultsPanel.vue'
import type { SubmissionResult } from '../types/grading'

const result: SubmissionResult = {
  totalTests: 2,
  passedTests: 1,
  scorePercent: 50,
  allPassed: false,
  results: [
    { testId: 'visible-1', passed: true, actualOutput: [0, 1], expectedOutput: [0, 1] },
    { testId: 'hidden-1', passed: false, actualOutput: [0, 0], expectedOutput: [1, 2], hidden: true },
  ],
}

describe('TestResultsPanel', () => {
  it('summarizes aggregate results and hides hidden-test details', () => {
    const wrapper = mount(TestResultsPanel, { props: { result } })
    const text = wrapper.text()

    expect(text).toContain('1 of 2 tests passed · 50%')
    expect(text).toContain('Needs another pass')
    expect(text).toContain('expected [0,1] · got [0,1]')
    expect(text).toContain('Hidden test · failed')
    expect(text).not.toContain('expected [1,2]')
  })

  it('celebrates a perfect submission', () => {
    const wrapper = mount(TestResultsPanel, { props: { result: { ...result, passedTests: 2, scorePercent: 100, allPassed: true } } })

    expect(wrapper.text()).toContain('All tests passed!')
  })
})
