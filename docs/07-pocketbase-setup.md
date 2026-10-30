# PocketBase Setup Runbook (Workstream A)

> **Status (2026-10-30):** sections 1 to 6 were carried out on the live server. See "Notes from doing workstream A" in [06-todo.md](06-todo.md). The rules below are what is now live (`docs/schema/pb_schema.json` is the exported copy). Keep this file for rebuilding the server or for checking the rules after a change. Still open: a test restore (section 3), the off-server backup copy, and the image cut-off (section 8).

For the person who holds the PocketBase admin (superuser) login. Open the admin at `https://jpg-services.nddu.edu.ph/pb-biosoc/_/`. Nothing in this file can be done from the code; it all happens in the admin UI. Task IDs refer to [06-todo.md](06-todo.md).

Do the steps in order. Total time: about half a day.

## 1. Clean the data (A1)

Open **Collections** and handle these.

| Collection | Record | What to do |
| :-- | :-- | :-- |
| `order` | id `k3mqfoem0cmzwbz` (blank name, created 2026-10-13) | **Delete.** Created by an audit test request; nothing uses it. |
| `genus`, `family`, `order`, `class`, `phylum`, `kingdom` | The rows the species hang off: genus `awdawd`, family `awdawdawd`, order `awdawd`, class `awdwad` (description "awdw"), phylum `awdawd`, kingdom `awdawd` | **Do not delete. Rename** to the real taxonomy (see below). |

The whole taxonomy above the 11 species is placeholder text, and it is public on the site. Real plants point at these rows, so deleting them would leave plants with no taxonomy. Instead, for each row put in the correct scientific name and description, using BioSociety's species list (for example Kingdom *Plantae*, then the right phylum, class, order, family and genus for each plant). If species belong to different families or genera, add the missing rows (Admin -> Taxonomy, or in this UI) and re-point each species' `genus`. Only delete a taxonomy row once no record points at it (the admin UI warns you if one does).

## 2. Set the API rules (A2, A3)

In each collection: **gear icon -> API Rules**. In PocketBase an **empty** rule means anyone, **locked** (padlock) means superuser only, and an expression means the condition must be true.

**Taxonomy and plant data:** `species`, `details`, `kingdom`, `phylum`, `class`, `order`, `family`, `genus`

| Rule | Value |
| :-- | :-- |
| List/Search | *(empty)* - public |
| View | *(empty)* - public |
| Create | `@request.auth.id != "" && @request.auth.isAdmin = true` |
| Update | `@request.auth.id != "" && @request.auth.isAdmin = true` |
| Delete | `@request.auth.id != "" && @request.auth.isAdmin = true` |

**`users` collection**

| Rule | Value | Meaning |
| :-- | :-- | :-- |
| List/Search | `@request.auth.isAdmin = true \|\| id = @request.auth.id` | Admins see all users; others see only themselves |
| View | `@request.auth.isAdmin = true \|\| id = @request.auth.id` | Same |
| Create | *locked* (or empty if students may register) | Decide: does the site need public sign-up? It currently has none in the UI. |
| Update | `@request.auth.isAdmin = true \|\| (id = @request.auth.id && @request.body.isAdmin:isset = false && @request.body.role:isset = false)` | Users can edit themselves but never their own `role` or `isAdmin` |
| Delete | `@request.auth.isAdmin = true && id != @request.auth.id` | Admins can delete others, not themselves |

If the `users` collection has no `isAdmin` field, or the admin flag is stored under another name, use that name in every rule above.

The app now uses **only `isAdmin`** to decide who is an admin. The old `role` field (user / admin / moderator) is no longer read or written; you can delete it from the `users` collection when convenient.

**Known catch - hidden emails.** PocketBase hides a user's email from everyone except superusers and the user themselves, unless the user's `emailVisibility` is on. With these rules the app's Users screen may show "hidden" instead of other people's emails. Either ask each user to turn on email visibility (it is a field on their record, editable here), or manage accounts directly in this admin UI.

**Check it works:**
1. Log out of the admin UI (or open a private window).
2. Run `scripts/check-api-rules.sh` from the repo. No line should say `FAIL`. Lines marked `INCONCLUSIVE` mean "the server refused for a different reason"; the rule table above is the real proof, so re-read the rules in the UI.
3. Open the live site: Home, Discover, a plant page and Scan must still load.
4. Log in to `/admin` with an admin account and add, edit and delete a test plant. Then delete the test plant.
5. Log in with a non-admin account (if one exists): `/admin` must refuse it, and the account must not be able to change its own role.

