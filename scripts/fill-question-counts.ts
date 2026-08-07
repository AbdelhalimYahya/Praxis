import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface Section {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  order: number
  questionCount: number
  tags: string[]
}

interface Question {
  id: string
  sectionId: string
  type: 'verbal' | 'coding'
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(file), 'utf-8'))
}

const sections = readJson<Section[]>('data/sections.json')
const questionsDir = resolve('data/questions')
const questionFiles = readdirSync(questionsDir).filter((name) => name.endsWith('.json'))

const counts = new Map<string, number>()
for (const file of questionFiles) {
  const slug = file.replace(/\.json$/, '')
  const questions = readJson<Question[]>(`data/questions/${file}`)
  counts.set(slug, questions.length)
}

let updated = 0
for (const section of sections) {
  const count = counts.get(section.slug) ?? 0
  if (section.questionCount !== count) {
    section.questionCount = count
    updated++
  }
}

writeFileSync(resolve('data/sections.json'), `${JSON.stringify(sections, null, 2)}\n`)
console.log(`Updated questionCount for ${updated} sections in data/sections.json.`)
