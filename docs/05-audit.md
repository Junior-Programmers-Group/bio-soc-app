# Flora Database: Codebase Audit (v2)

Date: 2026-10-14. Codebase: `bio-soc-app` (React 19, TypeScript, Vite 7, PocketBase client), commit `1ba09fa` plus one uncommitted fix (see "Changed during this audit"). This replaces the 2026-10-01 audit.

## Status update (2026-10-30)

H1 (open write access), H2 (admin protection) and the `users` rules are **fixed on the live server and verified** (see [06-todo.md](06-todo.md)). H3 (backups) is partly done: daily backups, one verified off-server copy, no test restore yet. H4 (dependencies), H5 (hidden failures), M1 to M6, M8, M9 and most of the Low items were fixed in code. The placeholder taxonomy (M9) was replaced with real data. Still open: the web server cutting off responses over ~32 KB (new, found during this work), design and accessibility (D1 to D6, being redone as a separate redesign), and the items marked open in the to-do list. The text below is the original audit, kept for reference.

## What changed since the last audit

- **The backend is back.** The 2026-10-01 audit assumed it was down and data was lost. It now answers (`/api/health` returns 200) and holds **11 species**, 11 `details` rows and 13 genera, plus one record each in kingdom, phylum, class, order and family. Species images load. The "rebuild from scratch" framing no longer applies; **backup and access control** is now the priority.
- **`docs/06-recovery-schema.md` does not exist.** The old audit linked to it, but the file was never written. Those links are removed here.
- **`hooks/useAuth.ts` no longer points at `localhost:8090`.** It now uses the shared client in `back-end/db.ts`. The hook is still unused (see L1).
- Everything else from the old audit was re-checked and **still holds**. The status of each item is in the findings below.

## Scope and limits

**Covered:** all of `src/`, build/lint config, `package.json`, git state, `tsc`, `eslint`, `npm audit`, and a small set of read-only requests to the live API (record counts, the shape of one species record, and what anonymous requests are allowed to do).

**Not covered:**
- **The app was not run or viewed in a browser.** Design and accessibility findings come from reading the code and CSS, not from looking at screens.
- **The PocketBase admin settings were not inspected.** I have no superuser login, so collection rules, backups and server version are unknown. Where a finding depends on them, it says so.
- No penetration test, no load test, no real-device scan test.

Severity: **High** = blocks a safe launch (data loss, unauthorised changes, wrong results the user cannot see). **Medium** = real bug or maintenance risk. **Low** = cleanup and polish.

## Summary

| Area | Result |
| :--- | :--- |
| Compiles (`tsc -b`, strict) | Pass |
| Lint (`eslint .`) | 81 problems (76 errors, 5 warnings). `npm run lint` fails |
| Tests | None |
| `npm audit` | 17 vulnerabilities (13 high, 3 moderate, 1 low); `npm audit fix` is available |
| Live API, anonymous write access | **Confirmed open on `order`**; unconfirmed elsewhere (see H1) |
| Findings | 5 High, 10 Medium, 8 Low |

The user-facing flow (browse, search, scan, view a plant) is well organised and mostly works. The system is **not ready to deploy** yet, and the reasons are not about features: **who is allowed to change the data, silent failures, and no backup.** Most of the fixes are small.

---

## High

**H1. Anonymous visitors can write to the live database (confirmed on at least one collection).**
While checking access rules, I sent an empty `POST` with no login to each collection. `order` accepted it (HTTP 200) and created a blank record. The other collections returned 400 (validation errors), which means the request was not blocked up front, but I cannot tell from outside whether a real payload would be accepted. Update and delete returned 404 for a made-up ID, which also does not settle it.
- **Cleanup needed:** the blank record is `order` id `k3mqfoem0cmzwbz` (created 2026-10-13 16:11 UTC, all fields empty). My attempt to delete it was blocked, so it is still there. Delete it in the admin UI.
- **Why it matters:** anyone who knows the API address (it is in the shipped JavaScript) could add, change or delete taxonomy and plant records.
- **Fix (needs a superuser login):** open each collection's API rules in `/_/`. Reads can stay public for `species`, `details` and the taxonomy tables. Create, update and delete should require `@request.auth.id != "" && @request.auth.isAdmin = true`, or be left empty (superuser only).

