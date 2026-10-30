# Manual Test Script

Run this before every release, on a **production build** (`npm run build`, then `npm run preview`) or on the live site. Use a real phone for sections 2 and 3. Record the result of each step. Anything marked **FAIL** blocks the release.

Tester: __________  Date: __________  Build / commit: __________  Site: __________

Test accounts needed: one **admin** and one **non-admin** account. Use a throwaway plant name such as `ZZ Test Plant` for the admin tests and delete it at the end.

## 1. Public site (laptop)

| # | Do this | Expect | Result |
| :-- | :-- | :-- | :-- |
| 1.1 | Open the home page. | Page loads, no blank screen. The hero says "Browse all N plant species" with the right N. | |
| 1.2 | Open the browser console (F12). | No red errors. | |
| 1.3 | Type the first letters of a plant name in the hero search. | A drop-down with matching plants and thumbnails; clicking one opens its page. | |
| 1.4 | Open **Discover Plants**. | All plants appear with images; the result count matches the home page. | |
| 1.5 | Search by common name, then by scientific name (use the search-type switch). | Results narrow correctly; clearing the box restores all. | |
| 1.6 | Show Filters, pick a family or genus. | Only matching plants remain; removing the filter restores them. | |
| 1.7 | Sort A-Z then Z-A. | Order flips. | |
| 1.8 | Open a plant. Visit every tab: Overview, Taxonomy, Morphology, Ecology, Distribution, Uses. | Each tab shows its text (or "No ... information available"). Taxonomy lists domain to genus. | |
| 1.9 | **Refresh the page** on a plant URL, and paste the URL into a new tab. | The plant still loads (not a 404). | |
| 1.10 | Open `/discover/abcdefghijklmno` (a made-up id). | "Plant not found" and a back button. | |
| 1.11 | Open `/plants` and `/anything-else`. | Both go to the home page. | |

## 2. Scanning (phone, mobile data, not campus Wi-Fi)

| # | Do this | Expect | Result |
| :-- | :-- | :-- | :-- |
| 2.1 | Scan a **printed tag** with the phone's normal camera app. | The link opens the right plant page. | |
| 2.2 | Open `/scan`, allow the camera, point at a printed tag. | The plant page opens. | |
| 2.3 | On `/scan`, **deny** the camera permission. | A clear message about the camera; "Upload QR Code" still works. | |
| 2.4 | Use "Upload QR Code" with a photo or screenshot of a tag. | The plant page opens. | |
| 2.5 | Upload a photo with no QR code. | "No QR code found in the image"; the camera keeps working. | |
| 2.6 | Scan any other QR code (a website, a Wi-Fi code). | "This QR code is not a Flora plant tag." The page does not freeze or flicker. | |

## 3. Phone layout

On a phone (or browser device mode at 360 px and 390 px wide), check Home, Discover, a plant page and Scan.

| # | Expect | Result |
| :-- | :-- | :-- |
| 3.1 | No sideways scrolling on any page. | |
| 3.2 | Buttons and links are easy to tap; text is readable. | |
| 3.3 | Images are not stretched or cut off. | |

## 4. Admin (laptop)

| # | Do this | Expect | Result |
| :-- | :-- | :-- | :-- |
| 4.1 | Open `/admin` logged out. | The login form, not the dashboard. | |
| 4.2 | Log in with a **wrong password**. | "Incorrect email or password." | |
| 4.3 | Log in with the **non-admin** account. | "This account does not have admin access." and you stay on the login form. | |
| 4.4 | Log in with the admin account. | The dashboard opens. | |
| 4.5 | Reload the page. | You are still logged in. | |
| 4.6 | **Plants > + Add Plant**: fill all steps (Basic, Details), upload an image under 5 MB, Create. | "Plant created successfully"; it appears in the list and on the public Discover page. | |
| 4.7 | Try to continue a step with a required field empty. | A message naming the missing field. | |
| 4.8 | Try an image over 5 MB, and a non-image file. | A clear error for each. | |
| 4.9 | Edit the test plant: change the description tab and the image, Save Changes and confirm. | The change shows on the public plant page **without waiting 5 minutes**. | |
| 4.10 | Open the QR Code pop-up; **Download**, then **Print**. | A PNG downloads; the print page shows the plant name and QR. The printed QR, scanned, opens the plant. | |
| 4.11 | Delete the test plant and confirm. | It disappears from the admin list and from Discover. | |
| 4.12 | **Taxonomy**: add a test entry under a parent. | A success message; it appears in the Genus drop-down of the add-plant form. (Taxonomy cannot yet be edited or deleted; use the PocketBase admin to remove test entries.) | |
| 4.13 | **Users**: check the list and counts. | Your own row shows "(you)" and its buttons are disabled. | |
| 4.14 | Make the non-admin an admin, then remove it again. | A confirmation each time; the change sticks after a refresh. | |
| 4.15 | Try to remove admin access from the **only** admin (use a second browser if needed). | Refused with a message. | |
| 4.16 | **Analytics**: compare Total Plants and Total Users with reality. | Numbers match. | |
| 4.17 | Log out. | Back to the login form; the dashboard is gone. | |
| 4.18 | Log in, then in the PocketBase admin delete or demote that account, and reload `/admin`. | You are sent to the login form. | |

## 5. Failure handling

| # | Do this | Expect | Result |
| :-- | :-- | :-- | :-- |
| 5.1 | In browser dev tools, set Network to **Offline**, reload Discover. | A "couldn't load" message with **Try again**, not "0 Results". Going online and pressing Try again loads the plants. | |
| 5.2 | Same on the home page. | A message instead of a plant count of 0. | |
| 5.3 | Offline, open a plant page. | An error with **Try again** (not "Plant not found"). | |

## 6. Security spot checks

| # | Do this | Expect | Result |
| :-- | :-- | :-- | :-- |
| 6.1 | Run `scripts/check-api-rules.sh` from a terminal. | No `FAIL` lines. | |
| 6.2 | Logged out, open `<PocketBase URL>/api/collections/users/records`. | No user records are returned. | |

## Sign-off

All steps pass: ☐ yes  ☐ no (list failures below)

Failures and notes:
