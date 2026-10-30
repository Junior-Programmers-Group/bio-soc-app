# Phase 3: Code Component Diagram (as built)

Diagram: [diagrams/03-code-components.drawio](diagrams/03-code-components.drawio)

## Architecture in one paragraph

Flora is a **single-page React app with no custom backend**. The browser talks directly to a hosted PocketBase server (`https://jpg-services.nddu.edu.ph/pb-biosoc`) through one shared client in `back-end/db.ts`. So the backend layers from the guide (router, controller, service, repository) collapse into: **Presentation, Service, Data Access, External**. Authentication, validation and permissions are handled by PocketBase.

## Layers and components

| Layer | Components | Responsibility |
| :--- | :--- | :--- |
| Entry & Routing | `main.tsx`, `App.tsx` | Mounts the app, defines routes (`/`, `/scan`, `/discover`, `/discover/plants/:id`, `/discover/:id`, `/admin`), keeps admin login state live through `useAdminSession`. |
| Presentation: public | `Home`, `Scan`, `DiscoverPlants`, `PlantDetail` and their components (Navbar, Hero + SearchDropdown, SearchBar, Filters, PlantsGrid, static home sections) | Visitor features. Search, filter and sort run in the browser on the full plant list. |
| Presentation: admin | `AdminLogin`, `AdminDashboard` → `ManagePlants` (+ `QRModal`, `ConfirmationModal`), `ManageUsers`, `Analytics`, `Taxonomy` | Admin features, switched by tabs inside one `/admin` route. |
| Service | `plantService` (read plants, taxonomy; 5-minute cache cleared after admin changes), `plantAdmin` (plant create/update/delete with `details`, with rollback), `userAdmin` (users, admin access, guards), `analytics` (server-side counts), `qrCodeService` (QR generate/download/print), `imageUrl`, `errors`, `useFetchTaxonomy` (taxonomy read + create) | All PocketBase calls and QR logic. |
| Data Access | `back-end/db.ts`, `config.ts` | The single PocketBase client (address from `VITE_PB_URL`); it clears a rejected login. |
| External | PocketBase server | Collections (see ERD), file storage for plant images and QR PNGs, user auth. |

## Main flows

- **Scan:** `Scan` (html5-qrcode) reads the code, validates the plant id from the tag, checks the plant exists, then routes to `/discover/plants/:id`.
- **Browse / search:** `DiscoverPlants` → `plantService.fetchPlants` (one request, expands genus up to domain) → filtering in the page.
- **Plant profile:** `PlantDetail` → `plantService.fetchPlantById` (plant, taxonomy and `details` together).
- **Add plant:** `ManagePlants` → `plantAdmin.createPlant` → create `species` → create `details` (the plant is removed again if this fails). QR codes are generated on demand, not stored.

## Status of the earlier review points

1. Service layer bypass: `PlantDetail` now uses the service. `Scan` (one existence check) and `AdminLogin` still call PocketBase directly; acceptable, but could move into services.
2. `/plants` route: **removed**, with `PlantsCRUD` and its hooks.
3. `/admin` access: the dashboard still only renders for an admin session (verified with the server on load), but real protection is the PocketBase API rules (task A2/A3, see [07-pocketbase-setup.md](07-pocketbase-setup.md)).
4. Unused code: **removed** (`useAuth`, `ProtectedRoute`, `pages/Admin`, `imageProxy`, `pLantCard`, duplicate CRUD in `plantService`).
5. `adminService` split: **done** (`plantAdmin`, `userAdmin`, `analytics`).

The draw.io diagram `diagrams/03-code-components.drawio` still shows the older structure and has not been redrawn.
