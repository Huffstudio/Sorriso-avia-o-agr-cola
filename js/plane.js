/* =========================================================
   Air Tractor do topo
   O avião recortado da foto fica exatamente sobre a foto de fundo.
   Ao rolar a página, ele "se solta" da foto: cresce, avança na
   direção da câmera e sai da tela por cima das outras seções.
   Não segue o mouse.
   ========================================================= */
(function () {
  const hero = document.querySelector(".hero");
  const anchor = document.querySelector(".plane-anchor");
  const plane = document.querySelector(".plane");
  const shade = document.querySelector(".hero__shade");
  if (!hero || !anchor || !plane) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const show = () => plane.classList.add("is-ready");
  if (plane.complete) show(); else plane.addEventListener("load", show);

  function frame(now) {
    const r = anchor.getBoundingClientRect();
    const heroH = hero.offsetHeight;
    const W = innerWidth, H = innerHeight;

    // progresso do scroll dentro do topo (0 → 1)
    const p = clamp(scrollY / (heroH * 0.9), 0, 1);
    const e = p * p * (3 - 2 * p); // suavização

    // posição base: em cima do avião da foto (r já inclui o zoom lento e o scroll)
    let x = r.left, y = r.top, scale = 1, rot = 0, op = 1;

    if (!reduced) {
      const t = now / 1000;
      y += Math.sin(t * 1.1) * 3;           // flutuação discreta
      rot = Math.sin(t * 0.8) * 0.35;
      // voo para fora: cresce, vem em direção à câmera e sai pela direita
      x += e * W * 0.42;
      y += e * H * 1.1;
      scale = 1 + e * 1.6;
      rot += e * 7;
      op = 1 - clamp((p - 0.85) / 0.15, 0, 1);
    }

    plane.style.width = r.width + "px";
    plane.style.transform =
      `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(2)}deg)`;
    plane.style.opacity = plane.classList.contains("is-ready") ? op : 0;
    plane.classList.toggle("is-gone", p >= 1 || (reduced && scrollY > heroH * 0.8));

    if (shade) shade.style.setProperty("--dim", (e * 0.75).toFixed(3));

    if (!reduced) requestAnimationFrame(frame);
  }

  if (reduced) {
    const once = () => frame(0);
    addEventListener("scroll", once, { passive: true });
    addEventListener("resize", once);
    once();
  } else {
    requestAnimationFrame(frame);
  }
})();
