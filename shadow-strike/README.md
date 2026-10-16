# Shadow Strike: Infinite Arena

Free 2D shadow-warrior fighting game for the browser. Original, code-drawn characters; no Shadow Fight assets.

## Architecture
Pure static frontend (Option A): HTML5 Canvas, classic `<script>` tags (no ES modules, no fetch, no CDN, no service worker), LocalStorage saves. Works from `file://` and GitHub Pages. No server, Node, Python or API key needed.

## Structure
```
shadow-strike/
├── index.html          game page + SEO content
├── favicon.svg, site.webmanifest
├── css/style.css
├── js/core.js          levels, enemies, economy, save validation (testable in Node)
├── js/game.js          combat, AI, rendering, input, audio, UI
├── assets/social-preview.png
└── tests/              progression.test.js, smoke.js (Node)
```

## Play
Open `index.html` by double-click, or visit https://abhigradient.github.io/arcade/shadow-strike/index.html

**Desktop:** A/D or ←/→ move, W/↑ jump, S/↓/Space block (hold), J punch, K kick, L heavy, Shift dodge, E special (full energy), Esc/P pause.
**Mobile:** on-screen buttons (auto-shown on touch devices; force them in Settings). Landscape recommended.

## Progression
`levelConfig(n)` in `js/core.js` is a pure function for any level 1..10,000,000 (larger inputs are clamped).
- HP = (55 + 6·n^0.75) × archetype × boss(2.2), capped 6000. Damage = (5 + 0.35·n^0.6) × archetype, capped 14 per punch.
- Aggression, defense, reaction time follow saturating exponentials; speed and attack speed are capped.
- 9 archetypes unlock gradually; 6 modifiers (Swift, Armored, Savage, Relentless, Vampiric, Iron Will) are added as log2(n/3+1) grows, up to all 6. A boss every 10 levels with special attacks.
- Rewards = 18 + 5·n^0.7 (×3 for bosses); replaying a cleared level pays 25%.
- Past the caps, difficulty keeps rising through more modifier stacking and archetype mixes. There is no final level.

## Saving
LocalStorage key `shadowstrike.save.v1`, versioned and sanitized on load (corrupt data falls back to defaults). Saves happen on wins, losses, purchases and settings changes, never per frame. Settings has Export, Import (validated) and Reset (with confirmation). If storage is blocked, the menu shows a warning.

## Deploy to GitHub Pages
1. Copy this folder into your arcade repo so the file is `arcade/shadow-strike/index.html`. Do not touch the arcade homepage.
2. `git add shadow-strike && git commit -m "Add Shadow Strike" && git push`
3. Visit https://abhigradient.github.io/arcade/shadow-strike/index.html after Pages rebuilds.
4. Optional: add `<url><loc>https://abhigradient.github.io/arcade/shadow-strike/index.html</loc></url>` to your existing sitemap, and a link to `shadow-strike/index.html` on your arcade homepage.

All asset paths are relative. No root-relative paths are used.

## Tests
```
node tests/progression.test.js   # 200,000 levels + extreme/invalid inputs, scaling, bosses, save sanitizing
node tests/smoke.js              # headless fight simulation with stubbed DOM
```
In the browser, append `?dev=1` to the URL to get `SSDev.play(level)` (a fight at any level that never touches your save), `SSDev.sim(a,b)` and `SSDev.peek()`. Without `?dev=1` none of this exists.

## Reset progress
Settings → Reset all progress (confirms first), or clear site data for the page.

## Known limitations
- Characters are procedurally drawn on canvas, not hand-painted sprite sheets.
- Audio is synthesized with WebAudio (no files); music is a simple ambient loop.
- No key rebinding. Controls are fixed and documented in-game.
- Some browsers block LocalStorage on `file://`; the game still plays but warns that progress won't persist.
- Offline note: the downloaded folder works offline; the hosted site has no service worker, so it needs a connection to load the first time.
- Direct-file launch, real mobile devices and real browsers have not been tested by the author of this build (see the testing report in the chat).

## Licensing
All code, graphics and audio are original and generated at runtime. No third-party libraries or assets.
