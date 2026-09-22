import type { AiGradingResult } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'
import { generateStubResult } from '~/utils/stubGrader'

// Pluggable grading-provider contract. Concrete remote providers are added in
// later AI-integration work; the current Phase 5 stub remains the default.
export type AiGraderProviderName = 'openrouter' | 'gemini' | 'heuristic'

export interface AiGraderProvider {
  readonly name: AiGraderProviderName
  grade(question: VerbalQuestion, userAnswer: string): Promise<AiGradingResult>
}

function createHeuristicGraderProvider(): AiGraderProvider {
  return {
    name: 'heuristic',
    async grade(question: VerbalQuestion, userAnswer: string): Promise<AiGradingResult> {
      return generateStubResult(userAnswer, question.keyPoints)
    },
  }
}

export function createGraderProvider(name: AiGraderProviderName = 'heuristic'): AiGraderProvider {
  switch (name) {
    case 'heuristic':
      return createHeuristicGraderProvider()
    case 'openrouter':
    case 'gemini':
      throw new Error(`The ${name} grading provider is not implemented yet.`)
    default: {
      const unsupportedProvider: never = name
      throw new Error(`Unknown grading provider: ${unsupportedProvider}`)
    }
  }
}

// Browser entries always grade through the server API. The server selects the
// configured remote provider and falls back to the local heuristic.
export function useAiGrader() {
  async function grade(question: VerbalQuestion, userAnswer: string): Promise<AiGradingResult> {
    return await $fetch<AiGradingResult>('/api/grade', {
      method: 'POST',
      body: { question, userAnswer },
    })
  }

  return { grade }
}
