# Flora: Improvement To-Do List

Source: [05-audit.md](05-audit.md) (2026-10-14). Item codes like `H1` or `D3` point to the finding in the audit.

**Effort:** S = under 2 hours, M = half a day, L = 1 day or more.
**Status key:** `[x]` done, `[~]` partly done (a person with the admin login must finish it), `[ ]` not started.
**How to use:** one person takes one workstream. Tick the box when the "Done when" condition is true. Open a pull request per task or per small group, not one giant one.

## Read before starting

- **Workstream A needs the PocketBase admin login** (`https://jpg-services.nddu.edu.ph/pb-biosoc/_/`). Only the person who holds it can do A. Do A1 to A4 first. Everything else can run in parallel.
- **Do B1 (`.gitignore`, untrack `node_modules`) before anyone else commits.** It changes thousands of files, and everyone must pull it before continuing.
- **`ManagePlants.tsx` (1,035 lines) is touched by C, D, E and G tasks.** Do not give it to more than one person at a time. Assign all of its tasks to one teammate, or do them one after another.
- Run `npm run build` before every pull request. From task G1 on, also run `npm run lint`.
- Never delete and re-create a plant that already has a printed QR tag. Edit it instead. The QR code contains the plant's database ID.

---

## A. Database and server (PocketBase admin) - needs admin login

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [ ] | A1 | **Clean the test data.** Delete the blank `order` record `k3mqfoem0cmzwbz`. The placeholder taxonomy (`awdawd`, `awdwad`, ...) is in use by the real species: **rename it to the real names, do not delete it** (see the runbook). | No blank records remain, and no taxonomy row reads like keyboard mashing. | M | H1, M9 |
| [ ] | A2 | **Lock the API rules.** For `species`, `details`, `kingdom`, `phylum`, `class`, `order`, `family`, `genus`: list/view public; create/update/delete only for `@request.auth.id != "" && @request.auth.isAdmin = true`. | Anonymous create, update and delete all return 403 (test with the checks in A5). Public pages still load. | M | H1 |
| [ ] | A3 | **Protect the `users` collection.** Only admins can list other users or change `role` / `isAdmin`. A normal user can see only their own record. Turn off public sign-up if students should not have accounts. | A non-admin account cannot read other users and cannot change its own `role` or `isAdmin`. | M | H2 |
| [ ] | A4 | **Backups.** Turn on scheduled backups (Settings -> Backups), store copies off the server, and do one test restore on another machine. | A backup exists in a second location and a restore was tried once. | M | H3 |
| [~] | A5 | **Write a rules test checklist.** A short list of curl commands (or a script in `scripts/`) that proves anonymous users can read but not write. Re-run it after any rule change. | The file is committed and passes against the live server. | S | H1 |
| [ ] | A6 | **Export the schema.** Settings -> Export collections. Commit it as `docs/schema/pb_schema.json`. Also export species and taxonomy as CSV/JSON into a private place (not the public repo if it has personal data). | The schema file is in the repo and a data export is saved. | S | H3 |
| [ ] | A7 | **Decide the `qr_code` field.** Either add a file field `qr_code` to `species`, or agree that QR images are never stored. Tell the team which one (affects C4). | Decision written in the pull request or in this file. | S | H5 |
| [ ] | A8 | **Sanity-check the data.** Every species has a genus, an image and a `details` row. Genus -> family -> order -> class -> phylum -> kingdom links are complete. The live count (11 species) is correct. | A short list of any gaps, each one fixed or logged. | M | M9 |

---

