# FlatOut: Head On — Browser Launcher (BYO ISO)

A legal **Bring Your Own ISO** web launcher for *FlatOut: Head On* (PSP).  
The page runs the **PPSSPP** core via **EmulatorJS** (WebAssembly) in your browser and lets you select **your own legally obtained** game image locally.

> **No game files are included, hosted, or downloaded by this project.**  
> This project is not affiliated with Bugbear Entertainment, Empire Interactive, Sony, EmulatorJS, or PPSSPP.

## What it does
- Accepts a local `.iso`, `.cso`, or `.pbp` file selected by the user.
- Creates a local blob URL and starts EmulatorJS with the PPSSPP core.
- Uses a COOP/COEP service worker (`coi-serviceworker.js`) to enable `SharedArrayBuffer` on static hosts such as GitHub Pages.

## What it does NOT do
- It does **not** provide FlatOut: Head On, ROMs, ISOs, CSOs, BIOS files, or links to obtain them.
- It does **not** bypass DRM or ownership requirements.

## Local run
Because `SharedArrayBuffer`/cross-origin isolation and service workers are required, serve over HTTP(S) (not `file://`):

```bash
# Python
python3 -m http.server 8080

# or Node (if you have a static server)
npx serve .
```

Open `http://localhost:8080`. On the first load the COI service worker may reload the page once.

## Deploy to GitHub Pages
1. Push this repository to GitHub.
2. Settings → Pages → Source: **Deploy from a branch** (or use Actions).  
   For a simple static site, `main` / root works.
3. Open the Pages URL. The first visit may reload once to activate COOP/COEP isolation.

A simple workflow is included in `.github/workflows/pages.yml`.

## Performance notes
PSP emulation in the browser is demanding. *FlatOut: Head On* is a 3D racing game and may run slowly or with issues depending on your device/browser. For the most stable experience, use the official [PPSSPP](https://www.ppsspp.org/) app/desktop emulator with your own legally obtained copy.

## Credits / licenses
- [EmulatorJS](https://www.emulatorjs.org/) — emulator frontend/loader (loaded from its CDN by default).
- [PPSSPP](https://www.ppsspp.org/) — PSP emulator core.
- `coi-serviceworker.js` — based on the COI Service Worker approach (MIT). See file header.

Use only content you legally own.