Only when step 4 works with the new rules is it safe to also run `scripts/check-api-rules.sh --write-test`. That one tries to create records while logged out, and if a rule is still open it leaves records named `RULES-TEST-DELETE-ME` for you to delete.

## 3. Backups (A4)

1. **Settings -> Backups**: turn on auto backups, e.g. cron `0 2 * * *` (daily 02:00), keep the last 7 to 14.
2. Set up S3-compatible storage there if available, or copy the backup files from the server to another machine or drive on a schedule. A backup that lives only on the same server does not protect against losing the server.
3. **Test a restore once**: download a backup, run PocketBase locally with an empty `pb_data`, restore it from the same Settings page, and open a plant. Write the date of the first successful test in this file.

Last restore test: *not done yet*. Automatic backups: daily 02:00 Philippine time (cron `0 18 * * *` in UTC), keeping 7, stored on the server only.

**Downloading a backup through the proxy:** the web server cuts responses at ~32 KB, so a normal download of a 30 MB backup stops early. Range requests work: fetch it in slices of about 28,000 bytes with `Range: bytes=start-end` headers and join them (a script that does this was used on 2026-10-30; the result was a complete file that opens as a valid zip).

## 4. Export the schema and data (A6)

1. **Settings -> Export collections -> Download as JSON**. Save it as `docs/schema/pb_schema.json` and commit it. This is the file that lets the team rebuild every collection, field and rule.
2. Export the data: in each collection, use the table's **Export** (or the backup from step 3). Keep these exports somewhere private, not in the public repo, if they could contain personal data (the `users` collection does).
3. Repeat the schema export after any change to fields or rules.

## 5. Decide about the `qr_code` field (A7)

The code tries to save a QR image into `species.qr_code`, but that field does not exist, so the upload is silently dropped. The QR codes on printed tags are generated from the plant ID and do not need it. Choose one:

- **Do not store QR images (recommended, and what the code now assumes).** Nothing to do in PocketBase. The upload code has already been removed (task C4).
- **Store them.** Add a **File** field named `qr_code` to `species` (single file, PNG only, max 1 MB), then tell the developers: the upload code was removed and would need to be written back.

Write the decision here: **do not store QR images** (decided 2026-10-30; no `qr_code` field).

## 6. Data sanity check (A8)

For each of the species, confirm:
- a genus is set, and the genus -> family -> order -> class -> phylum -> kingdom chain is complete;
- one `details` record points to it, with morphology, ecology, distribution and uses filled in;
- an image is attached and loads on the live site;
- the common name, scientific name, author, year and conservation status are correct (ask BioSociety).

Count at the time of the audit: 11 species, 11 details, 13 genera, 1 each of kingdom/phylum/class/order/family (all placeholder text, see section 1). List gaps below and fix them.

| Species | Problem | Fixed |
| :-- | :-- | :-- |
| | | |

## 7. Do not break printed tags

Every printed QR code contains `<site address>/discover/plants/<plant id>`. Never delete a plant and add it again; edit it. If the website address ever changes, the old address must keep redirecting.

## 8. Images: fix cut-off downloads and enable thumbnails

**Cut-off images (do this before launch).** Several plant images fail to load because the server sends only the first ~32 KB and then stops, while announcing the full length (browser error `ERR_CONTENT_LENGTH_MISMATCH`). Test with `curl -s -o /dev/null -w "%{size_download}\n" -D - "<PocketBase URL>/api/files/species/<id>/<filename>"` and compare the `Content-Length` header with the bytes received. This looks like a problem in the web server that sits in front of PocketBase (`/pb-biosoc` is proxied), not in PocketBase or the app. Things to check with whoever runs it:
- the proxy's error log at the time of a failed request (look for "permission denied" on a temporary file, or "upstream prematurely closed connection");
- for nginx: the owner and free space of `proxy_temp_path`, and try `proxy_buffering off;` for that location;
- whether a firewall, CDN or antivirus gateway is cutting long responses.

**Thumbnails.** The site now asks for 400x300 copies of images in lists (smaller and faster). PocketBase only makes them if the field allows that size: open `species` > field `field` > options > **Thumb sizes**, add `400x300`, save. Until then the full image is sent, as before.
