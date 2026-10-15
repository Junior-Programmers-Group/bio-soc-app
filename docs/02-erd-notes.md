# Phase 2: Data Model (ERD, as built)

Diagram: [diagrams/02-erd.drawio](diagrams/02-erd.drawio)

The backend is PocketBase (`https://jpg-services.nddu.edu.ph/pb-biosoc`). Each entity below is a PocketBase collection. This ERD was derived from how the code reads and writes the collections, not from an export of the live schema (see "Please verify").

## Entities and relationships

| Entity | Parent (FK) | Cardinality | Key fields |
| :--- | :--- | :--- | :--- |
| DOMAIN | none | 1:N Kingdom | name, description, date_discovered |
| KINGDOM | domain | N:1 Domain | name, description |
| PHYLUM | kingdom | N:1 Kingdom | name, description |
| CLASS | phylum | N:1 Phylum | name, description |
| ORDER | class | N:1 Class | name, description |
| FAMILY | order | N:1 Order | name, description, date_discovered |
| GENUS | family | N:1 Family | name, description |
| SPECIES | genus | N:1 Genus | commonName, scientificName, description, author, year, conservationStatus, notes, field (image file), qr_code (file) |
| DETAILS | species | 1:1 Species | morphology, ecology, distribution, uses |
| USERS | none | none | email, password, verified, role, isAdmin |

Taxonomy is a strict chain: Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species. Each level has one parent. The app walks this chain with a single nested expand when loading plants (`species.genus.family.order.class.phylum.kingdom.domain`).

## Changes from the original ERD

- **Added DOMAIN** above Kingdom.
- **Renamed** the flat `speciesID` / `genusID` style keys to PocketBase relation fields (`genus`, `family`, ...). PocketBase generates the string `id` itself.
- **Added DETAILS** (morphology, ecology, distribution, uses), a separate 1:1 table shown on the plant profile tabs. It is created and updated together with the species.
- **Added to SPECIES:** `image` (`field`) and `qr_code` files. The QR code is generated on create and regenerated on edit. It encodes `https://flora.nddu.edu.ph/discover/plants/<speciesId>` (see `qrCodeService.ts`).
- **Added USERS** (PocketBase auth collection). It is not related to plant data.

## Please verify (code and old ERD disagree, or are unclear)

1. **Legacy duplicate fields on SPECIES.** The admin code still writes `kingdom`, `phylum`, `klass`, `order`, `family`, `species`, `morphology`, `ecology`, `distribution`, `uses` and `phylum_id` to `species` on create/update, but the public pages read taxonomy through `genus` and details through `details`. I left these off the diagram as redundant. Confirm whether those columns still exist in PocketBase.
2. **CLASS parent field.** The TypeScript type names it `Phylum`, but the queries use `phylum`. I drew it as `phylum`.
3. **`hierarchy` code uses `parent_id`** in one fallback path in `plantService.ts`. The main path uses named parent fields, which is what the diagram shows.
4. **USERS `role` vs `isAdmin`.** Both exist: login checks `isAdmin`, the Manage Users screen edits `role`. They are not tied together in code.
5. **Old `PlantsCRUD` screen** (`/plants`) writes `name`, `description`, `phylum_id` to the `class` collection. It looks like leftover prototype code, so I excluded it.

Run a schema export from the PocketBase admin UI if you want me to check the diagram against the real collections.
