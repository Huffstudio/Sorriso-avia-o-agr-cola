/* =========================================================
   Sorriso Aviação Agrícola — animações gerais
   ========================================================= */
(function () {
  const cfg = window.SITE_CONFIG || {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- contatos a partir do config.js ---------- */
  const links = {
    whatsapp: cfg.whatsapp ? `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(cfg.whatsappMensagem || "")}` : "#contato",
    telefone: cfg.telefone ? `tel:+${cfg.telefone}` : "#contato",
    email: cfg.email ? `mailto:${cfg.email}` : "#contato",
    instagram: cfg.instagram || "#"
  };
  const texts = {
    whatsapp: cfg.whatsappTexto, telefone: cfg.telefoneTexto,
    email: cfg.email, endereco: cfg.endereco
  };
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

  /* ---------- menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  toggle && toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open);
  });
  document.querySelectorAll(".nav a").forEach((a) => a.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    toggle && toggle.setAttribute("aria-expanded", "false");
  }));

  /* ---------- header ao rolar ---------- */
  const header = document.querySelector(".header");
  const onScroll = () => header.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- contadores ---------- */
  const fmt = new Intl.NumberFormat("pt-BR");
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduced) { el.textContent = fmt.format(end) + suf; return; }
    const t0 = performance.now(), dur = 2000;
    const step = (now) => {
      const k = Math.min((now - t0) / dur, 1);
      const v = Math.round(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = fmt.format(v) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { runCounter(en.target); io.unobserve(en.target); }
    }), { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  } else counters.forEach(runCounter);

  /* ---------- cursor customizado ---------- */
  if (finePointer && !reduced) {
    const cur = document.querySelector(".cursor");
    const dot = cur.querySelector(".cursor__dot");
    const ring = cur.querySelector(".cursor__ring");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; cur.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.add("is-hidden"));
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll("a, button, .tilt").forEach((el) => {
      el.addEventListener("pointerenter", () => cur.classList.add("is-hover"));
      el.addEventListener("pointerleave", () => cur.classList.remove("is-hover"));
    });
    document.documentElement.style.cursor = "none";
    document.querySelectorAll("a, button").forEach((el) => (el.style.cursor = "none"));
  }

  /* ---------- botões magnéticos e cards com tilt ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 600);
      });
    });
    document.querySelectorAll(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-4px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .7s cubic-bezier(.22,1,.36,1), box-shadow .4s, border-color .4s";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 700);
      });
    });
  }

  /* ---------- daqui para baixo: GSAP + Lenis ---------- */
  if (!hasGsap || reduced) return;
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // rolagem suave
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
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
      if (lenis) lenis.scrollTo(target, { offset: -70 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // divide títulos em palavras
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "word";
            const inner = document.createElement("span"); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return el.querySelectorAll(".word > span");
  }

  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = splitWords(el);
    const inHero = !!el.closest(".hero");
    gsap.from(words, {
      yPercent: 115, rotate: 6, duration: 1.1, ease: "power4.out", stagger: 0.07,
      delay: inHero ? 0.2 : 0,
      scrollTrigger: inHero ? null : { trigger: el, start: "top 85%" }
    });
  });

  // revelação de elementos (em lote, com escalonamento)
  const reveal = gsap.utils.toArray("[data-reveal]");
  reveal.forEach((el) => {
    const d = el.dataset.reveal;
    gsap.set(el, { opacity: 0, y: d === "up" ? 50 : 0, x: d === "left" ? -70 : d === "right" ? 70 : 0 });
  });
  ScrollTrigger.batch(reveal, {
    start: "top 90%",
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, x: 0, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.1, overwrite: true,
      delay: batch[0].closest(".hero") ? 0.6 : 0
    })
  });

  // parallax genérico
  gsap.utils.toArray("[data-speed]").forEach((el) => {
    const speed = parseFloat(el.dataset.speed) || 0;
    const section = el.closest("section") || el.parentElement;
    const inHero = !!el.closest(".hero");
    gsap.to(el, {
      y: () => -speed * (inHero ? 500 : 300),
      ease: "none",
      scrollTrigger: {
        trigger: section, start: inHero ? "top top" : "top bottom", end: "bottom top",
        scrub: true, invalidateOnRefresh: true
      }
    });
  });

  // conteúdo do hero sobe e some suavemente
  gsap.to(".hero__content", {
    y: -120, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  // aviões atravessando as seções
  const crossing = (sel, trigger, fromY, toY, rot) => {
    const el = document.querySelector(sel);
    if (!el) return;
    gsap.fromTo(el,
      { x: () => -el.offsetWidth - 40, y: fromY, rotate: 0 },
      {
        x: () => innerWidth + 40, y: toY, rotate: rot, ease: "none",
        scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true }
      });
  };
  crossing(".cross-plane--ipanema", ".services", 120, -40, -8);
  crossing(".cross-plane--at", ".fleet", 0, -260, -12);

  // imagens da frota entram "voando"
  gsap.utils.toArray(".plane-card__img img").forEach((img, i) => {
    gsap.from(img, {
      x: i % 2 ? 160 : -160, y: 60, rotate: i % 2 ? 6 : -6, ease: "power3.out", duration: 1.4,
      scrollTrigger: { trigger: img, start: "top 85%" }
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
