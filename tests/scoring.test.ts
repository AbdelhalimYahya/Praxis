import { describe, expect, it } from 'vitest'
import type { ProgressState } from '../types/progress'
import { clampPercent, computeSectionPercent, isQuestionCompleted, isSectionStarted } from '../utils/scoring'

function attempt(id: string, bestScorePercent: number, attempts = 1): ProgressState {
  return {
    [id]: {
      type: 'verbal',
      attempts,
      bestScorePercent,
      lastAttemptAt: '2026-01-01T00:00:00.000Z',
    },
  }
}

describe('computeSectionPercent', () => {
  it('returns 0 for an empty question list', () => {
    expect(computeSectionPercent({}, [])).toBe(0)
  })

  it('returns 0 when no questions in the section have been attempted', () => {
    expect(computeSectionPercent({}, ['q1', 'q2', 'q3'])).toBe(0)
  })

  it('averages best scores, counting unattempted questions as 0', () => {
    const progress = { ...attempt('q1', 80), ...attempt('q2', 60) }
    expect(computeSectionPercent(progress, ['q1', 'q2', 'q3', 'q4'])).toBe(35)
  })

  it('returns 100 when every question is completed', () => {
    const progress = { ...attempt('q1', 100), ...attempt('q2', 100) }
    expect(computeSectionPercent(progress, ['q1', 'q2'])).toBe(100)
  })

  it('rounds to the nearest integer', () => {
    const progress = attempt('q1', 33)
    expect(computeSectionPercent(progress, ['q1', 'q2', 'q3'])).toBe(11)
  })

  it('ignores unrelated progress entries outside the section', () => {
    const progress = attempt('q-other', 100)
    expect(computeSectionPercent(progress, ['q1', 'q2'])).toBe(0)
  })
})

describe('isSectionStarted', () => {
  it('is false when nothing was attempted', () => {
    expect(isSectionStarted({}, ['q1', 'q2'])).toBe(false)
  })

  it('is true when at least one question was attempted', () => {
    expect(isSectionStarted(attempt('q1', 50), ['q1', 'q2'])).toBe(true)
  })
})

describe('isQuestionCompleted', () => {
  it('is false for unattempted questions', () => {
    expect(isQuestionCompleted({}, 'q1')).toBe(false)
  })

  it('is true at a perfect score', () => {
    expect(isQuestionCompleted(attempt('q1', 100), 'q1')).toBe(true)
  })

  it('is false below a perfect score', () => {
    expect(isQuestionCompleted(attempt('q1', 99), 'q1')).toBe(false)
  })
})

describe('clampPercent', () => {
  it('clamps above 100 and below 0, and rounds', () => {
    expect(clampPercent(150)).toBe(100)
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(66.6)).toBe(67)
  })
})
