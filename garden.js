/**
 * VƯỜN HỒNG THIÊN ĐƯỜNG 20/10 - PROCEDURAL ROSE GARDEN ENGINE
 * Authentic marble terrace background (bg.png)
 * and 15 authentic rose layer cutouts (Layer 1.png .. Layer 15.png).
 */

const ROSE_SPRITE_URLS = [
  { id: 'layer1', src: 'Layer 1.png' },
  { id: 'layer2', src: 'Layer 2.png' },
  { id: 'layer3', src: 'Layer 3.png' },
  { id: 'layer4', src: 'Layer 4.png' },
  { id: 'layer5', src: 'Layer 5.png' },
  { id: 'layer6', src: 'Layer 6.png' },
  { id: 'layer7', src: 'Layer 7.png' },
  { id: 'layer8', src: 'Layer 8.png' },
  { id: 'layer9', src: 'Layer 9.png' },
  { id: 'layer10', src: 'Layer 10.png' },
  { id: 'layer11', src: 'Layer 11.png' },
  { id: 'layer12', src: 'Layer 12.png' },
  { id: 'layer13', src: 'Layer 13.png' },
  { id: 'layer14', src: 'Layer 14.png' },
  { id: 'layer15', src: 'Layer 15.png' }
];

class SpriteLoader {
  constructor() {
    this.sprites = {};
    this.loaded = false;
  }

  loadAll() {
    const promises = ROSE_SPRITE_URLS.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = item.src;
        img.onload = () => {
          this.sprites[item.id] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn('Could not load sprite:', item.src);
          resolve();
        };
      });
    });

    return Promise.all(promises).then(() => {
      this.loaded = true;
    });
  }

  getRandom() {
    const keys = Object.keys(this.sprites);
    if (keys.length === 0) return null;
    const key = keys[Math.floor(Math.random() * keys.length)];
    return this.sprites[key];
  }
}

// Slender organic leaf along the rose stem - branches naturally upwards
class Leaf {
  constructor(t, side, length = 22, angle = 0.35) {
    this.t = t;
    this.side = side;
    this.length = length;
    this.angle = angle;
    this.scale = 0;
    this.targetScale = 0.8 + Math.random() * 0.45;
  }

  update(stemProgress) {
    if (stemProgress >= this.t) {
      this.scale = Math.min(this.targetScale, this.scale + 0.08);
    }
  }

  draw(ctx, px, py, stemAngle) {
    if (this.scale <= 0.05) return;
    ctx.save();
    ctx.translate(px, py);

    // stemAngle is upward along stem (approx -Math.PI / 2).
    // Leaf branches outward and slightly upward toward the light:
    const leafAngle = stemAngle + this.side * (Math.PI * 0.28 + this.angle);
    ctx.rotate(leafAngle);
    ctx.scale(this.scale, this.scale);

    const grad = ctx.createLinearGradient(0, 0, this.length, 0);
    grad.addColorStop(0, '#2d5022');
    grad.addColorStop(1, '#6ea757');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#1e3816';
    ctx.lineWidth = 0.8;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.length * 0.35, -this.length * 0.45, this.length * 0.75, -this.length * 0.25, this.length, 0);
    ctx.bezierCurveTo(this.length * 0.75, this.length * 0.25, this.length * 0.35, this.length * 0.45, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.length * 0.85, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }
}

