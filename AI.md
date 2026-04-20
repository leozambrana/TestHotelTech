# AI Workflow Documentation

## Tools Used

- **Antigravity** — Google DeepMind AI coding assistant (Claude Sonnet model), used as the primary pair-programming agent throughout the entire project.

---

## How the Project Was Built

The entire codebase was produced through a conversational, iterative workflow — prompts describing intent, agent proposes code, developer reviews and adjusts. Total prompts: ~15 major steps.

### Step-by-step breakdown

| # | Prompt intent | What was built |
|---|---|---|
| 1 | "Implement the backend: CLI args, map parser, in-memory state, GET /api/map, POST /api/bookings" | `index.ts` → `server.ts`, initial `mapParser.ts`, booking logic inline |
| 2 | "Refactor: create `types.ts`, `bookingService.ts` — flat structure, no deep folders" | Extracted types and service layer |
| 3 | "Build the frontend with a luxury resort dark theme, integrate with the backend" | `index.css` design system, `App.tsx`, `MapTile.tsx`, `BookingModal.tsx` |
| 4 | "Fix path tile images — they're all showing arrowStraight. Use the correct variant per tile shape" | Neighbor-aware `getPathConfig()` function in `MapTile.tsx` |
| 5 | "The corner images are wrong — you assumed top-right but it's top-left" | Viewed pixel content of each asset to verify base orientations, fixed all rotations |
| 6 | "Paths should also connect to chalé/cabana neighbors, not only other paths" | Changed `isPath` → `isConnected` (any non-empty neighbor) |
| 7 | "Translate everything to English" | UI strings, HTML lang, meta description |
| 8 | "Add a help button that shows all registered guests for testing" | `GuestListModal.tsx`, `GET /api/guests` endpoint |
| 9 | "What is still missing to complete the spec?" | Gap analysis: tests, README, booked-cabin feedback, AI.md, screenshot |
| 10 | "Do it all in that order" | Automated tests, README rewrite, toast for booked cabin, AI.md (this file) |

---

## Key Prompts (verbatim or paraphrased)

```
"Implement the Backend... server.ts... mapParser.ts... bookingService.ts..."

"Refactor to create types.ts and bookingService.ts... keep it flat, no deep folders..."

"Build the frontend with a luxury resort theme, dark mode, integrate with the backend..."

"The path tile images are not correct — on a corner it always uses arrowStraight..."

"The rotations for the 3-sided (T-junction) paths are still wrong — how would you fix the logic?"

"Paths should also connect to chalét neighbors (non-path tiles) — fix the isConnected logic"

"Create a help button showing guest names and rooms from bookings.json"

"Tell me what is still missing based on the README requirements"

"Do it all in that order" (tests → README → booked cabin feedback → AI.md)
```

---

## Observations

- The AI was highly effective for **boilerplate, TypeScript types, CSS design systems, and test scaffolding**.
- The **path image orientation** required multiple iterations — the agent made an incorrect assumption about default image orientation (top-right vs top-left corner) that required explicit correction once the actual assets were examined.
- The **`isConnected` fix** (paths connecting to non-path neighbors) was a one-line change, but required the right mental model. The agent correctly identified the single variable to change once the problem was described clearly.
- Overall, the AI reduced what would typically be 1–2 days of solo development to roughly 3–4 hours of conversational iteration.
