# MARIO - a classic platformer

A Mario-style side-scrolling platformer in plain HTML, CSS and JavaScript. Three levels, coins, enemies, power-ups, checkpoints, procedural sound, keyboard and Android touch controls. No dependencies, no server, no build step.

## Features
- Sunny Meadow, Crystal Caverns (moving platforms, spikes) and Sky Fortress (floating islands)
- Goombas-style walkers, two-stomp beetles, flying bats
- ? blocks, mushrooms (big form breaks bricks), checkpoints, 50 coins = extra life
- Progress, best times and settings saved in LocalStorage; works without storage

## Controls
- Keyboard: A/D or arrow keys move, W / Up / Space jump (hold for higher), Esc or P pause, R twice restarts
- Touch: left/right arrows and JUMP button, multi-touch supported. Landscape is recommended.

## Files
```
classic-platformer/
  index.html  style.css  game.js  favicon.svg  README.md
  assets/README.md
```

## Run locally
Open `index.html` in a browser. Or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Deploy on GitHub Pages
1. Create a new public repository on github.com (e.g. `classic-platformer`).
2. Upload all files to the repository root (Add file > Upload files) and commit to `main`.
3. Open Settings > Pages. Under Build and deployment choose Deploy from a branch, branch `main`, folder `/ (root)`, then Save.
4. Wait a minute, then open `https://USERNAME.github.io/classic-platformer/`.
5. On Android, open that URL in Chrome and rotate to landscape.

## Saved data
LocalStorage key `mario-platformer-v1` stores unlocked levels, high score, best times and settings. Reset it from Settings > Reset progress.

## Troubleshooting
- 404 page: check Pages is enabled and `index.html` is in the repository root, not a subfolder.
- No sound: tap or press a key once first; browsers block audio until interaction. Check the Sound setting.
- Old version showing: hard refresh (Ctrl+Shift+R).

## Notes
Names and art are drawn in code. "Mario" is a Nintendo trademark; change `TITLE` in game.js and the `<title>` in index.html if you publish this widely.
