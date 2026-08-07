import type { QuestionProgress } from '~/stores/progress.store'

export function useProgress() {
  const store = useProgressStore()
  const { allQuestions, getQuestionsBySectionId } = useQuestions()

  function getSectionPercent(sectionId: string): number {
    return store.getPercentForQuestions(getQuestionsBySectionId(sectionId).map((question) => question.id))
  }

  function getOverallPercent(): number {
    return store.getPercentForQuestions(allQuestions.map((question) => question.id))
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

  return { getSectionPercent, getOverallPercent, recordVerbal, recordCoding, getProgress, reset, progress: store.storage }
}
