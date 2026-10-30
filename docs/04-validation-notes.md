# Phase 4: Validation (Technical Spikes)

Diagram: [diagrams/04-validation-loop.drawio](diagrams/04-validation-loop.drawio)

The app is already built, so this phase is a **reality check of the documented design** (Phases 1-3), not a prototype. Spikes were run on 2026-10-01 from a developer machine. Only checks that need no login and make no writes were run.

## Spike log

| # | Risky interaction | Check | Result |
| :--- | :--- | :--- | :--- |
| 1 | Code compiles | `tsc -p tsconfig.app.json --noEmit` | **Pass** (0 errors) |
| 2 | Code quality | `eslint src` | **81 problems** (76 errors, 5 warnings): 64 `no-explicit-any`, 6 `set-state-in-effect`, 5 `exhaustive-deps`, 5 `no-unused-vars`, 1 `prefer-const`. None block the build; `npm run lint` fails. |
| 3 | Backend reachable (`db.ts` → PocketBase) | GET `https://jpg-services.nddu.edu.ph/pb-biosoc/api/collections/species/records` | **Fail from this machine.** HTTP 200 but the body is the *Junior Programmers Group website HTML*, not JSON. Same for `/api/health`, `/pb-biosoc/` and `/pb-biosoc/_/`. |
| 4 | Public site | GET `https://flora.nddu.edu.ph/` | Responds with the Flora frontend (HTML). Its `/api/health` also returns the frontend HTML, so the API is not served from that domain either. |
| 5 | Taxonomy chain (species → domain, one expand call) | Planned | **Not run**, blocked by #3 |
| 6 | Species / details coverage (every species has genus, image, details) | Planned | **Not run**, blocked by #3 |
| 7 | QR round trip (create plant → QR → scan → profile) | Planned | **Not run**, needs working backend and an admin login |
| 8 | Invalid QR shows "Plant not found" | Planned | **Not run**, blocked by #3 |
| 9 | Access rules (anonymous cannot read `users`, cannot write `species` / `class`) | Planned | **Not run**, blocked by #3, and write tests need a safe test environment |

## What spike #3 means

Either the PocketBase server is down or moved, or `/pb-biosoc` is not being proxied to it at the moment (or only from certain networks). If the deployed site also shows no plants, this is the first thing to fix. If the site works for you on the NDDU network, tell me and I will treat #3 as a network or proxy artifact and re-run from there.

This is also a risk worth recording: the PocketBase URL is hard-coded in `db.ts` (and a second, `localhost:8090`, in the unused `useAuth.ts`), with no environment config.

## Refine step: status (2026-10)

The backend is reachable again, so spike #3 no longer applies. Of the design findings: the `/plants` route is removed, the `qr_code` fallback is removed, `adminService` is split, dead code is removed, and the PocketBase URL is now `VITE_PB_URL` (see [08-deployment.md](08-deployment.md)). Still open: the PocketBase rules (A2/A3) and the items in [06-todo.md](06-todo.md).

## To finish validation

1. Confirm collection rules with the checklist in [07-pocketbase-setup.md](07-pocketbase-setup.md) and `scripts/check-api-rules.sh`.
2. Run the manual test script (task G6).
3. Update the draw.io diagrams to match the current code.
