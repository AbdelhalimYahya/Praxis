import type { AiGradingResult } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'
import { generateStubResult } from '~/utils/stubGrader'

// Phase 5 stub — returns a randomized fake result so the UI can be built
// end-to-end before real AI grading is wired in. Replaced in the AI
// integration phase (server/api/grade.post.ts + provider layer).
export function useAiGrader() {
  async function grade(question: VerbalQuestion, userAnswer: string): Promise<AiGradingResult> {
    return generateStubResult(userAnswer, question.keyPoints)
  }

  return { grade }
}
