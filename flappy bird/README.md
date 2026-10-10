# Flappy Bird — Classic Edition

A pixel-art, Flappy Bird-style browser game built with **HTML5 Canvas** and **vanilla JavaScript**. No frameworks, no build step, no backend, no external assets. Every sprite is drawn procedurally and every sound effect is synthesized with the Web Audio API.

> Fan-made, independently created game inspired by classic Flappy Bird gameplay. It is not affiliated with, endorsed by, or connected to the original creators or rights holders.

## Features

- Three game states: `READY`, `PLAYING`, `GAME_OVER` (plus pause)
- Fixed-step physics (120 Hz simulation), stable on 60 / 120 / 144 Hz displays
- Pixel-art bird with animated wings and tilt, shaded pipes, drifting clouds, parallax hills, scrolling ground
- Circle-versus-rectangle collision in game-world coordinates (independent of CSS scaling)
- Score, best score saved in `localStorage`, NEW BEST indicator
- Synthesized sound effects with an ON/OFF toggle (preference saved)
- Pause with `P` / `Esc`; auto-pause when the tab is hidden or the window loses focus
- Responsive canvas with devicePixelRatio handling, plus tap support on touch devices
- Works fully offline once loaded

## Technologies

HTML5, CSS3, vanilla JavaScript, Canvas 2D API, Web Audio API, `localStorage`.

## Project structure

```text
flappy-bird/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    └── .gitkeep
```

## Run locally

1. Download or clone the project folder.
2. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).

No server or install is needed.

Optional debugging: add `?seed=123` to the URL (for example `index.html?seed=123`) to make pipe heights repeatable.

## Controls

| Key | Action |
| --- | --- |
| `Space` | Start, flap, or restart |
| `Arrow Up` | Flap |
| `Enter` | Start or restart |
| `P` / `Esc` | Pause / resume |
| Tap / click on game | Same as Space |

Holding a key does not cause repeated flaps. After a crash, the game-over panel appears after a short (0.35 s) delay so a flap that was already in progress cannot restart the game by accident. Restarting returns to the title screen; the next input starts the run and flaps once.

## Scoring and best score

- You get exactly one point each time the bird passes the center of a pipe pair.
- The best score is stored in the browser under the `flappy-classic.best` key, and the sound preference under `flappy-classic.sound`.
- If `localStorage` is blocked or unavailable, the game still works; the best score simply will not persist after a refresh.

## Deploy to GitHub Pages

1. **Create the repository.** On GitHub, click **New repository**, name it (for example `flappy-bird`), keep it **Public**, and create it without a README, `.gitignore`, or license (this project already has a README).
2. **Upload or push the project.**
   - *Web upload:* open the new repository, choose **uploading an existing file**, drag in `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder, then commit.
   - *Command line:*

     ```bash
     cd flappy-bird
     git init
     git add .
     git commit -m "Add Flappy Bird Classic Edition"
     git branch -M main
     git remote add origin https://github.com/USERNAME/flappy-bird.git
     git push -u origin main
     ```

     Replace `USERNAME` with your GitHub username.
3. **Enable GitHub Pages.** Open the repository **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
5. Choose branch **main** and folder **/ (root)**, then click **Save**.
6. **Find your URL.** After a minute or two, the Pages settings show the live address, which follows this pattern:

   ```text
   https://USERNAME.github.io/flappy-bird/
   ```

All asset paths are relative, so the game works at the repository root and under a project URL.

## Troubleshooting

- **404 on the site:** confirm `index.html` is in the repository root (not inside a subfolder) and that Pages is set to `main` / `/ (root)`.
- **Page is blank or unstyled:** file names are case-sensitive on GitHub Pages. Keep them exactly `style.css` and `script.js`.
- **Old version still showing:** wait a minute for the deployment to finish, then hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`).
- **No sound:** browsers only allow audio after a key press or tap. Press Space once, and check that the sound toggle reads `SOUND: ON`.
- **Best score not saved:** the browser may be blocking site storage (private mode or strict privacy settings).
- **Space scrolls the page or does nothing:** click the game once so the page has focus.
- **Deployment status:** check the **Actions** tab for the "pages build and deployment" run.

## License

Add the license of your choice before publishing.
