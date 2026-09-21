import type { AiGradingResult, Verdict } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'that',
  'the',
  'their',
  'this',
  'to',
  'was',
  'with',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function keyPointCoverage(answerTokens: Set<string>, keyPoint: string): number {
  const pointTokens = tokenize(keyPoint)
  if (pointTokens.length === 0) return 1
  const matched = pointTokens.filter((token) => answerTokens.has(token)).length
  return matched / pointTokens.length
}

function verdictForPercent(percent: number): Verdict {
  if (percent >= 85) return 'excellent'
  if (percent >= 70) return 'good'
  if (percent >= 40) return 'partial'
  return 'off-topic'
}

function feedbackForVerdict(verdict: Verdict): string {
  switch (verdict) {
    case 'excellent':
      return 'Strong answer: it covers the expected ideas in your own words.'
    case 'good':
      return 'Good answer: add one more concrete detail or missing key point.'
    case 'partial':
      return 'Partial answer: compare your response with the missing key points below.'
    default:
      return 'This does not yet address the question: start from one key point, then add an example.'
  }
}

// Deterministic local fallback used when no AI provider is available. It never
// calls the network and always returns a complete grading result.
export function gradeHeuristically(question: VerbalQuestion, userAnswer: string): AiGradingResult {
  const answerTokens = new Set(tokenize(userAnswer))
  const idealTokens = tokenize(question.idealAnswer)
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length

  const pointCoverage = question.keyPoints.map((point) => keyPointCoverage(answerTokens, point))
  const coverage = pointCoverage.length > 0 ? pointCoverage.filter((value) => value >= 0.5).length / pointCoverage.length : 0
  const overlap = idealTokens.length > 0 ? idealTokens.filter((token) => answerTokens.has(token)).length / idealTokens.length : 0
  const targetWords = Math.max(question.minWords ?? 25, 1)
  const lengthScore = Math.min(wordCount / targetWords, 1)

  const matchPercent = wordCount === 0 ? 0 : Math.round(100 * (0.65 * coverage + 0.25 * overlap + 0.1 * lengthScore))
  const verdict = verdictForPercent(matchPercent)
  const missingPoints = question.keyPoints.filter((_, index) => (pointCoverage[index] ?? 0) < 0.5)
  const coveredPoints = question.keyPoints.length - missingPoints.length

  return {
    matchPercent,
    verdict,
    aiUnderstanding: `The local heuristic matcher found ${coveredPoints} of ${question.keyPoints.length} expected ideas in a ${wordCount}-word answer.`,
    missingPoints,
    feedback: feedbackForVerdict(verdict),
    rawModelUsed: 'local heuristic',
  }
}
