/* =========================================================
   Air Tractor interativo do hero
   - persegue o mouse/dedo com inclinação e "virada" suave
   - solta rastro de pulverização (canvas)
   - ao rolar, cresce e voa para fora do quadro do hero
   ========================================================= */
(function () {
  const stage = document.querySelector(".plane-stage");
  const plane = document.querySelector(".hero-plane");
  const flip = document.querySelector(".hero-plane__flip");
  const boom = document.getElementById("heroBoom");
  const canvas = document.querySelector(".spray-canvas");
  if (!stage || !plane || !flip || !canvas) return;

  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RATIO = 230 / 620; // proporção do SVG

  let W = innerWidth, H = innerHeight, dpr = 1;
  let pw = plane.offsetWidth, ph = pw * RATIO;

  function resize() {
    W = innerWidth; H = innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pw = plane.offsetWidth; ph = pw * RATIO;
  }
  resize();
  addEventListener("resize", resize);

  const isMobile = () => W < 760;
  const idlePoint = (t) => isMobile()
    ? { x: W * 0.5 + Math.sin(t * 0.45) * W * 0.16, y: H * 0.2 + Math.sin(t * 0.9) * H * 0.02 }
    : { x: W * 0.7 + Math.sin(t * 0.4) * W * 0.14, y: H * 0.42 + Math.sin(t * 0.8) * H * 0.12 };

  // estado
  const start = idlePoint(0);
  let x = start.x, y = start.y, px = x, py = y;
  let mx = null, my = null, lastMove = -1e9;
  let facing = 1, fc = 1, angle = 0;
  let lastScroll = scrollY;
  const particles = [];

  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY; lastMove = performance.now();
  }, { passive: true });
  document.addEventListener("pointerleave", () => { lastMove = -1e9; });

  function scrollProgress() {
    return Math.min(Math.max(scrollY / (H * 0.85), 0), 1);
  }

  function apply(scale, extraX, extraY, extraRot) {
    const bob = Math.sin(performance.now() / 600) * 6;
    plane.style.transform =
      `translate3d(${x - pw / 2 + extraX}px, ${y - ph / 2 + bob + extraY}px, 0) scale(${scale})`;
    flip.style.transform = `scaleX(${fc.toFixed(3)}) rotate(${(angle + extraRot).toFixed(2)}deg)`;
  }

  if (reduced) {
    fc = 1; angle = -4;
    apply(1, 0, 0, 0);
    const hide = () => plane.classList.toggle("is-gone", scrollY > H * 0.6);
    addEventListener("scroll", hide, { passive: true }); hide();
    return;
  }

  function emit(scale) {
    if (!boom) return;
    const r = boom.getBoundingClientRect();
    if (r.width === 0) return;
    const n = isMobile() ? 2 : 4;
    for (let i = 0; i < n; i++) {
      particles.push({
        x: r.left + Math.random() * r.width,
        y: r.bottom + 2,
        vx: -facing * (0.8 + Math.random() * 1.6) * scale + (x - px) * 0.25,
        vy: 0.5 + Math.random() * 0.9,
        r: (1.5 + Math.random() * 2) * scale,
        g: (0.12 + Math.random() * 0.12) * scale,
        life: 0,
        max: 60 + Math.random() * 60,
        white: Math.random() < 0.4
      });
    }
  }

  function drawParticles(dy) {
    ctx.clearRect(0, 0, W, H);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx; p.y += p.vy - dy;
      p.vx *= 0.985; p.vy += 0.01;
      p.r += p.g;
      const k = 1 - p.life / p.max;
      if (k <= 0) { particles.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.fillStyle = p.white
        ? `rgba(255,255,255,${0.55 * k})`
        : `rgba(140,205,240,${0.38 * k})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let prevT = performance.now();
  function tick(now) {
    const dt = Math.min((now - prevT) / 16.67, 3); prevT = now;
    const t = now / 1000;

    // alvo: mouse (avião persegue com o nariz apontado para o cursor) ou rota livre
    let tx, ty;
    const active = mx !== null && now - lastMove < 2500;
    if (active) {
      tx = mx - facing * pw * 0.38;
      ty = my - ph * 0.05;
    } else {
      const ip = idlePoint(t);
      tx = ip.x; ty = ip.y;
    }

    px = x; py = y;
    const ease = 1 - Math.pow(1 - (active ? 0.06 : 0.03), dt);
    x += (tx - x) * ease;
    y += (ty - y) * ease;
    const vx = (x - px) / dt, vy = (y - py) / dt;

    if (active) {
      // histerese: vira só quando o cursor passa claramente para o outro lado
      if (mx > x + pw * 0.15) facing = 1; else if (mx < x - pw * 0.15) facing = -1;
    } else if (vx > 0.7) facing = 1; else if (vx < -0.7) facing = -1;
    fc += (facing - fc) * (1 - Math.pow(0.9, dt));
    const targetAngle = Math.max(-22, Math.min(22, vy * 1.6));
    angle += (targetAngle - angle) * (1 - Math.pow(0.88, dt));

    // saída pelo scroll
    const p = scrollProgress();
    const e = p * p;
    const scale = 1 + e * 1.8;
    const extraX = e * W * 0.6 * facing;
    const extraY = -e * H * 1.0;
    const extraRot = -e * 16;

    const gone = p >= 1;
    plane.classList.toggle("is-gone", gone);
    if (!gone) {
      apply(scale, extraX, extraY, extraRot);
      emit(scale);
    }

    const sNow = scrollY;
    drawParticles(sNow - lastScroll);
    lastScroll = sNow;

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