## B. Repository and build

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [x] | B1 | **Add `.gitignore`** (`node_modules`, `dist`, `.env`, `.vite`, editor files) and run `git rm -r --cached node_modules dist .vscode`. Announce to the team to pull. | `git status` is clean after `npm install` and a build. Repo no longer tracks `node_modules`. | S | M1 |
| [x] | B2 | **Environment variables.** Add `VITE_PB_URL` and `VITE_SITE_URL`, read them in `db.ts` and `qrCodeService.ts`. Commit `.env.example`. Replace every hard-coded `jpg-services...` and `flora.nddu...` string. | `grep -r "jpg-services\|flora.nddu\|localhost" src` finds nothing outside `.env*`. Changing the variable changes the server. | M | M2 |
| [x] | B3 | **Use `pb.files.getURL()` for images** in `plantService.ts` (6 places), `ManagePlants.tsx` (3 places). | No image URL is built by string concatenation. All images still load. | M | M2 |
| [x] | B4 | **Update dependencies.** `npm audit fix`, then rebuild and click through Home, Discover, a plant page, Scan, Admin login and Admin dashboard. Check the `react-router-dom` advisory is gone. | `npm audit` shows no high-severity issues (or each remaining one is written down with a reason). Build passes. | M | H4 |
| [x] | B5 | **Fix `vite.config.ts` chunking:** put the `react-router` check before `react`, or drop manual chunks. | A `vendor-router` chunk appears in the build output, or manual chunks are removed. | S | L6 |
| [x] | B6 | **Deployment guide.** Where the site is hosted, how to build (`npm run build`), how to publish `dist/`, and the SPA rewrite rule so `/discover/plants/<id>` works on refresh (every request falls back to `index.html`). Add to README. | A teammate who has never deployed can follow it. A page refresh on a plant URL works on the live site. | M | L8 |
| [x] | B7 | **README refresh:** how to install, run, build, env variables; fix "9 species". | README matches reality. | S | L8, M9 |

---

## C. Data layer and bug fixes (`src/services`)

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [x] | C1 | **Stop hiding errors.** `fetchPlants`, `getPlants`, `getAnalyticsData` must throw (or return an error object) instead of `[]` / zeros. | Turning off the network produces an error, not "0 results". | M | H5 |
| [x] | C2 | **Report partial failures** in `createPlant` and `deletePlant`: if the details or QR step fails, tell the admin exactly what failed. Delete the species first or roll back in a sensible order. | Forcing a failure on step 2 shows a clear message, and no orphan rows remain. | M | H5, M2 |
| [x] | C3 | **Parameterised filters.** Replace `species = "${id}"` and `qr_code="${x}"` with `pb.filter("species = {:id}", { id })` (adminService ×3, Scan ×1, check PlantDetail). | No filter string contains `${`. | S | M3 |
| [x] | C4 | **Fix the QR lookup in `Scan.tsx`.** Remove the `qr_code=` fallback (or match whatever A7 decided). Keep lookup by ID. Show "Not a Flora QR code" for a foreign QR. | Scanning a non-Flora QR gives that message, and a real tag opens the plant. | S | H5 |
| [x] | C5 | **Fix the `genus_id` expand** in `fetchPlantById` (`plantService.ts:457`) to use `genus`; remove the duplicate taxonomy request in `PlantDetail` if no longer needed. | Plant page makes one taxonomy request, hierarchy still shows. | M | M4 |
| [x] | C6 | **One `Species` type that matches the database** (author, commonName, conservationStatus, field, genus, notes, scientificName, year). Send only those fields on create/update; stop sending `kingdom`, `phylum`, `klass`, `phylum_id`, etc. | Saving a plant sends only real fields. No `any` for plant data. | M | M4 |
| [x] | C7 | **Fix the N+1 `details` fetch:** use `expand: "details_via_species"` or a single `getFullList` for `details`. | Admin plant list loads with 2 requests, not 12. | M | M5 |
| [x] | C8 | **Clear the cache after admin changes** (create/update/delete plant, taxonomy change). Export a `clearPlantCache()`. | Edit a plant, open Discover, new data is shown. | S | M6 |
| [x] | C9 | **Remove duplicate CRUD** (`plantService.addPlant/updatePlant/deletePlant`). Keep only `adminService`. | One implementation per operation. | S | L1 |
| [x] | C10 | **Split `adminService.ts`** into `plantAdmin.ts`, `userAdmin.ts`, `analytics.ts`. | Same behaviour, files under ~200 lines. | M | M8 |

---

