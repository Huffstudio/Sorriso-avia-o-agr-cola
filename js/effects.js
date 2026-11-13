/* =========================================================
   Efeitos inspirados na vitrine "36 animações em JavaScript"
   (Não Codei), adaptados à Sorriso Aviação Agrícola:
   - odômetro nos números
   - títulos que entram palavra por palavra
   - texto que se preenche com a rolagem
   - cartões que empilham (Serviços)
   - linha do tempo que se desenha (Como funciona)
   - galeria horizontal (Frota)
   - luz que segue o mouse e botão elástico
   ========================================================= */
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  /* ---------- odômetro ---------- */
  const fmt = new Intl.NumberFormat("pt-BR");
  document.querySelectorAll("[data-count]").forEach((el) => {
    const text = fmt.format(+el.dataset.count) + (el.dataset.suffix || "");
    if (reduced || !("IntersectionObserver" in window)) { el.textContent = text; return; }
    el.textContent = "";
    const sr = document.createElement("span"); sr.className = "sr-only"; sr.textContent = text;
    const vis = document.createElement("span"); vis.className = "odo"; vis.setAttribute("aria-hidden", "true");
    const rolls = [];
    for (const ch of text) {
      if (/\d/.test(ch)) {
        const d = document.createElement("span"); d.className = "odo__d";
        const r = document.createElement("span"); r.className = "odo__r";
        for (let n = 0; n <= 9; n++) { const s = document.createElement("span"); s.textContent = n; r.appendChild(s); }
        d.appendChild(r); vis.appendChild(d); rolls.push([r, +ch]);
      } else {
        const s = document.createElement("span"); s.textContent = ch === " " ? " " : ch; vis.appendChild(s);
      }
    }
    el.append(sr, vis);
    const io = new IntersectionObserver((ents) => {
      if (!ents[0].isIntersecting) return;
      io.disconnect();
      rolls.forEach(([r, d], i) => setTimeout(() => { r.style.transform = `translateY(${-d}em)`; }, 150 + i * 120));
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ---------- luz que segue o mouse ---------- */
  if (finePointer) {
    document.querySelectorAll(".glow").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- botão elástico (mola com amortecimento) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-elastic]").forEach((btn) => {
      let scale = 1, vel = 0, target = 1, running = false;
      const tick = () => {
        const force = (target - scale) * 0.2;   // rigidez da mola
        vel = (vel + force) * 0.72;             // amortecimento
        scale += vel;
        btn.style.transform = `scale(${scale.toFixed(4)})`;
        if (Math.abs(vel) < 0.0004 && Math.abs(target - scale) < 0.0004) { running = false; btn.style.transform = target === 1 ? "" : `scale(${target})`; return; }
        requestAnimationFrame(tick);
      };
      const go = (t) => { target = t; if (!running) { running = true; requestAnimationFrame(tick); } };
      btn.addEventListener("pointerenter", () => go(1.07));
      btn.addEventListener("pointerleave", () => go(1));
      btn.addEventListener("pointerdown", () => go(0.93));
      btn.addEventListener("pointerup", () => go(1.07));
    });
  }

  if (!hasGsap || reduced) {
    document.querySelectorAll(".step").forEach((s) => s.classList.add("is-on"));
    document.querySelectorAll(".fill-text").forEach((s) => s.style.opacity = 1);
    return;
  }
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- títulos palavra por palavra ---------- */
  const splitWords = (el, wrap) => {
    const nodes = [...el.childNodes];
    el.textContent = "";
    const out = [];
    nodes.forEach((node) => {
      if (node.nodeType !== 3) { el.appendChild(node); return; }
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
        out.push(wrap(part, el));
      });
    });
    return out;
  };
  document.querySelectorAll("[data-split]").forEach((el) => {
    const inner = splitWords(el, (word, parent) => {
      const w = document.createElement("span"); w.className = "split-w";
      const i = document.createElement("span"); i.textContent = word;
      w.appendChild(i); parent.appendChild(w); return i;
    });
    gsap.from(inner, {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* ---------- texto que se preenche ---------- */
  document.querySelectorAll("[data-fill]").forEach((el) => {
    const words = splitWords(el, (word, parent) => {
      const w = document.createElement("span"); w.className = "w"; w.textContent = word;
      parent.appendChild(w); return w;
    });
    ScrollTrigger.create({
      trigger: el, start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: (st) => {
        const lit = Math.round(st.progress * words.length);
        words.forEach((w, i) => w.classList.toggle("on", i < lit));
      }
    });
  });

  /* ---------- cartões que empilham ---------- */
  const cards = gsap.utils.toArray(".stack__card");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    gsap.to(card, {
      scale: 0.92, filter: "brightness(.65)", ease: "none",
      scrollTrigger: {
        trigger: next,
        start: "top bottom",
        end: () => "top " + (parseFloat(getComputedStyle(next).top) || 120) + "px",
        scrub: true, invalidateOnRefresh: true
      }
    });
  });

  /* ---------- linha do tempo que se desenha ---------- */
  document.querySelectorAll("[data-timeline]").forEach((tl) => {
    const steps = [...tl.querySelectorAll(".step")];
    ScrollTrigger.create({
      trigger: tl, start: "top 75%", end: "bottom 60%", scrub: 0.6,
      onUpdate: (st) => {
        const p = st.progress;
        tl.style.setProperty("--p", p.toFixed(4));
        steps.forEach((s, i) => s.classList.toggle("is-on", p >= (i + 0.08) / steps.length || p > 0.98));
      }
    });
  });

  /* ---------- galeria horizontal (só no computador) ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const section = document.querySelector(".gallery");
    const track = document.querySelector(".gallery__track");
    if (!section || !track) return;
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: section, start: "top top", end: () => "+=" + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
