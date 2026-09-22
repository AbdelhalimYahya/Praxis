import { z } from 'zod'
import type { AiGradingResult } from '~/types/grading'
import type { VerbalQuestion } from '~/types/question'
import { gradeHeuristically } from '~/utils/diffScoring'

export const VerbalQuestionSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  type: z.literal('verbal'),
  title: z.string().min(1),
  prompt: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
  points: z.number().int().nonnegative(),
  hints: z.array(z.string()).optional(),
  idealAnswer: z.string().min(1),
  keyPoints: z.array(z.string()),
  minWords: z.number().int().nonnegative().optional(),
})

export const GradeRequestSchema = z.object({
  question: VerbalQuestionSchema,
  userAnswer: z.string().min(1),
})

export type GradeRequest = z.infer<typeof GradeRequestSchema>

const RemoteGradingResultSchema = z.object({
  matchPercent: z.number().int().min(0).max(100),
  verdict: z.enum(['excellent', 'good', 'partial', 'off-topic']),
  aiUnderstanding: z.string().min(1),
  missingPoints: z.array(z.string()),
  feedback: z.string().min(1),
})

export interface GradeRuntimeConfig {
  provider?: string
  apiKey?: string
  model?: string
}

export function resolveGradeRuntimeConfig(runtimeConfig: GradeRuntimeConfig = {}): Required<GradeRuntimeConfig> {
  return {
    provider: process.env.AI_PROVIDER ?? runtimeConfig.provider ?? 'heuristic',
    apiKey: process.env.AI_API_KEY ?? runtimeConfig.apiKey ?? '',
    model: process.env.AI_MODEL ?? runtimeConfig.model ?? '',
  }
}

export interface GradeFetchResponse {
  ok: boolean
  status: number
  json(): Promise<unknown>
}

export type GradeFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<GradeFetchResponse>

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

function buildGradingPrompt(question: VerbalQuestion, userAnswer: string): { instructions: string; content: string } {
  const instructions = [
    'Grade a free-text interview answer against the supplied ideal answer and key points.',
    'Return ONLY strict JSON with exactly these keys: matchPercent, verdict, aiUnderstanding, missingPoints, feedback.',
    'matchPercent is an integer from 0 to 100.',
    'verdict must be one of: excellent, good, partial, off-topic.',
    'aiUnderstanding must paraphrase the user answer in your own words; it is not feedback.',
    'missingPoints must list key points the answer did not cover.',
  ].join(' ')

  const content = [
    `Question: ${question.title}`,
    `Prompt: ${question.prompt}`,
    `Ideal answer: ${question.idealAnswer}`,
    `Key points: ${question.keyPoints.join(' | ')}`,
    `User answer: ${userAnswer}`,
  ].join('\n')

  return { instructions, content }
}

function stripCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function parseRemoteResult(text: unknown, model: string): AiGradingResult {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('The grading provider returned an empty response.')
  }

  const parsed = RemoteGradingResultSchema.safeParse(JSON.parse(stripCodeFences(text)))
  if (!parsed.success) {
    throw new Error(`The grading provider returned invalid JSON: ${parsed.error.message}`)
  }

  return { ...parsed.data, rawModelUsed: model }
}

async function requestOpenRouterGrading(
  question: VerbalQuestion,
  userAnswer: string,
  model: string,
  apiKey: string,
  fetchImpl: GradeFetch,
): Promise<AiGradingResult> {
  const { instructions, content } = buildGradingPrompt(question, userAnswer)
  const response = await fetchImpl(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> }
  return parseRemoteResult(payload.choices?.[0]?.message?.content, model)
}

async function requestGeminiGrading(
  question: VerbalQuestion,
  userAnswer: string,
  model: string,
  apiKey: string,
  fetchImpl: GradeFetch,
): Promise<AiGradingResult> {
  const { instructions, content } = buildGradingPrompt(question, userAnswer)
  const response = await fetchImpl(`${GEMINI_URL}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${instructions}\n\n${content}` }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`)
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>
  }
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => (typeof part.text === 'string' ? part.text : '')).join('\n')
  return parseRemoteResult(text, model)
}

export async function gradeAnswer(
  request: GradeRequest,
  config: GradeRuntimeConfig = {},
  fetchImpl: GradeFetch = globalThis.fetch as unknown as GradeFetch,
): Promise<AiGradingResult> {
  const parsedRequest = GradeRequestSchema.safeParse(request)
  if (!parsedRequest.success) {
    throw new Error(`Invalid grading request: ${parsedRequest.error.message}`)
  }

  const provider = (config.provider ?? 'heuristic').toLowerCase()
  const apiKey = config.apiKey?.trim() ?? ''
  const model =
    config.model?.trim() ||
    (provider === 'gemini' ? 'gemini-2.0-flash' : 'meta-llama/llama-3.1-8b-instruct:free')

  if (provider === 'heuristic' || apiKey.length === 0) {
    return gradeHeuristically(parsedRequest.data.question, parsedRequest.data.userAnswer)
  }

  try {
    if (provider === 'openrouter') {
      return await requestOpenRouterGrading(parsedRequest.data.question, parsedRequest.data.userAnswer, model, apiKey, fetchImpl)
    }
    if (provider === 'gemini') {
      return await requestGeminiGrading(parsedRequest.data.question, parsedRequest.data.userAnswer, model, apiKey, fetchImpl)
    }
  } catch {
    // Any remote-provider failure falls through to the local heuristic below.
  }

  return gradeHeuristically(parsedRequest.data.question, parsedRequest.data.userAnswer)
}