## D. Security and admin behaviour

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [x] | D1 | **Remove the `/plants` route** and `back-end/components/PlantsCRUD.tsx` and its hooks. | `/plants` redirects to home; no unauthenticated write page remains. | S | H2 |
| [x] | D2 | **Handle expired logins.** Subscribe to `pb.authStore.onChange` in `App.tsx`; on logout or expiry return to the login screen. Check `pb.authStore.isValid` for admin state. | Expire/clear the token and the dashboard disappears. | M | H2 |
| [x] | D3 | **Wire up roles properly.** One source of truth for admin (`isAdmin` or `role`), not both. Remove or implement "moderator". | Changing a user's role changes their access. | M | M7 |
| [x] | D4 | **Guard user management.** Block deleting yourself and demoting the last admin; confirm before changing a role. | Both blocked with a clear message. | S | M7 |
| [x] | D5 | **Fix analytics user count:** read counts from `totalItems` (and a filtered count for verified), not the first 500 rows. | Counts correct with more than 500 users. | S | M7 |
| [x] | D6 | **Escape text in the print window** (`qrCodeService.ts:299`) or build the page with DOM nodes. | A plant named `<b>x</b>` prints as text. | S | L7 |
| [x] | D7 | **Show friendly login errors** (wrong password, no admin rights, server unreachable) instead of raw `err.message`. | Each case has its own message. | S | H5 |

---

## E. Design, mobile and accessibility

*Open each page on a real phone and a laptop first, then write what you find under each task.*

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [ ] | E1 | **Phone review of every public page** (Home, Discover, plant page, Scan) at 360 px, 390 px and 768 px. Fix overflow, tap targets under 44 px, cramped text. | No sideways scroll; buttons easy to tap; screenshots attached to the pull request. | L | D1 |
| [ ] | E2 | **Make admin usable on mobile/tablet:** Taxonomy, ManageUsers, Analytics, AdminLogin, ConfirmationModal have no `@media` rules; plant management form and tables need responsive layouts. | Admin works at 768 px; tables scroll or stack. | L | D1 |
| [ ] | E3 | **Accessibility pass.** Meaningful `alt` on every image; labels on all inputs; `aria-label` on icon-only buttons; visible `:focus-visible` outlines; `prefers-reduced-motion` for animations; correct heading order. Test with keyboard only. | You can use Home → Discover → plant → Scan with the keyboard alone; automated check (Lighthouse/axe) shows no critical issues. | L | D2 |
| [ ] | E4 | **Colour contrast.** Fix the loading screen (`#666` on dark green), and check muted text, buttons and badges against 4.5:1. | Lighthouse accessibility score >= 90 on each page. | M | D3 |
| [ ] | E5 | **Real loading, empty, error and not-found states.** Move the inline `LoadingFallback` to CSS; add a retry button on errors; a proper 404 page instead of redirecting to home. | Each state exists on Discover, plant page, Scan and admin lists. | M | D6 |
| [ ] | E6 | **Design tokens.** Expand `global.css` variables (colours, spacing, radius, font sizes, shadows). Replace repeated hex codes in the stylesheets. | Changing one variable changes the theme everywhere. | L | D4 |
| [ ] | E7 | **Self-host fonts and icons.** Replace the Google Fonts `@import` and jsDelivr Bootstrap Icons with local files or an npm package; add `font-display: swap`. | Site looks right with external CDNs blocked. | M | D5 |
| [ ] | E8 | **Modals:** trap focus, close on Escape, return focus to the trigger, `role="dialog"` and `aria-modal`. (QRModal, ConfirmationModal) | Keyboard-only users can open, use and close both. | M | D2 |
| [ ] | E9 | **Form usability in admin:** inline validation messages, disable the save button while saving, show upload progress and image preview, warn before leaving with unsaved changes. | Each behaviour demonstrated in the pull request. | M | M8 |
| [ ] | E10 | **Taxonomy edit and delete** in the admin UI (block delete when children or species depend on it). | A typo can be fixed; deleting a used genus is refused with an explanation. | L | L3 |

---