**H2. Admin protection exists only in the browser.**
- `App.tsx` shows the dashboard if `pb.authStore.model.isAdmin` is true. That is a UI choice, not security. The server rules in H1 are the real protection.
- The `/plants` route (`App.tsx:57`, `back-end/components/PlantsCRUD.tsx`) has **no login at all** and writes to the `class` collection. Remove the route.
- `ManageUsers` changes `role` from the browser. If the `users` update rule lets a person edit their own record, anyone could promote themselves. The rule must block changes to `role` and `isAdmin` unless the caller is an admin. (Unverified; needs the rules.)
- Login state is read once at load. An expired token is not noticed: the admin keeps seeing the dashboard and every action fails with an unexplained error. Redirect to login when `pb.authStore` clears (use `pb.authStore.onChange`).

**H3. No backup, no schema in the repo.**
The schema and data exist only on the hosted server. The repo has no exported collections file, no migrations, no seed data and no backup routine. This system already lost its data once. Do these three things: export the schema (`/_/` → Settings → Export collections) and commit it; turn on scheduled `pb_data` backups to a place off that server; take a CSV/JSON export of species and taxonomy now.

**H4. Dependency vulnerabilities rose from 2 to 17.**
`npm audit` reports 13 high, mostly Vite and its dev-server tooling (path traversal and file-read issues in the dev server, a Windows path bypass) and the `launch-editor` package. Those affect developers running `npm run dev`, not the built site. The earlier `react-router-dom` advisory (open redirect for paths starting with `//`) was not re-listed in the tail I read, so check it. `npm audit fix` is offered. Run it, rebuild, and re-test the main flows.

**H5. Failures are hidden, so the app looks fine when it is broken.**
- `fetchPlants`, `getPlants` and `getAnalyticsData` return `[]` or zeros on any error (`plantService.ts:446`, `adminService.ts:149`, `adminService.ts:451`). If the server is down, the directory says "0 results" and the dashboard shows zeros. Throw instead, and show a "can't reach the server, retry" state.
- `createPlant` makes three writes and swallows errors on the last two, so the admin sees success even when the details or QR step failed. `deletePlant` removes `details` first, so a failure on the species delete leaves a plant with no details.
- The `species` collection **has no `qr_code` field** (checked against a live record), so the QR upload in `createPlant` is silently dropped. Tags still work because the QR image is generated from the plant ID, but the admin form implies it is stored. In `Scan.tsx:200` the fallback lookup `qr_code="..."` queries that missing field and always errors; only the lookup by ID can succeed. Remove the fallback, or add the field.

---

## Medium

**M1. Repository hygiene.** No `.gitignore`. Git tracks **10,320 files under `node_modules/`** (the `.vite` cache shows as modified in every `git status`) and **22 files in `dist/`**. `.vscode/` holds C++ debugger config for another machine. Fix: add `.gitignore`, then `git rm -r --cached node_modules dist .vscode`. This makes clones small and diffs readable.

**M2. Server addresses hard-coded in about a dozen places.** `db.ts` (API), `plantService.ts` and `ManagePlants.tsx` (image URLs written out as strings), `qrCodeService.ts:17` and `ManagePlants.tsx:919` (`https://flora.nddu.edu.ph`). Use `VITE_PB_URL` and `VITE_SITE_URL`, with a committed `.env.example`. Build image URLs with `pb.files.getURL(record, record.field)`. Moving the server then becomes a one-line change. This also matters because printed QR codes embed the site address (see M10).

**M3. Filters built by string concatenation** (`adminService.ts:62,113,372`, `Scan.tsx:200`). A scanned QR value or URL segment goes straight into the query. Use `pb.filter("species = {:id}", { id })`.

**M4. Code and database disagree on field names.**
- `fetchPlantById` expands `genus_id...` (`plantService.ts:457`), but the field is `genus`. The taxonomy chain it builds is skipped. The detail page works only because it makes a second call itself.
- The create/update form sends `description`, `kingdom`, `phylum`, `klass`, `order`, `family`, `species`, `morphology`, `ecology`, `distribution`, `uses` and `phylum_id` to `species`. A live record has only `author, commonName, conservationStatus, field, genus, notes, scientificName, year`. PocketBase drops the extras without telling you. Define one `Species` type from the real schema and send only those fields.

