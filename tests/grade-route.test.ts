import { afterEach, describe, expect, it, vi } from 'vitest'
import type { VerbalQuestion } from '../types/question'
import { gradeAnswer, resolveGradeRuntimeConfig, type GradeFetch, type GradeRequest } from '../server/utils/grade.server'

const question: VerbalQuestion = {
  id: 'js-v-01',
  sectionId: 'javascript-fundamentals',
  type: 'verbal',
  title: 'What is a closure?',
  prompt: 'Explain closures and give an example.',
  difficulty: 'medium',
  tags: ['closures'],
  points: 10,
  idealAnswer: 'A closure preserves access to its lexical scope after the outer function returns.',
  keyPoints: ['Captures the outer scope', 'Remains available after the outer function returns'],
  minWords: 25,
}

const request: GradeRequest = {
  question,
  userAnswer: 'A closure preserves access to its lexical scope after the outer function returns.',
}

function remoteResult() {
  return {
    matchPercent: 88,
    verdict: 'excellent',
    aiUnderstanding: 'The answer describes scope preservation.',
    missingPoints: [],
    feedback: 'Excellent coverage.',
  }
}

describe('gradeAnswer', () => {
  it('uses the local heuristic without calling a provider when no key is configured', async () => {
    const fetchImpl = vi.fn<GradeFetch>().mockRejectedValue(new Error('must not be called'))
    const result = await gradeAnswer(request, { provider: 'openrouter', apiKey: '' }, fetchImpl)

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(result.rawModelUsed).toBe('local heuristic')
  })

  it('parses a valid OpenRouter response and labels it with the configured model', async () => {
    const calls: Array<{ url: string; body: string; authorization?: string }> = []
    const fetchImpl: GradeFetch = async (url, init) => {
      calls.push({ url, body: init.body, authorization: init.headers.Authorization })
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify(remoteResult()) } }] }) }
    }
    const result = await gradeAnswer(request, { provider: 'openrouter', apiKey: 'test-key', model: 'test-model' }, fetchImpl)

    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(calls[0]?.authorization).toBe('Bearer test-key')
    expect(JSON.parse(calls[0]?.body ?? '{}').model).toBe('test-model')
    expect(result).toMatchObject({ ...remoteResult(), rawModelUsed: 'test-model' })
  })

  it('parses a valid Gemini response', async () => {
    const fetchImpl: GradeFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(remoteResult()) }] } }] }),
    })
    const result = await gradeAnswer(request, { provider: 'gemini', apiKey: 'test-key', model: 'test-model' }, fetchImpl)

    expect(result).toMatchObject({ ...remoteResult(), rawModelUsed: 'test-model' })
  })

  it('falls back to the heuristic when remote JSON is malformed', async () => {
    const fetchImpl: GradeFetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '{"matchPercent": 200}' } }] }),
    })
    const result = await gradeAnswer(request, { provider: 'openrouter', apiKey: 'test-key' }, fetchImpl)

    expect(result.rawModelUsed).toBe('local heuristic')
  })

  it('falls back to the heuristic when the network request fails', async () => {
    const fetchImpl: GradeFetch = async () => {
      throw new Error('network unavailable')
    }
    const result = await gradeAnswer(request, { provider: 'gemini', apiKey: 'test-key' }, fetchImpl)

    expect(result.rawModelUsed).toBe('local heuristic')
  })

  it('rejects an invalid payload', async () => {
    const fetchImpl = vi.fn<GradeFetch>()
    await expect(gradeAnswer({ question, userAnswer: '' }, { provider: 'heuristic' }, fetchImpl)).rejects.toThrow(
      /Invalid grading request/,
    )
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('resolveGradeRuntimeConfig', () => {
  const originalProvider = process.env.AI_PROVIDER
  const originalKey = process.env.AI_API_KEY
  const originalModel = process.env.AI_MODEL

  afterEach(() => {
    process.env.AI_PROVIDER = originalProvider
    process.env.AI_API_KEY = originalKey
    process.env.AI_MODEL = originalModel
  })

  it('prefers documented AI environment variables', () => {
    process.env.AI_PROVIDER = 'openrouter'
    process.env.AI_API_KEY = 'environment-key'
    process.env.AI_MODEL = 'environment-model'

    expect(resolveGradeRuntimeConfig({ provider: 'heuristic', apiKey: 'runtime-key', model: 'runtime-model' })).toEqual({
      provider: 'openrouter',
      apiKey: 'environment-key',
      model: 'environment-model',
    })
  })

  it('falls back to runtime configuration', () => {
    delete process.env.AI_PROVIDER
    delete process.env.AI_API_KEY
    delete process.env.AI_MODEL

    expect(resolveGradeRuntimeConfig({ provider: 'gemini', apiKey: 'runtime-key', model: 'runtime-model' })).toEqual({
      provider: 'gemini',
      apiKey: 'runtime-key',
      model: 'runtime-model',
    })
  })
})
