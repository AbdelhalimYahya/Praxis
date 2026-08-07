import { describe, expect, it } from 'vitest'
import { generateStubResult } from '../utils/stubGrader'

const KEY_POINTS = ['Closure captures outer scope', 'Keeps scope alive after return', 'Used for data privacy']

describe('generateStubResult', () => {
  it('returns a percent within the 20-95 band for many draws', () => {
    for (let i = 0; i < 200; i++) {
      const result = generateStubResult('some answer text here', KEY_POINTS)
      expect(result.matchPercent).toBeGreaterThanOrEqual(20)
      expect(result.matchPercent).toBeLessThanOrEqual(95)
    }
  })

  it('is deterministic given a seeded rng', () => {
    const rng = () => 0.5
    const a = generateStubResult('a fairly long answer with enough words to parse', KEY_POINTS, rng)
    const b = generateStubResult('a fairly long answer with enough words to parse', KEY_POINTS, rng)
    expect(a).toEqual(b)
  })

  it('maps high percent to excellent verdict', () => {
    const result = generateStubResult('answer', KEY_POINTS, () => 0.99)
    expect(result.matchPercent).toBeGreaterThanOrEqual(85)
    expect(result.verdict).toBe('excellent')
  })

  it('maps low percent to off-topic verdict', () => {
    const result = generateStubResult('answer', KEY_POINTS, () => 0)
    expect(result.matchPercent).toBeLessThanOrEqual(40)
    expect(result.verdict).toBe('off-topic')
  })

  it('always reports at least one missing point when key points exist', () => {
    const result = generateStubResult('answer', KEY_POINTS, () => 0.99)
    expect(result.missingPoints.length).toBeGreaterThan(0)
  })

  it('picks missingPoints exclusively from the given key points', () => {
    const rng = () => 0.1
    const result = generateStubResult('answer', KEY_POINTS, rng)
    for (const point of result.missingPoints) {
      expect(KEY_POINTS).toContain(point)
    }
  })

  it('falls back to default key points when none are supplied', () => {
    const result = generateStubResult('answer', [], () => 0.5)
    expect(result.missingPoints.length).toBeGreaterThan(0)
    expect(result.missingPoints.every((point) => typeof point === 'string' && point.length > 0)).toBe(true)
  })

  it('counts words and reports the stub as the grading source', () => {
    const result = generateStubResult('one two three', [], () => 0.5)
    expect(result.aiUnderstanding).toContain('3-word')
    expect(result.rawModelUsed).toBe('stub')
  })

  it('produces all required result fields', () => {
    const result = generateStubResult('some words', KEY_POINTS, () => 0.5)
    expect(result).toMatchObject({
      matchPercent: expect.any(Number),
      verdict: expect.any(String),
      aiUnderstanding: expect.any(String),
      missingPoints: expect.any(Array),
      feedback: expect.any(String),
      rawModelUsed: 'stub',
    })
  })
})
