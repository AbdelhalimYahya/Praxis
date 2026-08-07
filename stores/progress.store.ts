import { defineStore } from 'pinia'

export interface QuestionProgress {
  type: 'verbal' | 'coding'
  attempts: number
  bestScorePercent: number
  lastAttemptAt: string
  answerDraft?: string
}

interface ProgressState {
  [questionId: string]: QuestionProgress
}

export const useProgressStore = defineStore('progress', () => {
  const { value: progressState, set: persist } = useLocalStorage<ProgressState>('praxis.progress', {})

  function recordAttempt(questionId: string, type: 'verbal' | 'coding', scorePercent: number, answerDraft?: string) {
    const previous = progressState.value[questionId]
    progressState.value = {
      ...progressState.value,
      [questionId]: {
        type,
        attempts: (previous?.attempts ?? 0) + 1,
        bestScorePercent: Math.max(previous?.bestScorePercent ?? 0, Math.round(scorePercent)),
        lastAttemptAt: new Date().toISOString(),
        answerDraft: answerDraft ?? previous?.answerDraft,
      },
    }
  }

  function getProgress(questionId: string): QuestionProgress | undefined {
    return progressState.value[questionId]
  }

  // Average best score across the given question ids; unattempted questions count as 0.
  function getPercentForQuestions(questionIds: string[]): number {
    if (questionIds.length === 0) return 0
    const total = questionIds.reduce((sum, id) => sum + (progressState.value[id]?.bestScorePercent ?? 0), 0)
    return Math.round(total / questionIds.length)
  }

  function resetProgress() {
    persist({})
  }

  return { storage: progressState, recordAttempt, getProgress, getPercentForQuestions, resetProgress }
})
