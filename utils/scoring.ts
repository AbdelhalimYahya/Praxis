import type { ProgressState } from '../types/progress'

export function clampPercent(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)))
}

// Section progress = average of best scores across the section's question ids.
// Unattempted questions count as 0 (they show separately as "not started").
export function computeSectionPercent(progress: ProgressState, questionIds: string[]): number {
  if (questionIds.length === 0) return 0
  const total = questionIds.reduce((sum, id) => sum + (progress[id]?.bestScorePercent ?? 0), 0)
  return Math.round(total / questionIds.length)
}

export function isSectionStarted(progress: ProgressState, questionIds: string[]): boolean {
  return questionIds.some((id) => (progress[id]?.attempts ?? 0) > 0)
}

export function isQuestionCompleted(progress: ProgressState, questionId: string): boolean {
  return (progress[questionId]?.bestScorePercent ?? 0) >= 100
}
