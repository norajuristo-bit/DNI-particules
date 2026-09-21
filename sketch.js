const STEP = 5;                // densitat de la graella de punts (més petit = més detall)
const RADIUS = 80;             // radi d'influència del ratolí
const FORCE = 3;               // força de repulsió
const EASE = 0.08;             // velocitat de retorn a la posició original
const BRIGHTNESS_CUTOFF = 355; // llindar per descartar el fons clar

// 🆕 Ara el canvas s'adapta a la mida de la finestra
let canvasW, canvasH;

let img;
let particles = [];
let gfx;

function preload() {
  img = loadImage('fotoDNIpng.png');
}

function setup() {
  // 🆕 Calcula la mida basant-se en la finestra
  calculateCanvasSize();
  createCanvas(canvasW, canvasH);
  pixelDensity(1);

  gfx = createGraphics(canvasW, canvasH);
  drawImageCover(gfx, img, canvasW, canvasH);
  buildParticlesFromGraphics();
}

// 🆕 Funció per calcular la mida del canvas de forma responsiva
function calculateCanvasSize() {
  const MAX_WIDTH = 500;   // ample màxim
  const MAX_HEIGHT = 600;  // alt màxim
  
  canvasW = min(windowWidth, MAX_WIDTH);
  canvasH = min(windowHeight, MAX_HEIGHT);
}

// 🆕 Funció que s'executa quan canvia la mida de la finestra
function windowResized() {
  calculateCanvasSize();
  resizeCanvas(canvasW, canvasH);
  
  // Recrear el gràfic i les partícules amb la nova mida
  gfx = createGraphics(canvasW, canvasH);
  drawImageCover(gfx, img, canvasW, canvasH);
  buildParticlesFromGraphics();
}

function drawImageCover(g, image, w, h) {
  const imgRatio = image.width / image.height;
  const canvasRatio = w / h;
  let dw, dh, dx, dy;
  if (imgRatio > canvasRatio) {
    dh = h;
    dw = h * imgRatio;
    dx = (w - dw) / 2;
    dy = 0;
  } else {
    dw = w;
    dh = w / imgRatio;
    dx = 0;
    dy = (h - dh) / 2;
  }
  g.image(image, dx, dy, dw, dh);
}

function buildParticlesFromGraphics() {
  particles = [];
  gfx.loadPixels();

  // 🆕 Usa canvasW i canvasH en lloc de constants
  for (let y = 0; y < canvasH; y += STEP) {
    for (let x = 0; x < canvasW; x += STEP) {
      const i = 4 * (y * canvasW + x);
      const r = gfx.pixels[i];
      const gg = gfx.pixels[i+1];
      const b = gfx.pixels[i+2];
      const a = gfx.pixels[i+3];
      if (a < 10) continue;
      const bright = (r + gg + b) / 3;
      if (bright > BRIGHTNESS_CUTOFF) continue;

      const sizeVal = map(bright, 0, BRIGHTNESS_CUTOFF, STEP * 1.3, STEP * 0.4, true);
      particles.push(new Particle(x, y, sizeVal, color(r, gg, b)));
    }
  }
}

class Particle {
  constructor(x, y, size, col) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = size;
    this.col = col;
  }

  update(mx, my) {
    const dx = this.x - mx;
    const dy = this.y - my;
    const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;

    if (dist < RADIUS) {
      const strength = (1 - dist / RADIUS) * FORCE;
      this.vx += (dx / dist) * strength;
      this.vy += (dy / dist) * strength;
    }

    this.vx += (this.homeX - this.x) * EASE;
    this.vy += (this.homeY - this.y) * EASE;

    this.vx *= 0.82;
    this.vy *= 0.82;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    noStroke();
    fill(this.col);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function draw() {
  clear();
  for (const p of particles) {
    p.update(mouseX, mouseY);
    p.draw();
  }
}