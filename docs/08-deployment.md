# Deployment Guide

Flora is a static single-page app (React + Vite). Building it produces a `dist/` folder of plain files that any web server can serve. The data lives in a separate PocketBase server.

## Before you build

1. Install Node.js 20.19 or newer (required by Vite 7).
2. `npm install`
3. Copy `.env.example` to `.env` and set:

| Variable | Meaning | Default |
| :-- | :-- | :-- |
| `VITE_PB_URL` | PocketBase API address (no trailing slash, no `/_/`) | `https://jpg-services.nddu.edu.ph/pb-biosoc` |
| `VITE_SITE_URL` | Public website address, written into every QR code | `https://flora.nddu.edu.ph` |

These values are baked into the build. Changing them means rebuilding. If `VITE_SITE_URL` changes, **every printed QR tag stops working** unless the old address redirects.

## Build

```
npm run build
```

This type-checks, then writes the site to `dist/`. Upload the contents of `dist/` to the web server's document root. To try the result locally first: `npm run preview`.

## The one required server setting

The app uses clean URLs such as `/discover/plants/4qj2xv035uo50ut`. Those files do not exist on disk, so the server must return `index.html` for any path that is not a real file. Without this, a QR scan, a shared link or a page refresh shows "404 Not Found" while clicking around the site works fine (which hides the problem during testing).

**nginx**
```
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache** (`.htaccess` in the document root)
```
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

**Netlify / Cloudflare Pages**: add a file `public/_redirects` containing `/*  /index.html  200`.

**GitHub Pages**: does not support rewrites; use a different host for the QR links to work.

I do not know where flora.nddu.edu.ph is hosted. Ask whoever manages it which of these applies, and write it here: *host: unknown*

## Also set on the server

- **HTTPS only.** Camera scanning (`/scan`) only works on HTTPS.
- **Caching:** files in `dist/assets/` have a hash in the name and can be cached for a year. `index.html` should not be cached, so a new build is picked up.
- **CORS on PocketBase:** the site's address must be allowed to call the API (PocketBase allows all origins by default; leave it unless you have tightened it).

## After deploying: check these

1. Open the home page, then `/discover`.
2. Open a plant, then **refresh the page**. It must still show the plant.
3. Paste a plant URL straight into a new tab (not by clicking).
4. Scan a printed tag with a phone using mobile data, not campus Wi-Fi.
5. Open `/scan` and allow the camera.
6. Log in at `/admin`.

## Updating the site later

1. Pull the latest code, `npm install`, `npm run build`.
2. Upload the new `dist/` over the old one. Keep a copy of the previous `dist/` for a quick rollback.
3. Run the six checks above.
