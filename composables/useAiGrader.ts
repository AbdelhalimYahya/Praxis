import type { AiGradingResult } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'

// Phase 5 stub — returns a hardcoded fake result so the UI can be built
// end-to-end before real AI grading is wired in. Replaced in the AI
// integration phase (server/api/grade.post.ts + provider layer).
export function useAiGrader() {
  async function grade(_question: VerbalQuestion, userAnswer: string): Promise<AiGradingResult> {
    const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length
    const percent = Math.min(95, Math.max(20, 45 + Math.floor(wordCount / 3)))

    return {
      matchPercent: percent,
      verdict: percent >= 70 ? 'good' : percent >= 40 ? 'partial' : 'off-topic',
      aiUnderstanding: `This is a stub grader. Based on your ${wordCount}-word answer, the AI understood you are trying to explain the concept, but the real model has not been connected yet.`,
      missingPoints: ['Connect the AI grader (stub active).', 'Cover all the key points listed in the question.'],
      feedback: 'The answer editor, grading badge, and transparency panel are working. The real AI model replaces this stub in a later phase.',
      rawModelUsed: 'stub',
    }
  }

  return { grade }
}