## F. Performance and assets

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [ ] | F1 | **Compress images** in `public/` and `src/assets` (convert to WebP/AVIF, resize). Biggest: `image 4.png` 760 KB, `BIOSOCIETY.png` 600 KB, `LOGO-Final-WHITE.png` 480 KB. | `public/` under 500 KB total; no visible quality loss. | M | L4 |
| [ ] | F2 | **Rename assets** without spaces/parentheses (e.g. `Logo (1).png`) and update imports. Delete the unused or duplicate ones (`React.svg`, duplicates of `Plant.png`/`River Tamarind.png`, `.jfif`). | No filename contains a space or `(`. | S | L4 |
| [ ] | F3 | **Width/height and `loading="lazy"`** on images; use PocketBase thumbnails (`?thumb=400x300`) in the grid. | Discover grid loads smaller images; no layout jump. | M | L4 |
| [ ] | F4 | **Remove debug logging** (206 `console.*` calls). Keep `console.error` only where something is genuinely handled. Optionally add a `logger` that is silent in production. | Browser console is quiet on a normal visit. | M | M5 |
| [ ] | F5 | **Measure before and after:** run Lighthouse on Home, Discover and a plant page; record scores in the pull request. | Scores recorded; performance ≥ 85 on mobile. | S | M5 |

---

## G. Code quality and tests

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [ ] | G1 | **Fix the 81 lint problems** (mostly `any`, plus hook dependency warnings, unused variables). Do it after C6 so the types exist. | `npm run lint` passes. | L | M8 |
| [ ] | G2 | **Run lint in the build** (`"build": "tsc -b && eslint . && vite build"`) and in a pull-request check (GitHub Actions). | A pull request with a lint error fails the check. | M | M8 |
| [ ] | G3 | **Add a test setup** (Vitest + Testing Library). First tests: QR URL -> plant ID extraction, filter building, admin gate. | `npm test` runs and passes in CI. | L | M8 |
| [ ] | G4 | **Split `ManagePlants.tsx`** (1,035 lines) into a list, a form, an image uploader and a QR panel with custom hooks. *One person only.* | No file over ~300 lines; same behaviour. | L | M8 |
| [ ] | G5 | **Add a React error boundary** around routes so one crash does not blank the page. | A thrown error shows a friendly message and a reload button. | S | H5 |
| [ ] | G6 | **Manual test script** in `docs/` covering: browse, search, filter, scan a printed tag, scan an image file, admin login, add/edit/delete a plant, QR download/print, user role change. | Another teammate follows it and signs off. | M | M8 |

---

## H. Cleanup and polish

| [ ] | ID | Task | Done when | Effort | Audit |
| :-- | :-- | :-- | :-- | :-- | :-- |
| [~] | H1 | **Delete dead code:** `hooks/useAuth.ts`, `components/ProtectedRoute.tsx`, `pages/Admin/Admin.tsx`, `services/imageProxy.ts`, `components/DiscoverPlant/pLantCard/`, `back-end/hooks/*`, unused `fetchAnalytics` in `Taxonomy.tsx`. Remove `lucide-react` from `package.json`. | Build passes, no references remain. | S | L1 |
| [ ] | H2 | **Fix folder names and casing** (`pLantCard` -> `PlantCard`; check for other mixed-case names). | No two paths differ only by case. | S | L2 |
| [ ] | H3 | **`index.html`:** real favicon (replace `/vite.svg`), meta description, theme colour, Open Graph tags and image for shared links. | Sharing the link in Messenger shows a title, description and image. | S | L5 |
| [ ] | H4 | **Self-contained homepage copy review:** typos, consistent species count, contact/credits for the club and school. | Content owner signs off. | S | - |
| [ ] | H5 | **Update the docs** (`01` to `04`, diagrams) to match the final code after the changes above. | The component diagram matches `src/`. | M | - |

---

## Suggested split for four people

| Person | Workstreams | Notes |
| :-- | :-- | :-- |
| **1. Admin of the server** | A, then D2/D3 | Must hold the PocketBase login. Finish A1 to A4 before launch. |
| **2. Backend/data** | B, C, D (except D2/D3) | Starts with B1 and B2, then C. |
| **3. Frontend (admin side)** | G4, E2, E8, E9, E10, D6, D7 | Owns `ManagePlants.tsx`. Start after B1. |
| **4. Frontend (public side)** | E1, E3 to E7, F, H3 | Owns Home, Discover, plant page and Scan. |
| **Everyone** | G1, G6, H1, H5 | Lint cleanup and the manual test, split by folder. |

## Launch checklist (all must be true)

