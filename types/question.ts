export interface TestCase {
  id: string
  input: unknown[]
  expectedOutput: unknown
  hidden?: boolean
  description?: string
}

export interface BaseQuestion {
  id: string
  sectionId: string
  type: 'verbal' | 'coding'
  title: string
  prompt: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  points: number
  hints?: string[]
}

export interface VerbalQuestion extends BaseQuestion {
  type: 'verbal'
  idealAnswer: string
  keyPoints: string[]
  minWords?: number
}

export interface CodingQuestion extends BaseQuestion {
  type: 'coding'
  functionName: string
  languageBoilerplate: Record<string, string>
  setupTests: TestCase[]
  fullTests: TestCase[]
  timeLimitMs?: number
  constraints?: string[]
}

export type Question = VerbalQuestion | CodingQuestion

export interface Language {
  id: string
  label: string
  pistonLanguage: string
  pistonVersion: string
  monacoLang: string
}
