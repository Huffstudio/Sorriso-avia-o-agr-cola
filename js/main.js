/* =========================================================
   Sorriso Aviação Agrícola · interações e animações
   ========================================================= */
(function () {
  const cfg = window.SITE_CONFIG || {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- contatos (js/config.js) ---------- */
  const links = {
    whatsapp: cfg.whatsapp ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(cfg.whatsappMensagem || "")}` : "#contato",
    telefone: cfg.telefone ? `tel:+${cfg.telefone}` : "#contato",
    email: cfg.email ? `mailto:${cfg.email}` : "#contato",
    instagram: cfg.instagram || "#"
  };
  const texts = { whatsapp: cfg.whatsappTexto, telefone: cfg.telefoneTexto, email: cfg.email, endereco: cfg.endereco };
  document.querySelectorAll("[data-contact]").forEach((el) => {
    const key = el.dataset.contact;
    if (links[key]) el.setAttribute("href", links[key]);
    if (key === "telefone" || key === "email") el.removeAttribute("target");
  });
  document.querySelectorAll("[data-contact-text]").forEach((el) => {
    const v = texts[el.dataset.contactText];
    if (v) el.textContent = v;
  });
  const map = document.querySelector(".contact__map iframe");
  if (map) map.src = `https://www.google.com/maps?q=${encodeURIComponent(cfg.mapaBusca || "Sorriso, MT")}&output=embed`;
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- menu ---------- */
  const btn = document.querySelector(".menu-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("nav-open", open);
    btn && btn.setAttribute("aria-expanded", String(open));
  };
  btn && btn.addEventListener("click", () => setMenu(!document.body.classList.contains("nav-open")));
  document.querySelectorAll(".menu-mobile a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* contadores: agora são odômetros, em js/effects.js */

  if (!hasGsap || reduced) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- rolagem suave ---------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(target, { offset: id === "#inicio" ? 0 : -72 }) : target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- entrada do topo ---------- */
  gsap.from(".hero__title .line", { yPercent: 100, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.15 });
  gsap.from([".hero__top p", ".hero__bottom .eyebrow", ".hero__ctas"], { y: 20, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.08, delay: 0.5 });
  gsap.from(".header", { y: -20, opacity: 0, duration: 1, ease: "power3.out", delay: 0.3 });

  // conteúdo do topo sai suavemente
  gsap.to(".hero__inner", {
    y: -80, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "70% top", scrub: true }
  });

  /* ---------- revelação discreta ---------- */
  const items = gsap.utils.toArray("[data-reveal]");
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: "top 90%",
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.08, overwrite: true })
  });

  /* ---------- parallax nas fotos ---------- */
  gsap.utils.toArray("[data-parallax]").forEach((img) => {
    gsap.fromTo(img, { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
