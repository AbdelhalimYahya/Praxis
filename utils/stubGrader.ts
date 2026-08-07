import type { AiGradingResult, Verdict } from '~/types/grading'

// Phase 5 stub grader — produces a deterministic-when-seeded fake result so the
// verbal workspace can be exercised end-to-end before the real AI provider is
// wired in. The injected `rng` (defaults to Math.random) keeps the result
// random while staying unit-testable.
export function generateStubResult(
  userAnswer: string,
  keyPoints: string[] = [],
  rng: () => number = Math.random,
): AiGradingResult {
  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length

  const percent = Math.round(20 + rng() * 75)
  const verdict: Verdict =
    percent >= 85 ? 'excellent' : percent >= 70 ? 'good' : percent >= 40 ? 'partial' : 'off-topic'

  const points = keyPoints.length > 0 ? keyPoints : ['Explain the core concept', 'Give a concrete example', 'Mention a common pitfall']
  let missingPoints = points.filter(() => rng() < 0.6)
  if (missingPoints.length === 0 && points.length > 0) {
    missingPoints = [points[Math.floor(rng() * points.length)]]
  }

  return {
    matchPercent: percent,
    verdict,
    aiUnderstanding: `The stub grader previewed your ${wordCount}-word answer and interpreted it as an attempt to explain the topic. A real model will paraphrase your actual argument here once connected.`,
    missingPoints,
    feedback:
      'The editor, animated score badge, and understanding panel are working end-to-end with sample data. The live AI provider replaces this stub in a later phase.',
    rawModelUsed: 'stub',
  }
}
