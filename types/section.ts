export interface Section {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  order: number
  questionCount?: number
  tags: string[]
}
