import { describe, expect, it } from 'vitest'
import type { VerbalQuestion } from '../types/question'
import { gradeHeuristically } from '../utils/diffScoring'

const question: VerbalQuestion = {
  id: 'js-v-01',
  sectionId: 'javascript-fundamentals',
  type: 'verbal',
  title: 'What is a closure?',
  prompt: 'Explain closures and give an example.',
  difficulty: 'medium',
  tags: ['closures'],
  points: 10,
  idealAnswer:
    'A closure preserves access to its lexical scope after the outer function returns. Closures support data privacy, factory functions, and memoization.',
  keyPoints: ['Lexical scope', 'Function retains access after the outer function returns', 'Used for data privacy'],
  minWords: 25,
}

describe('gradeHeuristically', () => {
  it('rewards an answer that covers the expected ideas', () => {
    const result = gradeHeuristically(
      question,
      'A closure preserves access to its lexical scope after the outer function returns. I use this behavior for data privacy in factory functions and memoization.',
    )

    expect(result.matchPercent).toBeGreaterThanOrEqual(85)
    expect(result.verdict).toBe('excellent')
    expect(result.missingPoints).toEqual([])
    expect(result.rawModelUsed).toBe('local heuristic')
  })

  it('penalizes an unrelated answer', () => {
    const result = gradeHeuristically(question, 'Photosynthesis converts sunlight, water, and carbon dioxide into plant energy.')

    expect(result.matchPercent).toBeLessThan(40)
    expect(result.verdict).toBe('off-topic')
    expect(result.missingPoints).toEqual(question.keyPoints)
  })

  it('handles an empty answer as a complete miss', () => {
    const result = gradeHeuristically(question, '   ')

    expect(result).toMatchObject({
      matchPercent: 0,
      verdict: 'off-topic',
      missingPoints: question.keyPoints,
      rawModelUsed: 'local heuristic',
    })
  })

  it('is deterministic', () => {
    const answer = 'Closures preserve lexical scope and support data privacy.'
    expect(gradeHeuristically(question, answer)).toEqual(gradeHeuristically(question, answer))
  })
})
