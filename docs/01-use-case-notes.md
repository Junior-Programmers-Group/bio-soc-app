# Phase 1: Use Case Diagram (as built)

Diagram: [diagrams/01-use-case.drawio](diagrams/01-use-case.drawio) (open with draw.io / diagrams.net)

## Actors

| Actor | Description |
| :--- | :--- |
| Visitor | Students, staff, and visitors who scan QR tags or browse the site. No login required. |
| Admin | Project team member who signs in at `/admin` (PocketBase `users` record with `isAdmin = true`). Can do everything a Visitor can. |

## Use cases

### Visitor
| Use case | Where it lives |
| :--- | :--- |
| View Homepage | `/` (Hero, About, Why Eco-Tagging, Location, Partners) |
| Scan QR Code | `/scan` (camera; resolves plant by id or `qr_code`, shows an error if invalid) |
| Upload QR Image (extends Scan) | `/scan` (image upload fallback) |
| Browse Plant Directory | `/discover` |
| Search Plants (extends Browse) | `/discover` search bar (all / name / scientific) and homepage Hero search |
| Filter & Sort by Taxonomy (extends Browse) | `/discover` filters (domain to genus) and A-Z / Z-A sort |
| View Plant Profile (included by Scan and Browse) | `/discover/plants/:id` (overview, taxonomy, morphology, ecology, distribution, uses) |

### Admin
| Use case | Notes |
| :--- | :--- |
| Admin Login | Rejects accounts without `isAdmin` |
| Add Plant Species | Image required; includes **Generate QR Code** |
| Edit Plant Profile | Asks for confirmation; regenerates the QR code |
| Delete Plant Species | Asks for confirmation; also removes the `details` record |
| Download / Print QR Code | QR modal in Manage Plants |
| Manage Taxonomy | Create domain, kingdom, phylum, class, order, family, genus records |
| Manage Users | Change role (user / admin / moderator), delete user |
| View Analytics | Total plants, total users, verified users, verified rate |
| Logout | Clears the PocketBase auth session |

## Changes from the original use case document

- **Removed: View Educational Content.** There is no separate educational section. That material is covered by the About / Why Eco-Tagging sections on the homepage (folded into View Homepage).
- **Added:** Upload QR Image, Filter & Sort by Taxonomy, Download / Print QR Code, Manage Taxonomy, Manage Users, View Analytics, Logout.
- **Changed:** Delete Plant Species is no longer optional (it is implemented). Add Plant now takes a genus and fills in the taxonomy automatically.
- **Admin identity is settled:** admins are accounts in the PocketBase `users` collection, which answers the open "not sure if from biosoc or jpg" note.

## Things to confirm before finalizing

- Taxonomy management only supports **create** in the current UI (no edit/delete).
- There is no public user registration, so "User" accounts exist only for admin-side management.