- [ ] A1, A2, A3, A4 done (clean data, locked rules, backups)
- [ ] D1, D2 done (no open write page, expired logins handled)
- [ ] C1, C2, C4 done (errors visible, QR lookup correct)
- [ ] B1, B2, B4 done (repo clean, env variables, no high vulnerabilities)
- [ ] B6 done (deploy guide, page refresh works on a plant URL)
- [ ] E1 and E3 reviewed on a real phone
- [ ] G6 manual test signed off, including scanning a printed tag from outside the campus network

---

## Notes from implementing C and D

Read these before reviewing the pull request. They are decisions made while coding.

**Checked:** `npm run build` passes (type-check and bundle), lint dropped from 81 to 24 problems (none in the new files), and one read-only request to the live server confirmed that the new taxonomy expand query returns the expected shape. **Not checked:** nobody has clicked through the app in a browser since these changes. Test these by hand before merging: Discover (load, search, filters, plant page), Scan (a real tag, a foreign QR, a photo of a tag), admin login/logout, add/edit/delete a plant, QR download and print, and Users.

- **A1 needs a correction.** The live taxonomy above the species is placeholder text (genus `awdawd`, family `awdawdawd`, order `awdawd`, class `awdwad`, phylum `awdawd`, kingdom `awdawd`). Real species hang off these rows, so deleting them would orphan the plants. Rename them to the real taxonomy instead. The runbook is updated.
- **C2 delete order.** `deletePlant` still deletes the `details` row first (it points at the plant), but if the plant cannot be deleted it re-creates the details rows with their original ids. If that restore also fails, the admin is told exactly what to re-enter.
- **C4 / A7.** The code no longer saves a QR image on the plant. Printed and downloaded QR codes are generated from the plant id, as before. If A7 decides to add a `qr_code` field, that upload code has to be written back.
- **C5 / C7.** Taxonomy comes from one request (`genus` with its parents expanded) instead of up to seven. The domain name is looked up from the `domain` collection because PocketBase only expands 6 levels. The admin list is two requests (species and details).
- **C6.** The plant form no longer carries `kingdom`, `phylum`, `klass`, `order`, `family` or `phylum_id`. They were never shown or saved. Only the real `species` fields and the four `details` texts are sent.
- **C1.** `fetchPlants`, `fetchPlantById`, `fetchTaxonomyOptions`, `getPlants`, `getUsers` and `getAnalyticsData` now throw. Discover, the home page, the plant page, analytics and the user list show an error (with "Try again" where it fits). The filter lists on Discover are best-effort: if they fail, the page still works.
- **D2.** A new hook, `useAdminSession`, replaces the old unused `useAuth`. It follows the stored login live, refreshes it with the server when the page opens (signing out deleted or demoted accounts), and re-checks every 30 seconds for token expiry. Offline, the stored login is kept.
- **D3.** `isAdmin` is the single source of truth, the same flag the login and the rules in the runbook use. The Users screen now has an "admin access" button instead of a role drop-down, and "moderator" is gone. The `role` field in PocketBase is no longer used and can be deleted when convenient.
- **D4.** Guards live in `userAdmin.ts`: no changing or deleting your own account, and no removing or deleting the last admin. These are client-side checks; the `users` rules in the runbook enforce the self-delete part on the server.
- **Watch for blank emails.** In PocketBase, a user's email is hidden from other users unless they set "emailVisibility" (superusers always see it). With the `users` rules in the runbook, the Users screen may show "hidden" for other people's emails. If that happens, ask each user to make their email visible, or use the PocketBase admin to manage accounts.
- **H1 partly done.** Removed with this work: `PlantsCRUD`, the six `usePlantClass*` hooks, `ProtectedRoute`, `pages/Admin`, `hooks/useAuth.ts` and `adminService.ts`. Still to remove: `services/imageProxy.ts`, `components/DiscoverPlant/pLantCard/`, `back-end/types/plantClass.ts`, the `fetchAnalytics` stub in `Taxonomy.tsx`, and the `lucide-react` dependency.
- **Left for later tasks:** 20 lint errors and 4 warnings remain (mostly `any` in `ManagePlants.tsx`, `Taxonomy.tsx`, `imageProxy.ts`, plus hook-dependency warnings). Debug `console.log` calls remain in `Filters.tsx`, `Hero.tsx`, `Taxonomy.tsx`, `ManagePlants.tsx` (task F4).
