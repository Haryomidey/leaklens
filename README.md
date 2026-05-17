# LeakLens

LeakLens is a Chrome extension that scans the active tab for client-side security signals such as exposed API keys, sensitive route references, public source-map hints, cloud storage URLs, and visible client configuration markers.

## Features

- Chrome Manifest V3 extension build
- React popup UI with hash-based routing
- Live active-tab scan results from the content script
- Dashboard, findings list, finding detail, scan progress, heatmap preview, settings, and report screens
- Custom popup scrollbar styling
- TypeScript, Vite, Tailwind CSS, React, and Lucide icons

## Requirements

- Node.js
- pnpm
- Chrome or another Chromium-based browser

## Install

```bash
pnpm install
```

## Development

Run the Vite development server:

```bash
pnpm run dev
```

The browser extension itself should be tested from a production build because Chrome loads the generated Manifest V3 files from `dist`.

## Build

```bash
pnpm run build
```

The compiled extension is written to `dist/`.

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `dist` folder.
5. Open a normal web page, then click the LeakLens extension icon.

If you rebuild, reload the extension from `chrome://extensions` so Chrome picks up the new popup, background worker, and content script.

## Scripts

- `pnpm run dev` starts Vite for local UI development.
- `pnpm run build` creates the Chrome extension bundle in `dist/`.
- `pnpm run lint` runs TypeScript checks with `tsc --noEmit`.
- `pnpm run clean` removes the generated `dist` folder.

## Project Structure

```text
public/manifest.json          Chrome extension manifest
popup.html                    Popup HTML entry
src/popup/                    React popup entry, routes, and scan context
src/extension/background.ts   MV3 background service worker
src/extension/content.ts      Active-page scanner content script
src/pages/                    Popup screens
src/components/               Shared UI and layout components
src/lib/scanTypes.ts          Shared scan result types
src/types/chrome.d.ts         Minimal Chrome API declarations
```

## Notes

LeakLens scans only data available to the browser on the current page. Findings are heuristic signals and should be manually reviewed before treating them as confirmed vulnerabilities.