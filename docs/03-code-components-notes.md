# Phase 3: Code Component Diagram (as built)

Diagram: [diagrams/03-code-components.drawio](diagrams/03-code-components.drawio)

## Architecture in one paragraph

Flora is a **single-page React app with no custom backend**. The browser talks directly to a hosted PocketBase server (`https://jpg-services.nddu.edu.ph/pb-biosoc`) through one shared client in `back-end/db.ts`. So the backend layers from the guide (router, controller, service, repository) collapse into: **Presentation, Service, Data Access, External**. Authentication, validation and permissions are handled by PocketBase.

## Layers and components

| Layer | Components | Responsibility |
| :--- | :--- | :--- |
| Entry & Routing | `main.tsx`, `App.tsx` | Mounts the app, defines routes (`/`, `/scan`, `/discover`, `/discover/plants/:id`, `/discover/:id`, `/admin`, `/plants`), keeps admin login state from `pb.authStore`. |
| Presentation: public | `Home`, `Scan`, `DiscoverPlants`, `PlantDetail` and their components (Navbar, Hero + SearchDropdown, SearchBar, Filters, PlantsGrid, static home sections) | Visitor features. Search, filter and sort run in the browser on the full plant list. |
| Presentation: admin | `AdminLogin`, `AdminDashboard` → `ManagePlants` (+ `QRModal`, `ConfirmationModal`), `ManageUsers`, `Analytics`, `Taxonomy` | Admin features, switched by tabs inside one `/admin` route. |
| Service | `plantService` (read plants, taxonomy; 5-minute in-memory cache), `adminService` (plant create/update/delete incl. `details` sync, users, analytics), `qrCodeService` (QR generate/download/print), `useFetchTaxonomy` (taxonomy read + create) | All PocketBase calls and QR logic. |
| Data Access | `back-end/db.ts` | The single PocketBase client instance. |
| External | PocketBase server | Collections (see ERD), file storage for plant images and QR PNGs, user auth. |

## Main flows

- **Scan:** `Scan` (html5-qrcode) reads the code, looks up `species` by id or `qr_code`, then routes to `/discover/plants/:id`.
- **Browse / search:** `DiscoverPlants` → `plantService.fetchPlants` (one request, expands genus up to domain) → filtering in the page.
- **Plant profile:** `PlantDetail` → `plantService` (plant + taxonomy) and PocketBase `details` directly.
- **Add plant:** `ManagePlants` → `adminService.createPlant` → create `species` → create `details` → generate QR (`qrCodeService`) → upload QR PNG to `species.qr_code`.

## Things the diagram makes visible (review with the team)

1. **Service layer is bypassed in places** (orange dashed arrows). `Scan`, `PlantDetail` (for `details`) and `AdminLogin` call PocketBase directly. Candidate refactor: move these into services.
2. **`/plants` is a public, unauthenticated route** (`PlantsCRUD`) that can create, edit and delete records in the `class` collection. It is leftover prototype code. It's worth removing the route, or confirming PocketBase rules block anonymous writes.
3. **`/admin` access is client-side.** `App.tsx` shows the dashboard if `pb.authStore.model.isAdmin` is true. Real protection must come from PocketBase collection rules. Worth confirming they restrict writes to admins.
4. **Unused code** (not drawn, safe to delete or ignore): `hooks/useAuth.ts`, `components/ProtectedRoute.tsx`, `pages/Admin/Admin.tsx`, `services/imageProxy.ts`, `components/DiscoverPlant/pLantCard/pLantCard.tsx`. Also `plantService` has `addPlant`, `updatePlant`, `deletePlant` that duplicate `adminService`.
5. `useAuth.ts` creates a second PocketBase client pointing at `http://localhost:8090` (and has a "demo mode"); this is only a concern if it's ever wired in.
6. `adminService` is large (plants, users, analytics in one file). The guide's rule of thumb is to split an overloaded service, for example into `plantAdminService`, `userService`, `analyticsService`.

Any refactors should be done by the team, since this documentation pass does not change code.