**M5. Speed and log noise.** `getPlants()` makes one extra request per plant for its `details` (N+1). `fetchPlants` downloads every plant with a seven-level expand and builds several summaries on each load. There are **206 `console.*` calls** in `src/`, some printing whole records. Fine at 11 plants, wasteful at 200. Use one `details` back-relation expand, and remove the logs (or gate them behind `import.meta.env.DEV`).

**M6. Stale data after edits.** `plantService` caches results for 5 minutes and `adminService` never clears the cache. An admin who edits a plant and then opens Discover can still see the old version.

**M7. User management is half-built.** `role` (user/admin/moderator) and `isAdmin` are separate and unconnected: changing a role grants no access. "moderator" does nothing. An admin can delete their own account or demote the last admin. Analytics reads only the first 500 users, so the verified count is wrong beyond that.

**M8. Quality gates are missing.** No tests. 64 uses of `any`. `npm run build` runs only `tsc`, so lint errors never block a deploy. `ManagePlants.tsx` is 1,035 lines with its own form, upload, QR and list logic; `adminService.ts` mixes plants, users and analytics. Fix lint first (most are `any`), add lint to the build, then add a few tests for the QR-link → plant-page flow.

**M9. Test junk in the live data.** The class record `awdwad` (description "awdw") and the order record `awdawd` (description "wad") are visible to the public in filters and taxonomy. The README says "9 primary plant species" but the database has 11. Clean the records and update the README before launch.

**M10. Printed tags depend on two things staying the same.** The QR encodes `https://flora.nddu.edu.ph/discover/plants/<recordId>`. If the domain changes, or a plant is deleted and re-created, the printed tag points nowhere. Plan for the domain to stay, and never delete-and-recreate a tagged plant (edit it instead). A short stable code per plant would be a later improvement.

---

## Design, accessibility and polish

*From reading the code and stylesheets only. Open the site on a phone and a laptop before treating any of these as confirmed.*

**D1. Admin screens look unprepared for phones.** 16 of the CSS files have `@media` rules, but `Taxonomy`, `ManageUsers`, `Analytics`, `AdminLogin` and `ConfirmationModal` have none. Tables and forms in the admin area are the likeliest place for sideways scrolling.

**D2. Keyboard and screen-reader support is thin.** Only 8 `aria-` attributes exist across the whole app. The two modals have `role`/Escape handling, but focus and reduced-motion rules show up in only about six stylesheets. Search results, filters and the scan screen need labels and visible focus. Check that every `<img>` has meaningful `alt` text (several in `ManagePlants.tsx`, `Location.tsx` and `PlantDetail.tsx` need a look).

**D3. The loading screen is hard to read.** `LoadingFallback` in `App.tsx` uses inline `#666` text on the dark green page background (`#0f2418`), roughly a 2.8:1 contrast ratio, below the 4.5:1 target. Move it to a stylesheet and use the existing `--text-main` token.

**D4. Design tokens are barely used.** `global.css` defines only seven variables. Colours and spacing are repeated by hand across more than 20 stylesheets (the largest is 1,166 lines). A fuller token set (colours, spacing, radii, font sizes) would make the site consistent and make any rebrand a small edit.

**D5. Fonts and icons depend on third parties at load time.** Google Fonts is pulled by a blocking CSS `@import`; Bootstrap Icons comes from jsDelivr with no integrity hash. If either is blocked on campus Wi-Fi, text falls back and icons vanish. Self-host both (`public/fonts`, or an npm package) and use `<link rel="preload">`.

**D6. No useful error or empty states elsewhere.** See H5. Also, an unknown URL silently redirects to Home (`path="*"`). A real "page not found" screen with a link to Discover is friendlier for someone with a bad QR link.

---

## Low

