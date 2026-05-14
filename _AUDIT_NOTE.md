# Audit Note — AISkiResortOperationsManager

## Original audit recommendations (batch_07.md §29)

**Missing AI endpoints:** `/occupancy-forecast`, `/revenue-optimization`, `/avalanche-risk-assessment`, `/equipment-maintenance-scheduling`, `/instructor-scheduling`, `/churn-prediction`.

**Missing non-AI features:** real-time lift line management, lesson booking, food ordering, lost & found workflow, weather API integration, lift ticket POS.

**Custom suggestions:** RevPASDay optimization, snow conditions forecasting, demand-based staffing, guest experience personalization, predictive lift maintenance, dynamic dining recommendations.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/occupancy-forecast` — N-day visitor forecast over historical + on-the-books + active season passes.
2. `POST /api/ai/avalanche-risk-assessment` — North American Avalanche Danger Scale–aligned risk + control recs.
3. `POST /api/ai/equipment-maintenance-scheduling` — predictive PM windows for lifts/equipment with conflict detection.

All three reuse `callAI`, `parseAIJson`, `saveAIResult`, `aiRateLimiter`. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/instructor-scheduling` (mechanical follow-up).
2. `POST /api/ai/churn-prediction` (mechanical).
3. Weather API integration (NEEDS-CREDS — NOAA / Snow-Forecast / OpenWeather).
4. Lift ticket POS integration (NEEDS-CREDS).
5. Lesson booking system (mechanical CRUD).

## Apply pass 3 (frontend)

- LEFT-AS-IS. `frontend/src/App.js` already imports and routes `AIOccupancyForecastPage`, `AIAvalancheRiskAssessmentPage`, `AIEquipmentMaintenanceSchedulingPage` (the apply2 endpoints) plus the original 7 AI pages. Each consumes the existing `services/api.js` axios client which injects JWT Bearer from `localStorage`.
- No code changes.

## Apply pass 4 (mechanical backlog)

- Added `POST /api/ai/revenue-optimization` in `backend/src/routes/ai.js` — cross-channel revenue optimizer over lift tickets, season passes, accommodations, F&B, retail and lessons; uses the shared `callAI`/`parseAIJson` helper (503-on-no-key bubbled via `err.statusCode`) and persists via `saveAIResult`.
- Added `frontend/src/pages/AIRevenueOptimizationPage.js` — matches the existing AI feature page pattern (`AIInstructorSchedulingPage` template, `AIStructuredResult` component, `AIFeaturePage.css`). Calls `callAI('revenue-optimization', { horizon_days })` via `services/api.js` (JWT Bearer auto-injected). 503 mapped to "AI service unavailable - OPENROUTER_API_KEY is not set on the server."
- Wired `App.js` route `/ai/revenue-optimization` and `Sidebar.js` nav entry under the AI section.
- Closes the original audit's missing `/revenue-optimization` AI endpoint. Remaining mechanical backlog items (`/instructor-scheduling`, `/churn-prediction`) are already implemented + wired. Other backlog items remain NEEDS-CREDS (weather APIs, lift-ticket POS) or larger CRUD features (lesson booking).
- No new deps. Syntax: `node --check backend/src/routes/ai.js` passes; `@babel/parser` (jsx) passes for `App.js`, `Sidebar.js`, `AIRevenueOptimizationPage.js`.