// Rising Stem & Blooming Rose Head (with Bud phase)
class BloomingRose {
  constructor(x, targetY, options = {}) {
    this.x = x;
    this.targetY = targetY;
    this.baseY = options.baseY || window.innerHeight + 25;

    this.sprite = options.sprite || null;
    this.isHero = options.isHero || false;
    this.size = options.size || (this.isHero ? 190 : (120 + Math.random() * 50));

    // Stem properties
    this.stemWidth = options.stemWidth || (this.isHero ? 4.2 : (2.4 + Math.random() * 1.4));
    this.stemCurveOffset = (Math.random() - 0.5) * 60;
    this.stemProgress = 0;
    this.stemSpeed = options.stemSpeed || (0.035 + Math.random() * 0.018);

    // Blooming state:
    // Starts as an unbloomed bud unless options.autoBloom is true
    this.isBloomed = options.autoBloom || false;
    this.bloomProgress = this.isBloomed ? 1 : 0;
    this.bloomSpeed = options.bloomSpeed || (0.038 + Math.random() * 0.02);
    this.rotationOffset = (Math.random() - 0.5) * 0.22;

    // Leaves along stem
    this.leaves = [];
    const leafCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < leafCount; i++) {
      const t = 0.24 + i * 0.22 + Math.random() * 0.08;
      const side = i % 2 === 0 ? 1 : -1;
      this.leaves.push(new Leaf(t, side, 18 + Math.random() * 12));
    }

    // Swaying physics
    this.swayFreq = 0.7 + Math.random() * 0.7;
    this.swayAmp = this.isHero ? 9 : (12 + Math.random() * 16);
    this.swayPhase = Math.random() * Math.PI * 2;
    this.currentSway = 0;

