# PIXEL VAULT // ARCADE SYSTEM

A static, dependency-free arcade launcher for browser games. Each game lives in its own folder and opens as its own page. The launcher is plain HTML, CSS and JavaScript, so it runs on GitHub Pages with no build step.

## Current games

| Game | Folder | Genre |
| --- | --- | --- |
| FLAPPY BIRD | `flappy bird/` | Arcade / Endless |
| HELLBREACH | `hellbreach/` | First-Person Shooter |

## Files

```text
games/
├── index.html      launcher page
├── style.css       launcher styles (never loaded by games)
├── script.js       GAMES config array + launcher logic
├── README.md
├── assets/
│   ├── covers/     optional cover images
│   └── icons/      favicon
├── flappy bird/    game (untouched)
└── hellbreach/     game (untouched)
```

## Run locally

Opening `index.html` directly with `file://` works for the launcher. To test it the way GitHub Pages serves it, use a local server from the `games` folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Publish with GitHub Pages

1. Push the repository to GitHub.
2. Repository **Settings → Pages**.
3. Source: **Deploy from a branch**, pick your branch and the folder that contains `index.html` (`/ (root)`).
4. Wait for the deployment, then open `https://USERNAME.github.io/REPO/`.

All links are relative to the launcher page, so no username, repo name or domain is hardcoded and subpath hosting works.

## Add a new game

1. Create a new directory inside `games`, for example `space shooter/`.
2. Put its playable `index.html` and required assets inside it.
3. Add one object to the `GAMES` array in `script.js`:

   ```javascript
   {
     id: "space-shooter",
     title: "SPACE SHOOTER",
     folder: "space shooter",
     entry: "index.html",
     genre: "Space / Shooter",
     description: "Defend the galaxy from incoming enemies.",
     controls: "Keyboard",
     featured: false,
     enabled: true,
     cover: ""
   }
   ```

4. Commit and push.
5. Wait for GitHub Pages to publish.
6. Open the launcher and select the new game.

The launcher cannot list folders on its own (GitHub Pages cannot enumerate directories), so registering the entry in `GAMES` is the supported method.

### Field reference

| Field | Notes |
| --- | --- |
| `id` | Unique slug. Duplicates are skipped and reported in the console. |
| `title` | Required. |
| `folder` | Directory name. Spaces are fine; the launcher URL-encodes them. |
| `entry` | File in that folder. Nested paths like `web/play.html` work. Defaults to `index.html`. |
| `genre` | Parts separated by `/` become genre filter tags. |
| `description`, `controls` | Shown on the card. Rendered with `textContent`, never as HTML. |
| `featured` | `true` makes the game eligible for the Featured panel. The first enabled featured game is used; if none, the first enabled game is shown. |
| `enabled` | `false` hides the game and blocks launching. |
| `cover` | Optional image path. Empty or missing files fall back to a generated placeholder. |

## Set a custom cover

Put an image in `assets/covers/` (16:10 works best, for example 640x400) and set:

```javascript
cover: "assets/covers/flappy-bird.png"
```

If the file is missing, the card shows the CSS placeholder instead of a broken image.

## Feature a game

Set `featured: true` on the game you want spotlighted and `featured: false` on the others. If several are `true`, the first one in the array wins.

## Disable a game

Set `enabled: false`. It disappears from the library, stats and featured panel until re-enabled.

## Optional: return link inside a game

The launcher opens games in the same tab, so the browser Back button returns to the arcade. If you want an in-game link, add this to a game's own menu (the launcher never injects anything into games):

```html
<a href="../">BACK TO ARCADE</a>
```

Use `../index.html` if your host does not serve directory indexes.

## Features

- Search (press `/`), genre filter, sort and clear filters, all driven by the `GAMES` array
- Featured panel, library stats, local launch counter (stored only in your browser)
- CRT, effects and sound toggles, remembered locally; sound is off by default
- Honors `prefers-reduced-motion`
- Keyboard accessible with visible focus states

## Troubleshooting broken links

- **404 when launching:** the `folder` or `entry` value does not match the real name. Names are case-sensitive on GitHub Pages (`Hellbreach` is not `hellbreach`).
- **Works locally, fails on Pages:** check the case and that the game's `index.html` was committed.
- **Folder with a space:** write it normally (`"flappy bird"`); do not pre-encode it as `flappy%20bird`.
- **Game loads but is missing assets:** that is the game's own relative paths. Open the game URL directly and check the browser console.
- **Card missing:** open the browser console and look for `[PIXEL VAULT]` warnings (duplicate id, missing title or folder), and check `enabled`.
- **Cover not showing:** the path is relative to the launcher page; check spelling and case.

## Credits

Launcher only. Games and their assets belong to their respective creators.
