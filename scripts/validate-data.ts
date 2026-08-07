import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

const SectionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string().min(1),
  order: z.number().int().positive(),
  questionCount: z.number().int().nonnegative(),
  tags: z.array(z.string()),
})

const SectionsSchema = z.array(SectionSchema)

function fail(message: string): never {
  console.error(`VALIDATION FAILED: ${message}`)
  process.exit(1)
}

const file = resolve('data/sections.json')
let data: unknown
try {
  data = JSON.parse(readFileSync(file, 'utf-8'))
} catch (err) {
  fail(`could not read or parse ${file}: ${err instanceof Error ? err.message : err}`)
}

const parsed = SectionsSchema.safeParse(data)
if (!parsed.success) {
  fail(parsed.error.toString())
}

const sections = parsed.data

const ids = new Set<string>()
const slugs = new Set<string>()
for (const [index, section] of sections.entries()) {
  if (ids.has(section.id)) fail(`duplicate section id "${section.id}" at index ${index}`)
  if (slugs.has(section.slug)) fail(`duplicate section slug "${section.slug}" at index ${index}`)
  ids.add(section.id)
  slugs.add(section.slug)
}

const expectedOrders = sections.map((section) => section.order).slice().sort((a, b) => a - b)
for (let i = 0; i < expectedOrders.length; i++) {
  if (expectedOrders[i] !== i + 1) fail(`section orders must be sequential 1..n, got ${expectedOrders.join(', ')}`)
}

console.log(`OK: ${sections.length} sections validated against schema (ids, slugs, orders unique & sequential).`)