    this.hasChimed = false;
  }

  startBloom() {
    this.isBloomed = true;
  }

  update(time, windFactor = 1.0) {
    if (this.stemProgress < 1) {
      this.stemProgress = Math.min(1, this.stemProgress + this.stemSpeed);
      for (let leaf of this.leaves) {
        leaf.update(this.stemProgress);
      }
    }

    if (this.isBloomed && this.bloomProgress < 1) {
      this.bloomProgress = Math.min(1, this.bloomProgress + this.bloomSpeed);
      if (this.bloomProgress > 0.4 && !this.hasChimed && window.romanticAudio) {
        this.hasChimed = true;
        window.romanticAudio.playSparkle(0.95 + Math.random() * 0.35);
      }
    }

    this.currentSway = Math.sin(time * this.swayFreq + this.swayPhase) * this.swayAmp * windFactor;
  }

  getStemPoint(t) {
    const startX = this.x;
    const startY = this.baseY;
    const endX = this.x + this.currentSway;
    const endY = this.targetY;

    const ctrlX = this.x + this.stemCurveOffset + this.currentSway * 0.45;
    const ctrlY = startY + (endY - startY) * 0.5;

    const u = 1 - t;
    const px = u * u * startX + 2 * u * t * ctrlX + t * t * endX;
    const py = u * u * startY + 2 * u * t * ctrlY + t * t * endY;

    const dx = 2 * u * (ctrlX - startX) + 2 * t * (endX - ctrlX);
    const dy = 2 * u * (ctrlY - startY) + 2 * t * (endY - ctrlY);

    // Tilt relative to vertical up:
    // Straight up (dx=0, -dy>0) is 0 radians!
    const tilt = Math.atan2(dx, -dy);
    // Stem tangent direction in standard canvas radians (-Math.PI / 2 is straight up)
    const stemAngle = Math.atan2(dy, dx);

    return { x: px, y: py, tilt, stemAngle };
  }

  draw(ctx, time = 0) {
    if (this.stemProgress <= 0) return;

    ctx.save();

    const currentT = this.stemProgress;
    const startPt = this.getStemPoint(0);
    const tipPt = this.getStemPoint(currentT);

    // 1. Draw Stem
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);

    const segments = 24;
    for (let i = 1; i <= segments * currentT; i++) {
      const t = (i / segments);
      const pt = this.getStemPoint(t);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(tipPt.x, tipPt.y);

    const stemGrad = ctx.createLinearGradient(startPt.x, startPt.y, tipPt.x, tipPt.y);
    stemGrad.addColorStop(0, '#26421c');
    stemGrad.addColorStop(0.6, '#416e33');
    stemGrad.addColorStop(1, '#66a251');

    ctx.strokeStyle = stemGrad;
    ctx.lineWidth = this.stemWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 2. Draw Leaves (branching upward along stem)
    for (let leaf of this.leaves) {
      if (this.stemProgress >= leaf.t) {
        const leafPt = this.getStemPoint(leaf.t);
        leaf.draw(ctx, leafPt.x, leafPt.y, leafPt.stemAngle);
      }
    }

    // 3. Draw Rose Head: Bud or Full Bloom
    if (this.stemProgress >= 0.72) {
      const budAppearance = Math.min(1, (this.stemProgress - 0.72) / 0.28);

      ctx.save();
      ctx.translate(tipPt.x, tipPt.y);
      // Tilt of the stem tip + natural variance
      ctx.rotate(tipPt.tilt + this.rotationOffset);

      const s = this.size;

      // CASE A: FULL OR EXPANDING BLOOM
      if (this.bloomProgress > 0 && this.sprite) {
        const easeOutBack = (x) => {
          const c1 = 1.45;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        };

        const bloomScale = easeOutBack(Math.min(1, this.bloomProgress));
        const bloomAlpha = Math.min(1, this.bloomProgress * 1.8);

        ctx.save();
        ctx.scale(bloomScale, bloomScale);
        ctx.globalAlpha = bloomAlpha;

        // Calyx / sepals holding the bottom of the rose head
        ctx.save();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4 + Math.PI / 4;
          const len = s * 0.22;
          ctx.save();
          ctx.rotate(a);
          ctx.fillStyle = '#447334';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(3, len * 0.5, 0, len);
          ctx.quadraticCurveTo(-3, len * 0.5, 0, 0);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Soft sunlit backlight glow
        ctx.shadowColor = 'rgba(255, 235, 240, 0.45)';
        ctx.shadowBlur = 16;

        // DRAW ROSE HEAD: Upright!
        // Top petals face upwards (negative Y in local canvas coords),
        // Bottom base rests right on stem tip (+0.18*s overlaps local 0,0)
        ctx.drawImage(this.sprite, -s / 2, -s * 0.82, s, s);

        ctx.restore();
      }

      // CASE B: UNBLOOMED BUD (or fading out as bloom occurs)
      if (this.bloomProgress < 0.95) {
        const budAlpha = (1 - this.bloomProgress * 1.5) * budAppearance;
        if (budAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, budAlpha));

          const breath = 1.0 + 0.05 * Math.sin(time * 3 + this.swayPhase);
          const bs = (this.isHero ? 42 : (24 + (s - 120) * 0.15)) * breath;

          // 1. Inner glowing rosebud petals
          const budGrad = ctx.createLinearGradient(0, 0, 0, -bs * 1.3);
          budGrad.addColorStop(0, '#be123c');
          budGrad.addColorStop(0.45, '#f43f5e');
          budGrad.addColorStop(0.85, '#fda4af');
          budGrad.addColorStop(1, '#fff1f2');

          ctx.fillStyle = budGrad;
          ctx.shadowColor = 'rgba(244, 63, 94, 0.5)';
          ctx.shadowBlur = 10;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-bs * 0.48, -bs * 0.35, -bs * 0.45, -bs * 1.0, 0, -bs * 1.25);
          ctx.bezierCurveTo(bs * 0.45, -bs * 1.0, bs * 0.48, -bs * 0.35, 0, 0);
          ctx.fill();

          // Bud inner spiral petal line
          ctx.beginPath();
          ctx.moveTo(-bs * 0.15, -bs * 0.55);
          ctx.quadraticCurveTo(0, -bs * 0.95, bs * 0.18, -bs * 0.65);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // 2. Outer Protective Green Sepals (Đài hoa ôm nụ)
          ctx.shadowBlur = 0;
          // Left Sepal
          const sepalGrad = ctx.createLinearGradient(0, 0, -bs * 0.4, -bs);
          sepalGrad.addColorStop(0, '#26421c');
          sepalGrad.addColorStop(1, '#66a251');
          ctx.fillStyle = sepalGrad;

          ctx.beginPath();
          ctx.moveTo(0, bs * 0.05);
          ctx.bezierCurveTo(-bs * 0.58, -bs * 0.3, -bs * 0.48, -bs * 0.9, -bs * 0.06, -bs * 1.28);
          ctx.bezierCurveTo(-bs * 0.3, -bs * 0.75, -bs * 0.2, -bs * 0.35, 0, 0);
          ctx.fill();

          // Right Sepal
          ctx.beginPath();
          ctx.moveTo(0, bs * 0.05);
          ctx.bezierCurveTo(bs * 0.58, -bs * 0.3, bs * 0.48, -bs * 0.9, bs * 0.06, -bs * 1.28);
          ctx.bezierCurveTo(bs * 0.3, -bs * 0.75, bs * 0.2, -bs * 0.35, 0, 0);
          ctx.fill();

          // Base sepal junction
          ctx.beginPath();
          ctx.arc(0, 0, bs * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = '#2f5223';
          ctx.fill();

          ctx.restore();
        }
      }

      ctx.restore();
    }

    ctx.restore();
  }
}

