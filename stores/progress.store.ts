import { defineStore } from 'pinia'
import type { ProgressState } from '~/types/progress'
import { computeSectionPercent, isQuestionCompleted, isSectionStarted } from '~/utils/scoring'

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

  function getProgress(questionId: string) {
    return progressState.value[questionId]
  }

  function getPercentForQuestions(questionIds: string[]): number {
    return computeSectionPercent(progressState.value, questionIds)
  }

  function getCompleted(questionId: string): boolean {
    return isQuestionCompleted(progressState.value, questionId)
  }

  function getStarted(questionIds: string[]): boolean {
    return isSectionStarted(progressState.value, questionIds)
  }

  function resetProgress() {
    persist({})
  }

  return { storage: progressState, recordAttempt, getProgress, getPercentForQuestions, getCompleted, getStarted, resetProgress }
})
