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
| SPECIES | genus | N:1 Genus | commonName, scientificName, author, year, conservationStatus, notes, field (image file) |
| DETAILS | species | 1:1 Species | morphology, ecology, distribution, uses |
| USERS | none | none | email, password, verified, isAdmin (the legacy `role` field is no longer used) |

Taxonomy is a strict chain: Domain, Kingdom, Phylum, Class, Order, Family, Genus, Species. Each level has one parent. The app walks this chain with a single nested expand when loading plants (`species.genus.family.order.class.phylum.kingdom.domain`).

## Changes from the original ERD

- **Added DOMAIN** above Kingdom.
- **Renamed** the flat `speciesID` / `genusID` style keys to PocketBase relation fields (`genus`, `family`, ...). PocketBase generates the string `id` itself.
- **Added DETAILS** (morphology, ecology, distribution, uses), a separate 1:1 table shown on the plant profile tabs. It is created and updated together with the species.
- **Added to SPECIES:** the `field` image file. QR codes are not stored: they are generated on demand from the plant id and encode `https://flora.nddu.edu.ph/discover/plants/<speciesId>` (see `qrCodeService.ts`).
- **Added USERS** (PocketBase auth collection). It is not related to plant data.

## Verified against the live server (2026-10-14) and the current code

- `species` has only: author, commonName, conservationStatus, field, genus, notes, scientificName, year. There is **no** `qr_code` field. The old legacy columns (`kingdom`, `phylum`, `klass`, `order`, `family`, `species`, `phylum_id`, ...) do not exist either, and the code no longer sends them.
- Taxonomy parent fields are the named relations shown above (`family.order`, `order.class`, `class.phylum`, ...).
- `users.isAdmin` is the only admin flag the app reads. `role` is unused.
- The schema export from the PocketBase admin (task A6) is still outstanding, so the live schema is known from API responses, not from an export.
