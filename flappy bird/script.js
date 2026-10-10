(() => {
  'use strict';

  const WIDTH = 288;
  const HEIGHT = 512;
  const GROUND_HEIGHT = 56;
  const GROUND_Y = HEIGHT - GROUND_HEIGHT;
  const GROUND_PERIOD = 24;

  const GRAVITY = 1300;
  const FLAP_VELOCITY = -370;
  const MAX_FALL_SPEED = 560;

  const PIPE_SPEED = 130;
  const PIPE_GAP = 112;
  const PIPE_SPAWN_INTERVAL = 1.45;
  const PIPE_WIDTH = 52;
  const PIPE_CAP_HEIGHT = 24;
  const PIPE_CAP_OVERHANG = 2;
  const PIPE_EDGE_MARGIN = 60;
  const PIPE_MAX_GAP_SHIFT = 120;
  const FIRST_PIPE_DELAY = 0.6;

  const SPRITE_SCALE = 2;
  const BIRD_SIZE = 17 * SPRITE_SCALE;
  const BIRD_RADIUS = 10;
  const BIRD_X = 84;
  const READY_BIRD_Y = 250;
  const ROTATION_UP = -0.45;
  const ROTATION_DOWN = 1.4;
  const WING_FPS = 12;

  const FIXED_STEP = 1 / 120;
  const MAX_FRAME_TIME = 0.1;
  const GAME_OVER_LOCK = 0.35;
  const PARTICLE_POOL = 48;
  const CLOUD_COUNT = 5;

  const STORAGE_BEST = 'flappy-classic.best';
  const STORAGE_SOUND = 'flappy-classic.sound';

  const STATE = Object.freeze({ READY: 'READY', PLAYING: 'PLAYING', GAME_OVER: 'GAME_OVER' });
  const KEY_ACTIONS = Object.freeze({
    Space: 'flap',
    ArrowUp: 'flap',
    Enter: 'confirm',
    NumpadEnter: 'confirm',
    Escape: 'pause',
    KeyP: 'pause',
  });

  const FONT = '"Arial Black", Impact, "Trebuchet MS", "Helvetica Neue", Arial, sans-serif';
  const COLORS = Object.freeze({
    sky: '#4ec0ca',
    ink: '#3c2a2f',
    white: '#ffffff',
    title: '#fcb040',
    hillBack: '#7fd3b4',
    hillFront: '#5cbd62',
    cloud: '#ffffff',
    cloudShade: '#cdeeed',
    pipeOutline: '#3c2a2f',
    pipeMain: '#74bf2e',
    pipeLight: '#a5e84a',
    pipeShine: '#d8f7a0',
    pipeDark: '#4c8a1c',
    grassLight: '#9ce659',
    grassMain: '#73bf2e',
    grassDark: '#558022',
    soil: '#ded895',
    soilDark: '#cbbf6a',
  });

  const BIRD_ROWS = [
    '....kkkkkk.......',
    '..kkyyyyykwwwwk..',
    '.kyyyyyyykwwwwwk.',
    'kyyyyyyyykwwwkwk.',
    'kyyyyyyyykwwwwwk.',
    'kyyyyyyyyyykkkkk.',
    'kyyyyyyyykoooook.',
    'kgggggggggkrrrrrk',
    '.kggggggggkkkkkk.',
    '..kggggggggk.....',
    '...kkggggkk......',
    '.....kkkk........',
  ];
  const BIRD_PALETTE = Object.freeze({
    k: '#3c2a2f',
    y: '#f8d630',
    g: '#e39b1b',
    w: '#ffffff',
    o: '#f26b1d',
    r: '#d9341c',
    c: '#fdf0c0',
  });
  const WING_ROWS = ['.kkkk.', 'kcccck', '.kkkk.'];
  const WING_OFFSET_X = 2;
  const WING_OFFSETS_Y = [3, 5, 6];
  const WING_SEQUENCE = [0, 1, 2, 1];

  const canvas = document.getElementById('game');
  const frameEl = document.getElementById('game-frame');
  const gameOverEl = document.getElementById('gameover');
  const finalScoreEl = document.getElementById('final-score');
  const finalBestEl = document.getElementById('final-best');
  const newBestEl = document.getElementById('new-best');
  const restartBtn = document.getElementById('restart-btn');
  const soundBtn = document.getElementById('sound-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const bestDisplayEl = document.getElementById('best-display');
  const statusEl = document.getElementById('status');
  const ctx = canvas.getContext('2d', { alpha: false });

  const seedParam = new URLSearchParams(window.location.search).get('seed');
  const seedValue = seedParam === null || seedParam === '' ? NaN : Number(seedParam);
  const random = Number.isFinite(seedValue) ? createSeededRandom(seedValue) : Math.random;

  const view = { scale: 1 };
  const bird = { x: BIRD_X, y: READY_BIRD_Y, vy: 0, rot: 0, landed: false };
  const game = {
    state: STATE.READY,
    paused: false,
    time: 0,
    score: 0,
    best: 0,
    newBest: false,
    pipes: [],
    pipeTimer: 0,
    lastGapTop: 0,
    groundOffset: 0,
    hillBack: 0,
    hillFront: 0,
    overAt: 0,
    panelShown: false,
    scoreBump: 0,
    flash: 0,
  };
  const audio = {
    ctx: null,
    enabled: true,
    supported: Boolean(window.AudioContext || window.webkitAudioContext),
  };
  const particles = Array.from({ length: PARTICLE_POOL }, () => ({
    active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, size: 2, color: '#fff',
  }));
  const clouds = [];
  const sprites = { birdFrames: [], cloudVariants: [], hillBack: null, hillFront: null, ground: null };

  let rafId = null;
  let lastTime = 0;
  let accumulator = 0;
  let clockReset = true;

  function createSeededRandom(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      return;
    }
  }

  function loadBestScore() {
    const parsed = Number.parseInt(readStorage(STORAGE_BEST), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  function loadSoundPreference() {
    return readStorage(STORAGE_SOUND) !== 'off';
  }

  function announce(message) {
    statusEl.textContent = message;
  }

  function createCanvas(width, height) {
    const el = document.createElement('canvas');
    el.width = width;
    el.height = height;
    const c = el.getContext('2d');
    c.imageSmoothingEnabled = false;
    return { el, c };
  }

  function paintGrid(c, rows, x0, y0, scale, palette, skipChar) {
    for (let row = 0; row < rows.length; row += 1) {
      const line = rows[row];
      for (let col = 0; col < line.length; col += 1) {
        const key = line[col];
        if (key === skipChar || !palette[key]) continue;
        c.fillStyle = palette[key];
        c.fillRect((x0 + col) * scale, (y0 + row) * scale, scale, scale);
      }
    }
  }

  function pixelCircle(c, cx, cy, radius, color) {
    c.fillStyle = color;
    for (let dy = -radius; dy <= radius; dy += 1) {
      const half = Math.floor(Math.sqrt(radius * radius - dy * dy));
      c.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
    }
  }

  function buildBirdFrames() {
    for (let frame = 0; frame < WING_OFFSETS_Y.length; frame += 1) {
      const { el, c } = createCanvas(BIRD_SIZE, 12 * SPRITE_SCALE);
      paintGrid(c, BIRD_ROWS, 0, 0, SPRITE_SCALE, BIRD_PALETTE, '.');
      paintGrid(c, WING_ROWS, WING_OFFSET_X, WING_OFFSETS_Y[frame], SPRITE_SCALE, BIRD_PALETTE, '.');
      sprites.birdFrames.push(el);
    }
  }

  function buildCloud(width, height, baseY, circles) {
    const { el, c } = createCanvas(width, height);
    circles.forEach(([cx, cy, r]) => pixelCircle(c, cx, cy + 3, r, COLORS.cloudShade));
    circles.forEach(([cx, cy, r]) => pixelCircle(c, cx, cy, r, COLORS.cloud));
    c.clearRect(0, baseY, width, height - baseY);
    return { el, width, height };
  }

  function buildCloudVariants() {
    sprites.cloudVariants.push(
      buildCloud(64, 34, 30, [[14, 22, 10], [30, 15, 14], [48, 21, 11]]),
      buildCloud(88, 38, 34, [[16, 26, 10], [34, 18, 15], [56, 14, 13], [72, 24, 11]]),
      buildCloud(48, 28, 25, [[12, 18, 8], [26, 12, 11], [38, 18, 8]]),
    );
  }

  function buildHillLayer(color, hills) {
    const height = 80;
    const { el, c } = createCanvas(WIDTH, height);
    hills.forEach(([cx, radius, peak]) => {
      const cy = height - peak + radius;
      pixelCircle(c, cx, cy, radius, color);
      pixelCircle(c, cx - WIDTH, cy, radius, color);
      pixelCircle(c, cx + WIDTH, cy, radius, color);
    });
    c.fillStyle = color;
    c.fillRect(0, height - 12, WIDTH, 12);
    return el;
  }

  function buildGroundStrip() {
    const width = WIDTH + GROUND_PERIOD;
    const { el, c } = createCanvas(width, GROUND_HEIGHT);
    c.fillStyle = COLORS.ink;
    c.fillRect(0, 0, width, 2);
    c.fillStyle = COLORS.grassMain;
    c.fillRect(0, 2, width, 8);
    c.fillStyle = COLORS.grassLight;
    for (let x = -GROUND_PERIOD; x < width; x += GROUND_PERIOD) {
      for (let row = 0; row < 8; row += 1) {
        c.fillRect(x + (7 - row), 2 + row, 12, 1);
      }
    }
    c.fillStyle = COLORS.grassDark;
    c.fillRect(0, 10, width, 2);
    c.fillStyle = COLORS.soil;
    c.fillRect(0, 12, width, GROUND_HEIGHT - 12);
    c.fillStyle = COLORS.soilDark;
    for (let x = -GROUND_PERIOD; x < width; x += GROUND_PERIOD) {
      c.fillRect(x + 4, 22, 8, 2);
      c.fillRect(x + 16, 34, 8, 2);
      c.fillRect(x + 10, 46, 8, 2);
    }
    return el;
  }

  function buildSprites() {
    buildBirdFrames();
    buildCloudVariants();
    sprites.hillBack = buildHillLayer(COLORS.hillBack, [[20, 28, 56], [84, 40, 70], [160, 30, 52], [222, 38, 66]]);
    sprites.hillFront = buildHillLayer(COLORS.hillFront, [[40, 14, 24], [110, 18, 30], [190, 12, 20], [250, 16, 28]]);
    sprites.ground = buildGroundStrip();
  }

  function seedClouds() {
    clouds.length = 0;
    for (let i = 0; i < CLOUD_COUNT; i += 1) {
      clouds.push({
        x: Math.random() * WIDTH,
        y: 30 + Math.random() * 190,
        speed: 5 + Math.random() * 11,
        variant: Math.floor(Math.random() * sprites.cloudVariants.length),
      });
    }
  }

  function unlockAudio() {
    if (!audio.enabled || !audio.supported) return;
    try {
      if (!audio.ctx) {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        audio.ctx = new AudioCtor();
      }
      if (audio.ctx.state === 'suspended') {
        audio.ctx.resume().catch(() => {});
      }
    } catch {
      audio.supported = false;
      audio.ctx = null;
    }
  }

  function playTone({ from, to = from, duration, type = 'square', volume = 0.08, delay = 0 }) {
    if (!audio.enabled || !audio.ctx || audio.ctx.state === 'closed') return;
    try {
      const ac = audio.ctx;
      const start = ac.currentTime + delay;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, start);
      osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    } catch {
      return;
    }
  }

  const sfx = {
    flap: () => playTone({ from: 420, to: 700, duration: 0.09, type: 'square', volume: 0.05 }),
    score: () => {
      playTone({ from: 880, duration: 0.08, type: 'triangle', volume: 0.09 });
      playTone({ from: 1320, duration: 0.14, type: 'triangle', volume: 0.09, delay: 0.08 });
    },
    hit: () => playTone({ from: 180, to: 60, duration: 0.16, type: 'sawtooth', volume: 0.1 }),
    die: () => playTone({ from: 330, to: 90, duration: 0.5, type: 'triangle', volume: 0.09, delay: 0.18 }),
  };

  function emitParticles(x, y, count, colors, speed) {
    let spawned = 0;
    for (let i = 0; i < particles.length && spawned < count; i += 1) {
      const p = particles[i];
      if (p.active) continue;
      const angle = Math.random() * Math.PI * 2;
      const magnitude = speed * (0.4 + Math.random() * 0.6);
      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * magnitude;
      p.vy = Math.sin(angle) * magnitude - speed * 0.3;
      p.maxLife = 0.35 + Math.random() * 0.35;
      p.life = p.maxLife;
      p.size = Math.random() < 0.5 ? 2 : 3;
      p.color = colors[Math.floor(Math.random() * colors.length)];
      spawned += 1;
    }
  }

  function clearParticles() {
    for (let i = 0; i < particles.length; i += 1) particles[i].active = false;
  }

  function updateParticles(dt) {
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      if (!p.active) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }
      p.vy += 500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  function resetGame() {
    game.state = STATE.READY;
    game.paused = false;
    game.score = 0;
    game.newBest = false;
    game.pipes.length = 0;
    game.pipeTimer = FIRST_PIPE_DELAY;
    game.lastGapTop = Math.round((PIPE_EDGE_MARGIN + GROUND_Y - PIPE_EDGE_MARGIN - PIPE_GAP) / 2);
    game.panelShown = false;
    game.scoreBump = 0;
    game.flash = 0;
    bird.x = BIRD_X;
    bird.y = READY_BIRD_Y;
    bird.vy = 0;
    bird.rot = 0;
    bird.landed = false;
    clearParticles();
    gameOverEl.hidden = true;
    refreshControls();
  }

  function startGame() {
    game.state = STATE.PLAYING;
    game.pipeTimer = FIRST_PIPE_DELAY;
    bird.vy = 0;
    refreshControls();
  }

  function flap() {
    bird.vy = FLAP_VELOCITY;
    sfx.flap();
  }

  function addScore() {
    game.score += 1;
    game.scoreBump = 0.18;
    sfx.score();
    emitParticles(bird.x, bird.y, 6, ['#ffffff', '#fcd23c', '#fff6c8'], 90);
  }

  function endGame(cause) {
    if (game.state !== STATE.PLAYING) return;
    game.state = STATE.GAME_OVER;
    game.overAt = game.time;
    game.flash = 0.25;
    bird.vy = 0;
    bird.landed = cause === 'ground';
    if (bird.landed) bird.y = GROUND_Y - BIRD_RADIUS;
    sfx.hit();
    sfx.die();
    emitParticles(bird.x, bird.y, 16, ['#f8d630', '#ffffff', '#f26b1d'], 160);
    if (game.score > game.best) {
      game.best = game.score;
      game.newBest = true;
      writeStorage(STORAGE_BEST, game.best);
      bestDisplayEl.textContent = String(game.best);
    }
    refreshControls();
  }

  function showGameOverPanel() {
    game.panelShown = true;
    finalScoreEl.textContent = String(game.score);
    finalBestEl.textContent = String(game.best);
    newBestEl.hidden = !game.newBest;
    gameOverEl.hidden = false;
    announce(`Game over. Score ${game.score}. Best ${game.best}.${game.newBest ? ' New best!' : ''}`);
  }

  function pauseGame() {
    if (game.state !== STATE.PLAYING || game.paused) return;
    game.paused = true;
    announce('Paused');
    refreshControls();
  }

  function resumeGame() {
    if (!game.paused) return;
    game.paused = false;
    clockReset = true;
    accumulator = 0;
    announce('Resumed');
    refreshControls();
  }

  function togglePause() {
    if (game.paused) resumeGame();
    else pauseGame();
  }

  function refreshControls() {
    pauseBtn.disabled = game.state !== STATE.PLAYING;
    pauseBtn.textContent = game.paused ? 'RESUME' : 'PAUSE';
    pauseBtn.setAttribute('aria-pressed', String(game.paused));
    soundBtn.textContent = audio.enabled ? 'SOUND: ON' : 'SOUND: OFF';
    soundBtn.setAttribute('aria-pressed', String(audio.enabled));
  }

  function spawnPipe(travelled) {
    const minTop = Math.max(PIPE_EDGE_MARGIN, game.lastGapTop - PIPE_MAX_GAP_SHIFT);
    const maxTop = Math.min(GROUND_Y - PIPE_EDGE_MARGIN - PIPE_GAP, game.lastGapTop + PIPE_MAX_GAP_SHIFT);
    const gapTop = Math.round(minTop + random() * (maxTop - minTop));
    game.lastGapTop = gapTop;
    game.pipes.push({ x: WIDTH + 8 - travelled, gapTop, scored: false });
  }

  function circleHitsRect(cx, cy, radius, rx, ry, rw, rh) {
    const nearestX = clamp(cx, rx, rx + rw);
    const nearestY = clamp(cy, ry, ry + rh);
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy < radius * radius;
  }

  // Pipes move at most PIPE_SPEED * FIXED_STEP (~1px) per step, far less than the
  // bird's radius, so a circle-vs-rectangle test can never tunnel through a pipe.
  function birdHitsPipe(pipe) {
    const capX = pipe.x - PIPE_CAP_OVERHANG;
    const capW = PIPE_WIDTH + PIPE_CAP_OVERHANG * 2;
    if (bird.x + BIRD_RADIUS < capX || bird.x - BIRD_RADIUS > capX + capW) return false;
    const gapBottom = pipe.gapTop + PIPE_GAP;
    const topBodyH = pipe.gapTop - PIPE_CAP_HEIGHT;
    const bottomBodyY = gapBottom + PIPE_CAP_HEIGHT;
    return (
      circleHitsRect(bird.x, bird.y, BIRD_RADIUS, pipe.x, 0, PIPE_WIDTH, topBodyH) ||
      circleHitsRect(bird.x, bird.y, BIRD_RADIUS, capX, topBodyH, capW, PIPE_CAP_HEIGHT) ||
      circleHitsRect(bird.x, bird.y, BIRD_RADIUS, capX, gapBottom, capW, PIPE_CAP_HEIGHT) ||
      circleHitsRect(bird.x, bird.y, BIRD_RADIUS, pipe.x, bottomBodyY, PIPE_WIDTH, GROUND_Y - bottomBodyY)
    );
  }

  function updateBirdRotation(dt) {
    const target = clamp(bird.vy * 0.0025, ROTATION_UP, ROTATION_DOWN);
    bird.rot += (target - bird.rot) * (1 - Math.exp(-dt * 20));
  }

  function updateBird(dt) {
    // Semi-implicit Euler: update velocity first, then position with the new velocity.
    bird.vy = Math.min(bird.vy + GRAVITY * dt, MAX_FALL_SPEED);
    bird.y += bird.vy * dt;
    if (bird.y - BIRD_RADIUS < 0) {
      bird.y = BIRD_RADIUS;
      if (bird.vy < 0) bird.vy = 0;
    }
    updateBirdRotation(dt);
    if (bird.y + BIRD_RADIUS >= GROUND_Y) {
      bird.y = GROUND_Y - BIRD_RADIUS;
      endGame('ground');
    }
  }

  function updateDeadBird(dt) {
    if (!bird.landed) {
      bird.vy = Math.min(bird.vy + GRAVITY * dt, MAX_FALL_SPEED);
      bird.y += bird.vy * dt;
      if (bird.y + BIRD_RADIUS >= GROUND_Y) {
        bird.y = GROUND_Y - BIRD_RADIUS;
        bird.vy = 0;
        bird.landed = true;
      }
    }
    updateBirdRotation(dt);
  }

  function updatePipes(dt) {
    for (let i = game.pipes.length - 1; i >= 0; i -= 1) {
      const pipe = game.pipes[i];
      pipe.x -= PIPE_SPEED * dt;
      if (pipe.x + PIPE_WIDTH + PIPE_CAP_OVERHANG < 0) game.pipes.splice(i, 1);
    }
    game.pipeTimer -= dt;
    if (game.pipeTimer <= 0) {
      spawnPipe(-game.pipeTimer * PIPE_SPEED);
      game.pipeTimer += PIPE_SPAWN_INTERVAL;
    }
  }

  function resolvePipes() {
    for (let i = 0; i < game.pipes.length; i += 1) {
      const pipe = game.pipes[i];
      if (birdHitsPipe(pipe)) {
        endGame('pipe');
        return;
      }
      if (!pipe.scored && pipe.x + PIPE_WIDTH / 2 < bird.x) {
        pipe.scored = true;
        addScore();
      }
    }
  }

  function scrollWorld(dt) {
    game.groundOffset = (game.groundOffset + PIPE_SPEED * dt) % GROUND_PERIOD;
    game.hillBack = (game.hillBack + 18 * dt) % WIDTH;
    game.hillFront = (game.hillFront + 45 * dt) % WIDTH;
  }

  function updateClouds(dt) {
    for (let i = 0; i < clouds.length; i += 1) {
      const cloud = clouds[i];
      cloud.x += cloud.speed * dt;
      const width = sprites.cloudVariants[cloud.variant].width;
      if (cloud.x > WIDTH) {
        cloud.x = -width;
        cloud.y = 30 + Math.random() * 190;
      }
    }
  }

  function update(dt) {
    game.time += dt;
    updateClouds(dt);
    updateParticles(dt);
    if (game.scoreBump > 0) game.scoreBump = Math.max(0, game.scoreBump - dt);
    if (game.flash > 0) game.flash = Math.max(0, game.flash - dt);

    if (game.state === STATE.READY) {
      scrollWorld(dt);
      bird.y = READY_BIRD_Y + Math.sin(game.time * 5) * 5;
      bird.vy = 0;
      updateBirdRotation(dt);
    } else if (game.state === STATE.PLAYING) {
      scrollWorld(dt);
      updateBird(dt);
      if (game.state !== STATE.PLAYING) return;
      updatePipes(dt);
      resolvePipes();
    } else {
      updateDeadBird(dt);
      if (!game.panelShown && game.time - game.overAt >= GAME_OVER_LOCK) showGameOverPanel();
    }
  }

  function outlinedText(text, x, y, size, fill, strokeColor, strokeWidth, maxWidth) {
    ctx.font = `900 ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
    ctx.strokeText(text, x, y, maxWidth);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y, maxWidth);
  }

  function drawSky() {
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function drawScrollingLayer(tile, offset, y) {
    const x = -Math.floor(offset);
    ctx.drawImage(tile, x, y);
    ctx.drawImage(tile, x + WIDTH, y);
  }

  function drawBackground() {
    drawSky();
    for (let i = 0; i < clouds.length; i += 1) {
      const cloud = clouds[i];
      ctx.drawImage(sprites.cloudVariants[cloud.variant].el, Math.round(cloud.x), Math.round(cloud.y));
    }
    drawScrollingLayer(sprites.hillBack, game.hillBack, GROUND_Y - 80);
    drawScrollingLayer(sprites.hillFront, game.hillFront, GROUND_Y - 80);
  }

  function drawPipeBody(x, y, height) {
    if (height <= 0) return;
    ctx.fillStyle = COLORS.pipeOutline;
    ctx.fillRect(x, y, PIPE_WIDTH, height);
    ctx.fillStyle = COLORS.pipeMain;
    ctx.fillRect(x + 2, y, PIPE_WIDTH - 4, height);
    ctx.fillStyle = COLORS.pipeLight;
    ctx.fillRect(x + 4, y, 6, height);
    ctx.fillStyle = COLORS.pipeShine;
    ctx.fillRect(x + 6, y, 2, height);
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(x + PIPE_WIDTH - 12, y, 8, height);
  }

  function drawPipeCap(x, y) {
    const capX = x - PIPE_CAP_OVERHANG;
    const capW = PIPE_WIDTH + PIPE_CAP_OVERHANG * 2;
    ctx.fillStyle = COLORS.pipeOutline;
    ctx.fillRect(capX, y, capW, PIPE_CAP_HEIGHT);
    ctx.fillStyle = COLORS.pipeMain;
    ctx.fillRect(capX + 2, y + 2, capW - 4, PIPE_CAP_HEIGHT - 4);
    ctx.fillStyle = COLORS.pipeLight;
    ctx.fillRect(capX + 4, y + 2, 7, PIPE_CAP_HEIGHT - 4);
    ctx.fillStyle = COLORS.pipeShine;
    ctx.fillRect(capX + 7, y + 4, 2, PIPE_CAP_HEIGHT - 8);
    ctx.fillStyle = COLORS.pipeDark;
    ctx.fillRect(capX + capW - 13, y + 2, 9, PIPE_CAP_HEIGHT - 4);
  }

  function drawPipes() {
    for (let i = 0; i < game.pipes.length; i += 1) {
      const pipe = game.pipes[i];
      const x = Math.round(pipe.x);
      const gapBottom = pipe.gapTop + PIPE_GAP;
      drawPipeBody(x, 0, pipe.gapTop - PIPE_CAP_HEIGHT);
      drawPipeCap(x, pipe.gapTop - PIPE_CAP_HEIGHT);
      drawPipeBody(x, gapBottom + PIPE_CAP_HEIGHT, GROUND_Y - gapBottom - PIPE_CAP_HEIGHT);
      drawPipeCap(x, gapBottom);
    }
  }

  function drawGround() {
    ctx.drawImage(sprites.ground, -Math.floor(game.groundOffset), GROUND_Y);
  }

  function drawBird() {
    let frameIndex = 1;
    if (game.state !== STATE.GAME_OVER) {
      frameIndex = WING_SEQUENCE[Math.floor(game.time * WING_FPS) % WING_SEQUENCE.length];
    }
    const sprite = sprites.birdFrames[frameIndex];
    ctx.save();
    ctx.translate(Math.round(bird.x), Math.round(bird.y));
    ctx.rotate(bird.rot);
    ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    ctx.restore();
  }

  function drawParticles() {
    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      if (!p.active) continue;
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawScore() {
    const scale = 1 + game.scoreBump * 1.6;
    ctx.save();
    ctx.translate(WIDTH / 2, 70);
    ctx.scale(scale, scale);
    outlinedText(String(game.score), 0, 0, 48, COLORS.white, COLORS.ink, 8);
    ctx.restore();
  }

  function drawReadyScreen() {
    outlinedText('FLAPPY', WIDTH / 2, 112, 46, COLORS.title, COLORS.ink, 9, WIDTH - 24);
    outlinedText('BIRD', WIDTH / 2, 160, 46, COLORS.title, COLORS.ink, 9, WIDTH - 24);
    outlinedText('CLASSIC EDITION', WIDTH / 2, 196, 13, COLORS.white, COLORS.ink, 4, WIDTH - 24);
    if (Math.floor(game.time * 2) % 2 === 0) {
      outlinedText('PRESS SPACE TO START', WIDTH / 2, 336, 16, COLORS.white, COLORS.ink, 5, WIDTH - 20);
    }
    outlinedText('OR TAP THE SCREEN', WIDTH / 2, 362, 11, COLORS.white, COLORS.ink, 4, WIDTH - 20);
    outlinedText('AVOID THE PIPES!', WIDTH / 2, 392, 14, COLORS.title, COLORS.ink, 5, WIDTH - 20);
  }

  function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    outlinedText('PAUSED', WIDTH / 2, HEIGHT / 2 - 10, 42, COLORS.white, COLORS.ink, 8, WIDTH - 24);
    outlinedText('PRESS P TO RESUME', WIDTH / 2, HEIGHT / 2 + 30, 13, COLORS.white, COLORS.ink, 4, WIDTH - 24);
  }

  function render() {
    ctx.setTransform(view.scale, 0, 0, view.scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawBackground();
    drawPipes();
    drawGround();
    drawBird();
    drawParticles();
    if (game.state === STATE.READY) drawReadyScreen();
    else drawScore();
    if (game.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${(game.flash / 0.25) * 0.7})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (game.paused) drawPauseOverlay();
  }

  function frame(now) {
    rafId = window.requestAnimationFrame(frame);
    if (clockReset) {
      lastTime = now;
      clockReset = false;
    }
    const dt = Math.min((now - lastTime) / 1000, MAX_FRAME_TIME);
    lastTime = now;
    if (!game.paused) {
      accumulator += dt;
      while (accumulator >= FIXED_STEP) {
        update(FIXED_STEP);
        accumulator -= FIXED_STEP;
      }
    }
    render();
  }

  function startLoop() {
    if (rafId !== null) return;
    clockReset = true;
    rafId = window.requestAnimationFrame(frame);
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1) return;
    const dpr = window.devicePixelRatio || 1;
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    const pixelHeight = Math.max(1, Math.round((pixelWidth * HEIGHT) / WIDTH));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    view.scale = canvas.width / WIDTH;
    frameEl.style.setProperty('--u', `${rect.width / WIDTH}px`);
  }

  function triggerAction(action) {
    if (action === 'pause') {
      togglePause();
      return;
    }
    if (game.paused) {
      resumeGame();
      return;
    }
    if (game.state === STATE.READY) {
      startGame();
      flap();
    } else if (game.state === STATE.PLAYING) {
      if (action === 'flap') flap();
    } else if (game.panelShown) {
      resetGame();
    }
  }

  function onKeyDown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const action = KEY_ACTIONS[event.code];
    if (!action) return;
    const nativeButtonKey = event.code === 'Space' || event.code === 'Enter' || event.code === 'NumpadEnter';
    if (event.target instanceof HTMLButtonElement && nativeButtonKey) return;
    event.preventDefault();
    if (event.repeat) return;
    unlockAudio();
    triggerAction(action);
  }

  function onCanvasPointerDown(event) {
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    unlockAudio();
    triggerAction('flap');
  }

  function onRestartClick() {
    if (game.state === STATE.GAME_OVER && game.panelShown) resetGame();
    canvas.focus({ preventScroll: true });
  }

  function onSoundClick() {
    audio.enabled = !audio.enabled;
    writeStorage(STORAGE_SOUND, audio.enabled ? 'on' : 'off');
    if (audio.enabled) unlockAudio();
    refreshControls();
    canvas.focus({ preventScroll: true });
  }

  function onPauseClick() {
    togglePause();
    canvas.focus({ preventScroll: true });
  }

  function bindEvents() {
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('pointerdown', onCanvasPointerDown);
    restartBtn.addEventListener('click', onRestartClick);
    soundBtn.addEventListener('click', onSoundClick);
    pauseBtn.addEventListener('click', onPauseClick);
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('blur', pauseGame);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseGame();
      else clockReset = true;
    });
    if (typeof ResizeObserver === 'function') new ResizeObserver(resizeCanvas).observe(canvas);
  }

  function init() {
    game.best = loadBestScore();
    audio.enabled = loadSoundPreference();
    bestDisplayEl.textContent = String(game.best);
    buildSprites();
    seedClouds();
    bindEvents();
    resizeCanvas();
    resetGame();
    startLoop();
  }

  init();
})();
