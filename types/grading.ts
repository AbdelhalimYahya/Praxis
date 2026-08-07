export type Verdict = 'excellent' | 'good' | 'partial' | 'off-topic'

export interface AiGradingResult {
  matchPercent: number
  verdict: Verdict
  aiUnderstanding: string
  missingPoints: string[]
  feedback: string
  rawModelUsed: string
}

export interface TestRunResult {
  testId: string
  passed: boolean
  actualOutput?: unknown
  expectedOutput?: unknown
  stderr?: string
  runtimeMs?: number
  hidden?: boolean
}

export interface SubmissionResult {
  totalTests: number
  passedTests: number
  scorePercent: number
  allPassed: boolean
  results: TestRunResult[]
  compileError?: string
}
