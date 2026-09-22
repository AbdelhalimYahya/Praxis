import type { SubmissionResult, TestRunResult } from '~/types/grading'
import type { CodingQuestion, Language, TestCase } from '~/types/question'
import languagesData from '~/data/languages.json'

export const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute'
const RESULTS_START = '__PRAXIS_RESULTS_START__'
const RESULTS_END = '__PRAXIS_RESULTS_END__'

export interface PistonTestResponse {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

export type PistonFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<PistonTestResponse>

const languages = languagesData as Language[]

function getLanguage(languageId: string): Language {
  const language = languages.find((entry) => entry.id === languageId)
  if (!language) {
    throw new Error(`Unsupported language: ${languageId}`)
  }
  return language
}

export function buildJavascriptHarness(functionName: string, userCode: string, testCases: TestCase[]): string {
  const harnessCases = testCases.map((testCase) => ({
    id: testCase.id,
    input: testCase.input,
    expected: testCase.expectedOutput,
  }))

  return `${userCode}

const __PRAXIS_TESTS__ = ${JSON.stringify(harnessCases)};

function __praxisIsEqual(actual, expected) {
  if (Object.is(actual, expected)) return true;
  if (typeof actual !== typeof expected) return false;
  if (actual && expected && typeof actual === 'object') {
    if (Array.isArray(actual) !== Array.isArray(expected)) return false;
    const actualKeys = Object.keys(actual);
    const expectedKeys = Object.keys(expected);
    if (actualKeys.length !== expectedKeys.length) return false;
    return actualKeys.every(
      (key) => Object.prototype.hasOwnProperty.call(expected, key) && __praxisIsEqual(actual[key], expected[key]),
    );
  }
  return false;
}

function __praxisErrorText(error) {
  if (error instanceof Error) return error.stack || error.message;
  return String(error);
}

const __praxisResults__ = [];
const __praxisTarget__ = globalThis[${JSON.stringify(functionName)}];
if (typeof __praxisTarget__ !== 'function') {
  for (const testCase of __PRAXIS_TESTS__) {
    __praxisResults__.push({
      testId: testCase.id,
      passed: false,
      actualOutput: null,
      expectedOutput: testCase.expected,
      stderr: \`Function "\${${JSON.stringify(functionName)}}" is not defined.\`,
    });
  }
} else {
  for (const testCase of __PRAXIS_TESTS__) {
    let actualOutput = null;
    let stderr;
    let passed = false;
    try {
      actualOutput = __praxisTarget__(...testCase.input);
      passed = __praxisIsEqual(actualOutput, testCase.expected);
    } catch (error) {
      stderr = __praxisErrorText(error);
    }
    __praxisResults__.push({
      testId: testCase.id,
      passed,
      actualOutput: actualOutput === undefined ? null : actualOutput,
      expectedOutput: testCase.expected,
      stderr,
    });
  }
}

console.log('${RESULTS_START}' + JSON.stringify({ results: __praxisResults__ }) + '${RESULTS_END}');
`
}

function extractResultsPayload(stdout: string): { results: Array<{ testId: string; passed: boolean; actualOutput?: unknown; stderr?: string }> } {
  const start = stdout.lastIndexOf(RESULTS_START)
  const end = stdout.lastIndexOf(RESULTS_END)
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('The Piston response did not contain a test-result payload.')
  }

  const parsed = JSON.parse(stdout.slice(start + RESULTS_START.length, end)) as {
    results?: Array<{ testId: string; passed: boolean; actualOutput?: unknown; stderr?: string }>
  }
  if (!Array.isArray(parsed.results)) {
    throw new Error('The Piston response contained a malformed test-result payload.')
  }
  return { results: parsed.results }
}

function toSubmissionResult(testCases: TestCase[], payload: { results: Array<{ testId: string; passed: boolean; actualOutput?: unknown; stderr?: string }> }): SubmissionResult {
  const results: TestRunResult[] = testCases.map((testCase) => {
    const match = payload.results.find((result) => result.testId === testCase.id)
    return {
      testId: testCase.id,
      passed: match?.passed ?? false,
      actualOutput: match?.actualOutput ?? null,
      expectedOutput: testCase.expectedOutput,
      stderr: match?.stderr,
      hidden: testCase.hidden ?? false,
    }
  })
  const passedTests = results.filter((result) => result.passed).length

  return {
    totalTests: results.length,
    passedTests,
    scorePercent: results.length === 0 ? 0 : Math.round((passedTests / results.length) * 100),
    allPassed: results.length > 0 && passedTests === results.length,
    results,
  }
}

export async function runTests(
  question: CodingQuestion,
  code: string,
  languageId: string,
  testCases: TestCase[],
  fetchImpl: PistonFetch = fetch as unknown as PistonFetch,
): Promise<SubmissionResult & { stdout: string; stderr: string }> {
  if (testCases.length === 0) {
    throw new Error('At least one test case is required.')
  }

  const language = getLanguage(languageId)
  if (language.id !== 'javascript') {
    throw new Error(`The ${language.label} test harness is not implemented yet.`)
  }

  const response = await fetchImpl(PISTON_EXECUTE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: language.pistonLanguage,
      version: language.pistonVersion,
      files: [{ content: buildJavascriptHarness(question.functionName, code, testCases) }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Piston request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as {
    run?: { stdout?: unknown; stderr?: unknown }
    compile?: { stderr?: unknown }
  }
  const stdout = typeof payload.run?.stdout === 'string' ? payload.run.stdout : ''
  const stderr = typeof payload.run?.stderr === 'string' ? payload.run.stderr : ''
  const compileStderr = typeof payload.compile?.stderr === 'string' ? payload.compile.stderr : ''

  try {
    const submission = toSubmissionResult(testCases, extractResultsPayload(stdout))
    return { ...submission, stdout, stderr }
  } catch {
    const compileError = [compileStderr, stderr].filter((text) => text.trim().length > 0).join('\n').trim()
    return {
      totalTests: testCases.length,
      passedTests: 0,
      scorePercent: 0,
      allPassed: false,
      results: testCases.map((testCase) => ({
        testId: testCase.id,
        passed: false,
        actualOutput: null,
        expectedOutput: testCase.expectedOutput,
        hidden: testCase.hidden ?? false,
      })),
      compileError: compileError || 'The submitted code did not produce test results.',
      stdout,
      stderr,
    }
  }
}
