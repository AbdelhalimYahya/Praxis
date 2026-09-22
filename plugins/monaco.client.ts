import { loader } from '@guolao/vue-monaco-editor'

// Client-only Monaco loader configuration. Matching the CDN bundle to the
// installed monaco-editor version keeps editor behavior reproducible.
export default defineNuxtPlugin(() => {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.56.0/min/vs',
    },
  })
})
