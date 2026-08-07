import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'
import type { Language } from '../types/question'
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
