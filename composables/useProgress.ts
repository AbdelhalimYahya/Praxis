import type { QuestionProgress } from '~/types/progress'

export function useProgress() {
  const store = useProgressStore()
  const { allQuestions, getQuestionsBySectionId } = useQuestions()

  function getSectionPercent(sectionId: string): number {
    return store.getPercentForQuestions(getQuestionsBySectionId(sectionId).map((question) => question.id))
  }

  function isSectionStarted(sectionId: string): boolean {
    return store.getStarted(getQuestionsBySectionId(sectionId).map((question) => question.id))
  }

  function getOverallPercent(): number {
    return store.getPercentForQuestions(allQuestions.map((question) => question.id))
  }

  function isCompleted(questionId: string): boolean {
    return store.getCompleted(questionId)
  }

  function recordVerbal(questionId: string, scorePercent: number, answerDraft?: string) {
    store.recordAttempt(questionId, 'verbal', scorePercent, answerDraft)
  }

  function recordCoding(questionId: string, scorePercent: number) {
    store.recordAttempt(questionId, 'coding', scorePercent)
  }

  function getProgress(questionId: string): QuestionProgress | undefined {
    return store.getProgress(questionId)
  }

  function reset() {
    store.resetProgress()
  }

  return { getSectionPercent, isSectionStarted, getOverallPercent, isCompleted, recordVerbal, recordCoding, getProgress, reset }
}
