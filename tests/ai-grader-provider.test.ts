import { describe, expect, it } from 'vitest'
import type { VerbalQuestion } from '../types/question'
import { createGraderProvider, useAiGrader } from '../composables/useAiGrader'

const question: VerbalQuestion = {
  id: 'js-v-01',
  sectionId: 'javascript-fundamentals',
  type: 'verbal',
  title: 'What is a closure?',
  prompt: 'Explain closures and give an example.',
  difficulty: 'medium',
  tags: ['closures'],
  points: 10,
  idealAnswer: 'A closure preserves access to its lexical scope.',
  keyPoints: ['Captures the outer scope', 'Remains available after the outer function returns'],
}

describe('createGraderProvider', () => {
  it('defaults to the heuristic provider', () => {
    expect(createGraderProvider().name).toBe('heuristic')
  })

  it('returns a provider whose grading result has the required shape', async () => {
    const provider = createGraderProvider('heuristic')
    const result = await provider.grade(question, 'A closure preserves its lexical scope after the outer function returns.')

    expect(result.matchPercent).toBeGreaterThanOrEqual(20)
    expect(result.matchPercent).toBeLessThanOrEqual(95)
    expect(result.missingPoints.length).toBeGreaterThan(0)
    expect(result.rawModelUsed).toBe('stub')
  })

  it('rejects remote providers until they are implemented', () => {
    for (const name of ['openrouter', 'gemini'] as const) {
      expect(() => createGraderProvider(name)).toThrow(/not implemented yet/)
    }
  })

  it('rejects an unknown provider name', () => {
    expect(() => createGraderProvider('direct' as never)).toThrow(/Unknown grading provider/)
  })
})

describe('useAiGrader', () => {
  it('continues to delegate grading through the selected provider', async () => {
    const { provider, grade } = useAiGrader('heuristic')
    const result = await grade(question, 'A closure preserves its lexical scope after the outer function returns.')

    expect(provider.name).toBe('heuristic')
    expect(result.rawModelUsed).toBe('stub')
  })
})
