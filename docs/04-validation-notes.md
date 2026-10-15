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

## Refine step (design findings to decide on)

These came from reading code in Phase 3, not from running spikes, so they are unconfirmed:

1. Remove or protect the `/plants` route (`PlantsCRUD`).
2. Move direct PocketBase calls in `Scan`, `PlantDetail`, `AdminLogin` into services.
3. Remove the dead `qr_code = <text>` fallback lookup in `Scan` (`qr_code` is a file field).
4. Split `adminService` (plants, users, analytics).
5. Fix or delete the unused and duplicate code listed in the Phase 3 notes.
6. Move the PocketBase URL into an environment variable (`import.meta.env.VITE_PB_URL`).

## To finish validation

1. Confirm the backend URL / status (spike #3).
2. Re-run spikes 5, 6, 8 (read-only; I can run these).
3. Run spikes 7 and 9 on a staging or throwaway PocketBase, with a test admin account, so no production data is touched.
4. Update the Phase 1-3 diagrams with whatever is found (the "living diagrams" step).
