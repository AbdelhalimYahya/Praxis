import { gradeAnswer } from '../utils/grade.server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig(event)

  try {
    return await gradeAnswer(body, {
      provider: runtimeConfig.aiProvider,
      apiKey: runtimeConfig.aiApiKey,
      model: runtimeConfig.aiModel,
    })
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error instanceof Error ? error.message : 'Invalid grading request.',
    })
  }
})
