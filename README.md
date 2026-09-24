# Outcast Heartbreak Hotel

Responsive frontend loyalty concept built with React, TypeScript and CSS.

## Preview

Run `npm install`, then `npm run dev -- --port 3000` and open http://localhost:3000.

## GitHub Pages

`npm run build:pages` builds a static copy into `out/` using `vite.pages.config.ts` and the `pages/` entry. Pushing to `main` deploys it through `.github/workflows/pages.yml`. Asset paths are relative, so the site works under the repository subpath.

## Experience

Check In enters the elevator. Four direct floor controls, deliberate wheel gestures and vertical swipes navigate the tiers. Reusable doors close before the floor and scene change, then reopen. Guest Services contains earning, redemption, referral and FAQ content. Join Loyalty and Returning Guest are explicitly labelled concept states; no accounts or personal data are created or stored.

Tier content and hotspot coordinates: `app/tiers.ts`.
Experience and accessible overlays: `app/page.tsx`.
Art direction and responsive styles: `app/globals.css`.
Compressed campaign images and mobile crops: `public/assets`.

Room and lift imagery comes from the user-supplied Assets folder. The corrected Penthouse portrait uses OUTCAST_Floor_04_MB_V2.png. Mobile images have modest ceiling crops; hotspot coordinates are transformed from the original image coordinates so the markers remain aligned. The SVG Outcast wordmark is supplied; the Heartbreak Hotel mark is retained from the original assets. Plus Jakarta Sans is served locally under its SIL Open Font License.

Floor scenes preserve their aspect ratio, with tier information outside the image. No floating key or bell graphics are added. The two lift doors use the left and right halves of one shared texture. Desktop wheel input works across the hotel, advances one floor per gesture, and is ignored while dialogs or sheets are open. Arrow keys, Home and End work in the floor control.

## Validation

Check at 390×844, 430×932, 768×1024 and 1440×900. Test direct floor changes, one-floor wheel gestures, mobile swipe, hotspots, Escape, focus restoration, Guest Services and Join Loyalty. Reduced-motion mode shortens door animation and removes vertical travel.

Optional browser WebMCP support exposes `navigate_hotel_floor` using the same transition and validation as the UI. It is feature-detected and has no effect in unsupported browsers.
