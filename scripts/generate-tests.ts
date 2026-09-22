import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface GeneratedTest {
  id: string
  input: unknown[]
  expectedOutput: unknown
  description: string
}

const TARGET_FULL_TESTS = 80
const FILE = resolve('data/questions/javascript-fundamentals.json')

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function shuffled<T>(rng: () => number, values: T[]): T[] {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

function reverseByCodePoints(value: string): string {
  return Array.from(value).reverse().join('')
}

function fizzBuzzReference(n: number): string[] {
  const output: string[] = []
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) output.push('FizzBuzz')
    else if (i % 3 === 0) output.push('Fizz')
    else if (i % 5 === 0) output.push('Buzz')
    else output.push(String(i))
  }
  return output
}

function flattenReference(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [value]
  return value.flatMap((entry) => flattenReference(entry))
}

function uniqueTwoSumCase(rng: () => number, index: number): GeneratedTest {
  for (let attempt = 0; attempt < 500; attempt++) {
    const length = randomInt(rng, 2, 10)
    const numbers = Array.from({ length }, () => randomInt(rng, -20, 20))
    const first = randomInt(rng, 0, length - 1)
    let second = randomInt(rng, 0, length - 1)
    if (second === first) second = (second + 1) % length
    const target = (numbers[first] as number) + (numbers[second as number] as number)
    const solutions: Array<[number, number]> = []
    for (let i = 0; i < numbers.length; i++) {
      for (let j = i + 1; j < numbers.length; j++) {
        if ((numbers[i] as number) + (numbers[j] as number) === target) {
          solutions.push([i, j])
        }
      }
    }
    if (solutions.length === 1 && solutions[0]) {
      return {
        id: `t${index}`,
        input: [numbers, target],
        expectedOutput: solutions[0],
        description: `Randomized unique-pair case ${index - 20}`,
      }
    }
  }

  const length = 6
  const numbers = Array.from({ length }, (_, position) => 2 ** position)
  return {
    id: `t${index}`,
    input: [numbers, numbers[1] as number + (numbers[4] as number)],
    expectedOutput: [1, 4],
    description: `Powers-of-two unique-pair case ${index - 20}`,
  }
}

const STRING_ALPHABET = ['a', 'b', 'c', 'x', 'y', 'z', 'A', 'B', '0', '1', '2', ' ', '!', '?', 'é', '😊', '🚀']

function randomString(rng: () => number, maxLength: number): string {
  const length = randomInt(rng, 0, maxLength)
  return Array.from({ length }, () => STRING_ALPHABET[randomInt(rng, 0, STRING_ALPHABET.length - 1)] as string).join('')
}

function stringCase(rng: () => number, index: number, kind: 'reverse' | 'palindrome'): GeneratedTest {
  const value = randomString(rng, kind === 'reverse' ? 20 : 16)
  return {
    id: `t${index}`,
    input: [value],
    expectedOutput: kind === 'reverse' ? reverseByCodePoints(value) : value === reverseByCodePoints(value),
    description: `Randomized ${kind} case ${index - 20}`,
  }
}

function fizzBuzzCase(input: number, index: number): GeneratedTest {
  return {
    id: `t${index}`,
    input: [input],
    expectedOutput: fizzBuzzReference(input),
    description: `FizzBuzz through ${input}, generated case ${index - 20}`,
  }
}

function randomJsonValue(rng: () => number, depth: number): unknown {
  if (depth > 4 || rng() < 0.35) {
    const primitives = [randomInt(rng, -9, 9), 'a', 'b', true, false, null]
    return primitives[randomInt(rng, 0, primitives.length - 1)]
  }
  const length = randomInt(rng, 0, 4)
  return Array.from({ length }, () => randomJsonValue(rng, depth + 1))
}

function flattenCase(rng: () => number, index: number): GeneratedTest {
  const input = randomJsonValue(rng, 0)
  const nested = Array.isArray(input) ? input : [input]
  return {
    id: `t${index}`,
    input: [nested],
    expectedOutput: flattenReference(nested),
    description: `Randomized nesting case ${index - 20}`,
  }
}

function generatedCases(questionId: string, rng: () => number, startIndex: number, count: number): GeneratedTest[] {
  const cases: GeneratedTest[] = []
  if (questionId === 'js-c-01') {
    for (let i = 0; i < count; i++) cases.push(uniqueTwoSumCase(rng, startIndex + i))
    return cases
  }
  if (questionId === 'js-c-02') {
    for (let i = 0; i < count; i++) cases.push(stringCase(rng, startIndex + i, 'reverse'))
    return cases
  }
  if (questionId === 'js-c-03') {
    const existing = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 14, 15, 16, 17, 20, 25, 30, 50, 60, 100])
    const candidates = shuffled(
      rng,
      Array.from({ length: 151 }, (_, n) => n).filter((n) => !existing.has(n)),
    ).slice(0, count)
    return candidates.map((input, offset) => fizzBuzzCase(input, startIndex + offset))
  }
  if (questionId === 'js-c-04') {
    for (let i = 0; i < count; i++) cases.push(stringCase(rng, startIndex + i, 'palindrome'))
    return cases
  }
  if (questionId === 'js-c-05') {
    for (let i = 0; i < count; i++) cases.push(flattenCase(rng, startIndex + i))
    return cases
  }
  throw new Error(`No generated-test strategy for ${questionId}.`)
}

function main(): void {
  const questions = JSON.parse(readFileSync(FILE, 'utf-8')) as Array<{ id: string; type: string; fullTests?: GeneratedTest[] }>
  let changed = false

  for (const question of questions) {
    if (question.type !== 'coding' || !question.id.startsWith('js-c-')) continue
    const existing = question.fullTests ?? []
    if (existing.length >= TARGET_FULL_TESTS) continue
    const rng = mulberry32(1000 + Number(question.id.replace('js-c-', '')))
    question.fullTests = [...existing, ...generatedCases(question.id, rng, existing.length + 1, TARGET_FULL_TESTS - existing.length)]
    changed = true
    console.log(`${question.id}: ${existing.length} -> ${question.fullTests.length} full tests`)
  }

  if (changed) {
    writeFileSync(FILE, `${JSON.stringify(questions, null, 2)}\n`)
  } else {
    console.log('All JavaScript Fundamentals coding questions already have at least 80 full tests.')
  }
}

main()
