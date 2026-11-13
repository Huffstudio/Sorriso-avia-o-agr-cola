/* =========================================================
   Air Tractor do topo
   O avião recortado fica exatamente sobre a foto de fundo.
   Ao rolar para baixo ele avança um pouco na direção da câmera,
   de forma suave e discreta. Ao voltar, retorna ao lugar.
   ========================================================= */
(function () {
  const plane = document.querySelector(".plane");
  const hero = document.querySelector(".hero");
  if (!plane || !hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") return;

  const { gsap } = window;
  gsap.registerPlugin(window.ScrollTrigger);

  // avanço: cresce ~6% e desce/vem para a direita só alguns pixels
  gsap.to(plane, {
    scale: 1.06, xPercent: 1.5, yPercent: 3, ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1.4 }
  });
})();
