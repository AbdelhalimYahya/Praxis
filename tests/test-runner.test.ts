import { describe, expect, it, vi } from 'vitest'
import type { CodingQuestion, TestCase } from '../types/question'
import { PISTON_EXECUTE_URL, buildJavascriptHarness, runTests, type PistonFetch } from '../utils/testRunner'

const question: CodingQuestion = {
  id: 'js-c-01',
  sectionId: 'javascript-fundamentals',
  type: 'coding',
  title: 'Two Sum',
  prompt: 'Return indices.',
  difficulty: 'easy',
  tags: ['arrays'],
  points: 10,
  functionName: 'twoSum',
  languageBoilerplate: { javascript: 'function twoSum(nums, target) {}' },
  setupTests: [],
  fullTests: [],
}

const testCases: TestCase[] = [
  { id: 'setup-1', input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
  { id: 'setup-2', input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
]

function pistonResponse(stdout: string, stderr = ''): PistonFetch {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({ run: { stdout, stderr } }),
  })
}

function resultsStdout(results: unknown): string {
  return `other log\n__PRAXIS_RESULTS_START__${JSON.stringify({ results })}__PRAXIS_RESULTS_END__`
}

describe('JavaScript test runner', () => {
  it('builds a single harness containing the function and test payload', () => {
    const harness = buildJavascriptHarness('twoSum', 'function twoSum() {}', testCases)

    expect(harness).toContain('function twoSum() {}')
    expect(harness).toContain('"id":"setup-1"')
    expect(harness).toContain('__PRAXIS_RESULTS_START__')
  })

  it('sends one Piston request and aggregates passing results', async () => {
    const fetchImpl = vi.fn(
      pistonResponse(
        resultsStdout([
          { testId: 'setup-1', passed: true, actualOutput: [0, 1] },
          { testId: 'setup-2', passed: true, actualOutput: [1, 2] },
        ]),
      ),
    )
    const result = await runTests(question, 'function twoSum() {}', 'javascript', testCases, fetchImpl)
    const body = JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body ?? '{}') as {
      language: string
      version: string
      files: Array<{ content: string }>
    }

    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(PISTON_EXECUTE_URL)
    expect(body.language).toBe('javascript')
    expect(body.version).toBe('18.15.0')
    expect(body.files).toHaveLength(1)
    expect(result).toMatchObject({ totalTests: 2, passedTests: 2, scorePercent: 100, allPassed: true })
  })

  it('preserves per-case actual output and runtime errors', async () => {
    const result = await runTests(
      question,
      'function twoSum() {}',
      'javascript',
      testCases,
      pistonResponse(
        resultsStdout([
          { testId: 'setup-1', passed: true, actualOutput: [0, 1] },
          { testId: 'setup-2', passed: false, actualOutput: null, stderr: 'TypeError: bad access' },
        ]),
      ),
    )

    expect(result).toMatchObject({ totalTests: 2, passedTests: 1, scorePercent: 50, allPassed: false })
    expect(result.results[1]).toMatchObject({ testId: 'setup-2', passed: false, stderr: 'TypeError: bad access' })
  })

  it('reports a compile error when no result payload is produced', async () => {
    const result = await runTests(
      question,
      'function twoSum( {',
      'javascript',
      testCases,
      pistonResponse('start\n', 'SyntaxError: unexpected token'),
    )

    expect(result.allPassed).toBe(false)
    expect(result.compileError).toContain('SyntaxError')
    expect(result.stdout).toBe('start\n')
    expect(result.stderr).toContain('SyntaxError')
  })

  it('rejects unsupported languages, empty suites, and failed HTTP calls', async () => {
    await expect(runTests(question, 'code', 'python', testCases)).rejects.toThrow(/Python.*not implemented/)
    await expect(runTests(question, 'code', 'javascript', [])).rejects.toThrow(/At least one test case/)
    await expect(
      runTests(question, 'code', 'javascript', testCases, async () => ({ ok: false, status: 500, json: async () => ({}) })),
    ).rejects.toThrow(/status 500/)
  })
})
