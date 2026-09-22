# Praxis

## AI grading configuration

Verbal answers are graded through the server-only `/api/grade` route, so an AI key is never sent to the browser.

1. Copy `.env.example` to `.env`.
2. Set:
   - `AI_PROVIDER=heuristic|openrouter|gemini`
   - `AI_API_KEY=your-free-key` for `openrouter` or `gemini`
   - `AI_MODEL=` optionally to override the default free model
3. Restart the dev server.

With no key, or when `AI_PROVIDER=heuristic`, the app uses the built-in local heuristic and labels results as `local heuristic`. For OpenRouter, create a free API key in the OpenRouter dashboard; for Gemini, create a free API key in Google AI Studio.

