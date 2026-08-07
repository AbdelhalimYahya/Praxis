export interface QuestionProgress {
  type: 'verbal' | 'coding'
  attempts: number
  bestScorePercent: number
  lastAttemptAt: string
  answerDraft?: string
}

export interface ProgressState {
  [questionId: string]: QuestionProgress
}