// Floating Rose Petal
class FloatingPetal {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.reset(true);
  }

  reset(randomY = false) {
    this.x = Math.random() * this.w;
    this.y = randomY ? Math.random() * this.h : this.h + 20;
    this.vx = 0.5 + Math.random() * 1.3;
    this.vy = -0.45 - Math.random() * 0.85;
    this.size = 9 + Math.random() * 11;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.035;
    this.alpha = 0.45 + Math.random() * 0.4;
    this.isWhite = Math.random() > 0.65;
  }

  update(windFactor) {
    this.x += this.vx * windFactor;
    this.y += this.vy;
    this.rotation += this.rotSpeed;

    if (this.y < -30 || this.x > this.w + 50) {
      this.reset(false);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    if (this.isWhite) {
      ctx.fillStyle = '#fff7fa';
      ctx.strokeStyle = '#fad0c4';
    } else {
      ctx.fillStyle = '#fca5ba';
      ctx.strokeStyle = '#f43f5e';
    }
    ctx.lineWidth = 0.6;

    ctx.beginPath();
    ctx.moveTo(0, -this.size * 0.6);
    ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.6, this.size * 0.6, this.size * 0.4, 0, this.size * 0.6);
    ctx.bezierCurveTo(-this.size * 0.6, this.size * 0.4, -this.size * 0.5, -this.size * 0.6, 0, -this.size * 0.6);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Sunlight Dust Particle / Glow
class SunlightDust {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.reset(true);
  }

  reset(randomY = false) {
    this.x = Math.random() * this.w;
    this.y = randomY ? Math.random() * this.h : this.h + 20;
    this.vx = 0.3 + Math.random() * 1.0;
    this.vy = -0.4 - Math.random() * 0.8;
    this.size = 1.8 + Math.random() * 3.2;
    this.alpha = 0.25 + Math.random() * 0.5;
  }

  update(windFactor) {
    this.x += this.vx * windFactor;
    this.y += this.vy;
    if (this.y < -20 || this.x > this.w + 40) {
      this.reset(false);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Sparkle Burst Particle
class Sparkle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = -Math.random() * 3.2 - 0.8;
    this.size = 2 + Math.random() * 4;
    this.alpha = 1;
    this.decay = 0.015 + Math.random() * 0.018;
    this.color = Math.random() > 0.4 ? '#f43f5e' : '#ffffff';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.moveTo(0, -this.size);
    ctx.lineTo(this.size * 0.25, -this.size * 0.25);
    ctx.lineTo(this.size, 0);
    ctx.lineTo(this.size * 0.25, this.size * 0.25);
    ctx.lineTo(0, this.size);
    ctx.lineTo(-this.size * 0.25, this.size * 0.25);
    ctx.lineTo(-this.size, 0);
    ctx.lineTo(-this.size * 0.25, -this.size * 0.25);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// Master Palace Rose Garden App
class PalaceRoseGardenApp {
  constructor() {
    this.canvas = document.getElementById('gardenCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.spriteLoader = new SpriteLoader();

    this.roses = [];
    this.particles = [];
    this.floatingPetals = [];
    this.sparkles = [];
    this.time = 0;
    this.petalsActive = true;
    this.isAwake = false;
    this.isGardenBloomed = false;

    // UI Elements
    this.storyText = document.getElementById('storyText');
    this.hintText = document.getElementById('hintText');
    this.bloomInvitation = document.getElementById('bloomInvitation');
    this.magicBloomBtn = document.getElementById('magicBloomBtn');
    this.musicToggleBtn = document.getElementById('musicToggleBtn');
    this.changeTrackBtn = document.getElementById('changeTrackBtn');
    this.musicDisk = document.getElementById('musicDisk');
    this.musicStatusText = document.getElementById('musicStatusText');
    this.rebloomBtn = document.getElementById('rebloomBtn');
    this.petalToggleBtn = document.getElementById('petalToggleBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.hideControlsBtn = document.getElementById('hideControlsBtn');
    this.showControlsTrigger = document.getElementById('showControlsTrigger');
    this.floatingControls = document.getElementById('floatingControls');

    this.textCycleIndex = 0;
    this.messages = [
      "Giữa muôn ngàn đóa hồng rạng rỡ, cậu là đóa hoa xinh đẹp nhất... 🌸",
      "Nhưng một bông hoa sẽ đẹp hơn nếu nó được đặt đúng nơi, gửi tặng cậu ngày 20/10 ✨",
      "Chúc cậu luôn dịu dàng, rạng ngời và ngập tràn hạnh phúc 💕"
    ];

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.setupInteractions();

    for (let i = 0; i < 35; i++) {
      this.particles.push(new SunlightDust(this.width, this.height));
    }
    for (let i = 0; i < 45; i++) {
      this.floatingPetals.push(new FloatingPetal(this.width, this.height));
    }

    this.spriteLoader.loadAll().then(() => {
      this.animate();
      this.startGardenExperience();
    });
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  startGardenExperience() {
    this.roses = [];
    this.isAwake = false;
    this.isGardenBloomed = false;

    if (this.bloomInvitation) {
      this.bloomInvitation.classList.remove('hidden');
    }

    if (window.wishesManager) {
      window.wishesManager.hideFlyingCard();
      if (window.wishesManager.reopenCardBtn) {
        window.wishesManager.reopenCardBtn.classList.remove('visible');
      }
    }

    this.storyText.innerHTML = "Giữa muôn ngàn đóa hồng e ấp, cậu là đóa hoa xinh đẹp nhất...";
    this.storyText.style.opacity = '1';
    this.hintText.textContent = "✨ Chạm vào màn hình để thấy điều bất ngờ ✨";

    // 1. Sprout Central Hero Rose as Bud
    const heroX = this.width * 0.32;
    const heroY = this.height * 0.50;

    const heroRose = new BloomingRose(heroX, heroY, {
      isHero: true,
      size: 190,
      sprite: this.spriteLoader.sprites['layer6'] || this.spriteLoader.sprites['layer4'] || this.spriteLoader.getRandom(),
      stemSpeed: 0.032,
      bloomSpeed: 0.038,
      autoBloom: false
    });

    this.roses.push(heroRose);
    this.addSparkleBurst(heroX, heroY, 20);

    // 2. Cascade of rose stems with buds across the terrace
    setTimeout(() => {
      this.awakenFullRoseGarden();
    }, 400);
  }

  awakenFullRoseGarden() {
    if (this.isAwake) return;
    this.isAwake = true;

    const count = Math.max(30, Math.floor(this.width / 40));
    const stepX = this.width / count;

    for (let i = 0; i < count; i++) {
      const delay = Math.random() * 900;
      setTimeout(() => {
        const x = i * stepX + (Math.random() - 0.5) * stepX * 1.5;
        if (Math.abs(x - this.width * 0.32) < 55) return;

        const depth = Math.random();
        let targetY, size;

        if (depth < 0.3) {
          targetY = this.height * (0.38 + Math.random() * 0.16);
          size = 85 + Math.random() * 30;
        } else if (depth < 0.7) {
          targetY = this.height * (0.48 + Math.random() * 0.18);
          size = 115 + Math.random() * 40;
        } else {
          targetY = this.height * (0.60 + Math.random() * 0.20);
          size = 145 + Math.random() * 45;
        }

        const sprite = this.spriteLoader.getRandom();

        const rose = new BloomingRose(x, targetY, {
          size: size,
          sprite: sprite,
          stemSpeed: 0.032 + Math.random() * 0.02,
          bloomSpeed: 0.038 + Math.random() * 0.02,
          autoBloom: false
        });

        this.roses.push(rose);
      }, delay);
    }
  }

  bloomGarden(clickX, clickY) {
    if (this.isGardenBloomed) return;
    this.isGardenBloomed = true;

    // Hide bloom invitation button
    if (this.bloomInvitation) {
      this.bloomInvitation.classList.add('hidden');
    }

    // Start gentle romantic music if not already playing
    if (window.romanticAudio && !window.romanticAudio.isPlaying) {
      window.romanticAudio.start();
      this.updateMusicUI(true);
    }

    // Play sparkle chime
    if (window.romanticAudio) {
      window.romanticAudio.playSparkle(1.0);
      setTimeout(() => window.romanticAudio.playSparkle(1.2), 350);
      setTimeout(() => window.romanticAudio.playSparkle(1.4), 700);
    }

    // Circular wave bloom from origin
    const originX = (clickX !== undefined) ? clickX : this.width * 0.5;
    const originY = (clickY !== undefined) ? clickY : this.height * 0.55;

    this.roses.forEach((rose) => {
      const dist = Math.hypot(rose.x - originX, rose.targetY - originY);
      const delay = Math.min(1300, dist * 0.75 + Math.random() * 150);
      setTimeout(() => {
        rose.startBloom();
        this.addSparkleBurst(rose.x + rose.currentSway, rose.targetY, 15);
      }, delay);
    });

    this.storyText.innerHTML = "🌸 Cả vườn hồng ngát hương rạng rỡ khoe sắc vì cậu ✨";
    this.hintText.textContent = "✨ Nhấp vào màn hình để thấy điều bất ngờ✨";

    // "Và sau đó lời chúc sẽ bay ra"
    setTimeout(() => {
      if (window.wishesManager) {
        window.wishesManager.showFlyingCard();
      }
      this.addSparkleBurst(this.width * 0.5, this.height * 0.45, 40);
      this.startStoryTextCycle();
    }, 1500);
  }

  startStoryTextCycle() {
    if (this.textInterval) clearInterval(this.textInterval);
    this.textInterval = setInterval(() => {
      this.textCycleIndex = (this.textCycleIndex + 1) % this.messages.length;
      this.storyText.style.opacity = '0';
      setTimeout(() => {
        this.storyText.innerHTML = this.messages[this.textCycleIndex];
        this.storyText.style.opacity = '1';
      }, 500);
    }, 7000);
  }

  plantNewRoseAt(x, y) {
    this.addSparkleBurst(x, y, 18);

    if (window.romanticAudio) {
      window.romanticAudio.playSparkle(1.15);
    }

    const sprite = this.spriteLoader.getRandom();
    const size = 125 + Math.random() * 45;

    const rose = new BloomingRose(x, y, {
      size: size,
      sprite: sprite,
      stemSpeed: 0.045,
      bloomSpeed: 0.05,
      autoBloom: true
    });

    this.roses.push(rose);
  }

  addSparkleBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      this.sparkles.push(new Sparkle(x, y));
    }
  }

  setupInteractions() {
    // Magic bloom button
    if (this.magicBloomBtn) {
      this.magicBloomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.bloomGarden(this.width * 0.5, this.height * 0.55);
      });
    }

    // Canvas click
    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.clientY > this.height - 80 && Math.abs(e.clientX - this.width / 2) < 280) {
        return;
      }

      if (!this.isGardenBloomed) {
        this.bloomGarden(e.clientX, e.clientY);
      } else {
        this.plantNewRoseAt(e.clientX, e.clientY);
      }
    });

    this.musicToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.romanticAudio) {
        const isPlaying = window.romanticAudio.toggle();
        this.updateMusicUI(isPlaying);
      }
    });

    this.changeTrackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.romanticAudio) {
        const trackName = window.romanticAudio.nextTrack();
        this.updateMusicUI(true);
        if (window.wishesManager) {
          window.wishesManager.showToast(`Đang phát: ${trackName}`);
        }
      }
    });

    this.rebloomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startGardenExperience();
    });

    this.petalToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.petalsActive = !this.petalsActive;
      this.petalToggleBtn.style.opacity = this.petalsActive ? '1' : '0.5';
      if (window.wishesManager) {
        window.wishesManager.showToast(this.petalsActive ? '✨ Đã bật mưa cánh hoa hồng' : 'Đã tắt mưa cánh hoa');
      }
    });

    this.fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => { });
      } else {
        document.exitFullscreen().catch(() => { });
      }
    });

    // Hide / Show controls toggle
    if (this.hideControlsBtn && this.floatingControls && this.showControlsTrigger) {
      this.hideControlsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.floatingControls.classList.add('hidden');
        this.showControlsTrigger.classList.add('visible');
        if (window.wishesManager) {
          window.wishesManager.showToast('Đã ẩn thanh công cụ. Nhấp 🌸 ở góc dưới để mở lại.');
        }
      });

      this.showControlsTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = this.floatingControls.classList.contains('hidden');
        if (isHidden) {
          this.floatingControls.classList.remove('hidden');
          this.showControlsTrigger.classList.remove('visible');
        } else {
          this.floatingControls.classList.add('hidden');
          this.showControlsTrigger.classList.add('visible');
        }
      });
    }
  }

  updateMusicUI(isPlaying) {
    if (isPlaying) {
      this.musicDisk.classList.add('spinning');
      this.musicStatusText.textContent = 'Nhạc: Bật';
      this.musicToggleBtn.style.borderColor = 'rgba(244, 114, 182, 0.8)';
    } else {
      this.musicDisk.classList.remove('spinning');
      this.musicStatusText.textContent = 'Nhạc: Tắt';
      this.musicToggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    }
  }

  animate() {
    this.time += 0.02;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const windFactor = 1.0 + 0.3 * Math.sin(this.time * 0.55);

    // Draw Roses sorted by depth
    this.roses.sort((a, b) => a.targetY - b.targetY);
    for (let rose of this.roses) {
      rose.update(this.time, windFactor);
      rose.draw(this.ctx, this.time);
    }

    // Sunlight Dust Particles
    for (let p of this.particles) {
      p.update(windFactor);
      p.draw(this.ctx);
    }

    // Floating Rose Petals
    if (this.petalsActive) {
      for (let petal of this.floatingPetals) {
        petal.update(windFactor);
        petal.draw(this.ctx);
      }
    }

    // Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.update();
      sp.draw(this.ctx);
      if (sp.alpha <= 0) {
        this.sparkles.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gardenApp = new PalaceRoseGardenApp();
});
