<script setup lang="ts">
import type { SubmissionResult } from '~/types/grading'
import type { CodingQuestion, Language } from '~/types/question'
import languagesData from '~/data/languages.json'
import { runTests } from '~/utils/testRunner'

const props = defineProps<{
  question: CodingQuestion
}>()

const languages = languagesData as Language[]
const colorMode = useColorMode()
const progress = useProgress()
const isDark = computed(() => colorMode.value === 'dark')

const selectedLanguage = ref(props.question.languageBoilerplate.javascript ? 'javascript' : Object.keys(props.question.languageBoilerplate)[0] ?? 'javascript')
const code = ref(props.question.languageBoilerplate[selectedLanguage.value] ?? '')
const running = ref(false)
const submitting = ref(false)
const runError = ref('')
const submitError = ref('')
const runResult = ref<SubmissionResult | null>(null)
const submitResult = ref<SubmissionResult | null>(null)
const submitOpen = ref(false)
const runStdout = ref('')
const runStderr = ref('')

const monacoLanguage = computed(() => languages.find((language) => language.id === selectedLanguage.value)?.monacoLang ?? 'javascript')

function draftKey(languageId: string): string {
  return `praxis.code.${props.question.id}.${languageId}`
}

onMounted(() => {
  const { value: savedDraft } = useLocalStorage<string>(draftKey(selectedLanguage.value), code.value)
  if (savedDraft.value.trim().length > 0) {
    code.value = savedDraft.value
  }
})

async function runSetupTests() {
  if (running.value) return
  running.value = true
  runError.value = ''
  try {
    const result = await runTests(props.question, code.value, selectedLanguage.value, props.question.setupTests)
    runResult.value = result
    runStdout.value = result.stdout
    runStderr.value = result.stderr
    if (result.compileError) {
      runError.value = result.compileError
    }
  } catch (error) {
    runResult.value = null
    runStdout.value = ''
    runStderr.value = ''
    runError.value = error instanceof Error ? error.message : 'The sample tests could not be run.'
  } finally {
    running.value = false
  }
}

async function submitFullTests() {
  if (submitting.value) return
  submitting.value = true
  submitError.value = ''
  submitResult.value = null
  submitOpen.value = true
  try {
    const result = await runTests(props.question, code.value, selectedLanguage.value, props.question.fullTests)
    submitResult.value = result
    progress.recordCoding(props.question.id, result.scorePercent)
    runStdout.value = result.stdout
    runStderr.value = result.stderr
    if (result.compileError) {
      submitError.value = result.compileError
    }
  } catch (error) {
    submitResult.value = null
    submitError.value = error instanceof Error ? error.message : 'The full test suite could not be submitted.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <LanguageSelector
          :question="props.question"
          :model-value="selectedLanguage"
          :code="code"
          @update:model-value="selectedLanguage = $event"
          @update:code="code = $event"
        />
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="run-button"
            :disabled="running || submitting"
            @click="runSetupTests"
          >
            {{ running ? 'Running…' : 'Run sample tests' }}
          </button>
          <button
            class="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="submit-button"
            :disabled="running || submitting"
            @click="submitFullTests"
          >
            {{ submitting ? 'Submitting…' : 'Submit full tests' }}
          </button>
        </div>
      </div>

      <CodeEditor v-model:code="code" :language="monacoLanguage" :dark="isDark" height="420px" />

      <p v-if="runError" role="alert" class="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
        {{ runError }}
      </p>
    </div>

    <TestCasePanel :cases="props.question.setupTests" :results="runResult?.results ?? []" />
    <TestResultsPanel v-if="submitResult" :result="submitResult" />
    <RunOutputConsole :stdout="runStdout" :stderr="runStderr" />
    <SubmitResultModal
      :open="submitOpen"
      :result="submitResult"
      :submitting="submitting"
      :error="submitError"
      @close="submitOpen = false"
      @retry="submitFullTests"
    />
  </div>
</template>
