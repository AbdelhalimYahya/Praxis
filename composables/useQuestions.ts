import type { Question } from '~/types/question'

// Eagerly load every question file at build time. Each file is a JSON array
// named after its section slug (see data/questions/<slug>.json).
const files = import.meta.glob<Question[]>('~/data/questions/*.json', {
  eager: true,
  import: 'default',
})

const allQuestions: Question[] = Object.values(files).flat()

export function useQuestions() {
  function getQuestionsBySectionId(sectionId: string): Question[] {
    return allQuestions.filter((question) => question.sectionId === sectionId)
  }

  function getQuestionById(id: string): Question | undefined {
    return allQuestions.find((question) => question.id === id)
  }

  return { allQuestions, getQuestionsBySectionId, getQuestionById }
}
