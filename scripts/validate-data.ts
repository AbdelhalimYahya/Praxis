import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import type { Language } from '../types/question'
import type { Question } from '../types/question'
import type { Section } from '../types/section'

const SectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  order: z.number().int().positive(),
  questionCount: z.number().int().nonnegative(),
  tags: z.array(z.string()),
}) satisfies z.ZodType<Section>

const SectionsSchema = z.array(SectionSchema)

const LanguageSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  pistonLanguage: z.string().min(1),
  pistonVersion: z.string().min(1),
  monacoLang: z.string().min(1),
}) satisfies z.ZodType<Language>

const LanguagesSchema = z.array(LanguageSchema)

const TestCaseSchema = z.object({
  id: z.string().min(1),
  input: z.array(z.unknown()),
  expectedOutput: z.unknown(),
  hidden: z.boolean().optional(),
  description: z.string().optional(),
})

const BaseQuestionSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  type: z.enum(['verbal', 'coding']),
  title: z.string().min(1),
  prompt: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
  points: z.number().int().nonnegative(),
  hints: z.array(z.string()).optional(),
})

const VerbalQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('verbal'),
  idealAnswer: z.string().min(1),
  keyPoints: z.array(z.string()),
  minWords: z.number().int().nonnegative().optional(),
})

const CodingQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('coding'),
  functionName: z.string().min(1),
  languageBoilerplate: z.record(z.string(), z.string()),
  setupTests: z.array(TestCaseSchema),
  fullTests: z.array(TestCaseSchema),
  timeLimitMs: z.number().int().positive().optional(),
  constraints: z.array(z.string()).optional(),
})

const QuestionSchema = z.discriminatedUnion('type', [VerbalQuestionSchema, CodingQuestionSchema]) satisfies z.ZodType<Question>

const QuestionsSchema = z.array(QuestionSchema)

function fail(message: string): never {
  console.error(`VALIDATION FAILED: ${message}`)
  process.exit(1)
}

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(resolve(file), 'utf-8'))
  } catch (err) {
    fail(`could not read or parse ${file}: ${err instanceof Error ? err.message : err}`)
  }
}

// --- sections.json ---
const sections = SectionsSchema.safeParse(readJson('data/sections.json'))
if (!sections.success) {
  fail(`data/sections.json ${sections.error.toString()}`)
}

const ids = new Set<string>()
const slugs = new Set<string>()
for (const [index, section] of sections.data.entries()) {
  if (ids.has(section.id)) fail(`duplicate section id "${section.id}" at index ${index}`)
  if (slugs.has(section.slug)) fail(`duplicate section slug "${section.slug}" at index ${index}`)
  ids.add(section.id)
  slugs.add(section.slug)
}

const expectedOrders = sections.data.map((section) => section.order).slice().sort((a, b) => a - b)
for (let i = 0; i < expectedOrders.length; i++) {
  if (expectedOrders[i] !== i + 1) {
    fail(`section orders must be sequential 1..n, got ${expectedOrders.join(', ')}`)
  }
}

console.log(`OK: ${sections.data.length} sections validated against schema (ids, slugs, orders unique & sequential).`)

// --- languages.json ---
const languages = LanguagesSchema.safeParse(readJson('data/languages.json'))
if (!languages.success) {
  fail(`data/languages.json ${languages.error.toString()}`)
}

const languageIds = new Set<string>()
for (const [index, language] of languages.data.entries()) {
  if (languageIds.has(language.id)) fail(`duplicate language id "${language.id}" at index ${index}`)
  languageIds.add(language.id)
}

console.log(`OK: ${languages.data.length} languages validated against schema (unique ids).`)

// --- questions (one file per section slug) ---
const questionsDir = resolve('data/questions')
const questionFiles = readdirSync(questionsDir).filter((name) => name.endsWith('.json'))
const questionIds = new Set<string>()
let totalQuestions = 0

for (const file of questionFiles) {
  const slug = file.replace(/\.json$/, '')
  if (!slugs.has(slug)) fail(`question file "${file}" has no matching section slug in data/sections.json`)

  const parsed = QuestionsSchema.safeParse(readJson(`data/questions/${file}`))
  if (!parsed.success) {
    fail(`data/questions/${file} ${parsed.error.toString()}`)
  }

  for (const [index, question] of parsed.data.entries()) {
    if (questionIds.has(question.id)) fail(`duplicate question id "${question.id}" (in ${file})`)
    questionIds.add(question.id)

    if (!ids.has(question.sectionId)) {
      fail(`question "${question.id}" references unknown sectionId "${question.sectionId}"`)
    }
    if (question.sectionId !== slug) {
      fail(`question "${question.id}" in ${file} has sectionId "${question.sectionId}" that does not match the file slug "${slug}"`)
    }

    if (question.type === 'coding') {
      if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(question.functionName)) {
        fail(`question "${question.id}" functionName "${question.functionName}" is not a valid identifier`)
      }
      if (question.setupTests.length === 0) fail(`coding question "${question.id}" has no setupTests`)
      if (question.fullTests.length === 0) fail(`coding question "${question.id}" has no fullTests`)
      const boilerplateIds = Object.keys(question.languageBoilerplate)
      for (const langId of boilerplateIds) {
        if (!languageIds.has(langId)) {
          fail(`coding question "${question.id}" boilerplate references unknown language "${langId}"`)
        }
      }
    }
  }

  totalQuestions += parsed.data.length
}

for (const section of sections.data) {
  if (!existsSync(resolve(`data/questions/${section.slug}.json`))) {
    fail(`section "${section.slug}" has no matching data/questions/${section.slug}.json file`)
  }
}

console.log(`OK: ${questionFiles.length} question files, ${totalQuestions} questions validated against schema (unique ids, valid sectionId references).`)