- **L1. Dead code:** `hooks/useAuth.ts` (and its localStorage "demo admin" mode), `components/ProtectedRoute.tsx`, `pages/Admin/Admin.tsx`, `services/imageProxy.ts`, `components/DiscoverPlant/pLantCard/` (imports a CSS module that does not exist; the grid does not use it), `plantService.addPlant/updatePlant/deletePlant` (duplicates of `adminService`), everything in `back-end/hooks` and `back-end/components/PlantsCRUD.tsx`, the unused `lucide-react` dependency.
- **L2. Folder-name case clash:** `pLantCard/` and `PlantCard.css` mix capitals unpredictably. On Linux, where file names are case-sensitive, a future rename or import fixed on Windows may break the deploy build. Rename to `PlantCard/`.
- **L3. Taxonomy admin is create-only.** A typo or wrong parent cannot be fixed or deleted from the UI.
- **L4. Images:** `public/` is 2.1 MB: `image 4.png` 760 KB, `BIOSOCIETY.png` 600 KB, `LOGO-Final-WHITE.png` 480 KB. File names contain spaces and parentheses. Compress (WebP/AVIF), rename, and set width/height on `<img>` to avoid layout shift.
- **L5. `index.html`:** the favicon points to `/vite.svg`, which is not in `public/`. No meta description, theme colour or social-preview tags (what appears when a link is shared in a group chat).
- **L6. Build config:** in `vite.config.ts` the `'react'` check runs before `'react-router'`, so the `vendor-router` chunk is never created.
- **L7. Print window:** `printPlantQRCode` writes plant names into an HTML string with `document.write` without escaping (`qrCodeService.ts:299`). Admin-entered, so low risk; escape anyway.
- **L8. README:** describes the project but not how to run, build or deploy it, or which environment variables exist.

## What looks good

- Strict TypeScript; the project compiles cleanly.
- Public reads work and images load. Anonymous requests for the `users` collection return no rows.
- Routes are lazy-loaded, and the structure (pages / components / services) is easy to follow.
- Destructive admin actions ask for confirmation; image type and 5 MB size are checked in the browser.
- QR codes use error-correction level H and the production URL.
- An unknown plant ID and a denied camera are handled with clear messages.
- Admin login rejects accounts without the admin flag.

## Changed during this audit

- `src/hooks/useAuth.ts`: removed the second PocketBase client (`localhost:8090`) and imported the shared one from `back-end/db.ts`. Not type-checked after the change; run `npm run build`.
- One blank `order` record was created on the live server by a test request (see H1). It still needs deleting.

---

## Recommended order of work

**1. Before anything is public (about half a day, mostly in PocketBase admin)**
- Delete the blank `order` record `k3mqfoem0cmzwbz` and the `awdwad` / `awdawd` test records (H1, M9).
- Lock collection rules: public read, admin-only create/update/delete; protect `role` and `isAdmin` on `users` (H1, H2).
- Remove the `/plants` route (H2).
- Export the schema and data; enable off-server backups (H3).

**2. Make it trustworthy (1 to 2 days)**
- Real error states instead of empty results; report partial failures; fix the QR/`qr_code` mismatch (H5).
- Parameterised filters (M3), correct field names and the `genus` expand (M4), clear the cache after edits (M6).
- Handle expired logins (H2).
- `npm audit fix`, rebuild, re-test (H4).

**3. Make it deployable (1 day)**
- `.gitignore`, untrack `node_modules`, `dist`, `.vscode` (M1).
- `VITE_PB_URL` / `VITE_SITE_URL` and `pb.files.getURL` (M2).
- Lint clean and added to the build (M8). README with run/deploy steps (L8).

**4. Polish**
- Check the site on a phone; fix admin responsiveness, focus states, alt text, contrast (D1 to D3).
- Self-host fonts and icons, compress images, favicon and share tags, a 404 page (D5, D6, L4, L5).
- Delete dead code and rename `pLantCard` (L1, L2); taxonomy edit/delete (L3); tokenise the CSS (D4); remove debug logs and fix the N+1 (M5).

**What I need from you to go further:** a superuser login (or a screenshot of each collection's API rules) to confirm H1/H2 and set the rules, and permission to run the app in a browser so the design findings can be checked on real screens.
