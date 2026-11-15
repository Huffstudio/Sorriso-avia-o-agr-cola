/* =========================================================
   Mapa de atuação (seção Contato)
   Bases, cidades atendidas e região do Pará vêm do js/config.js.
   Ao tocar numa cidade: distância até a base mais próxima,
   tempo de voo estimado e uma rota tracejada no mapa.
   ========================================================= */
(function () {
  const el = document.getElementById("mapa-atuacao");
  if (!el || typeof window.L === "undefined") return;
  const cfg = window.SITE_CONFIG || {};
  const bases = cfg.bases || [];
  const cidades = cfg.cidades || [];
  const extras = cfg.regioesExtras || [];
  const vel = cfg.velocidadeVooKmh || 200;
  const raio = (cfg.raioBaseKm || 150) * 1000;
  const box = el.closest(".contact__map");
  const info = box.querySelector(".atuacao__info");

  const map = L.map(el, {
    zoomControl: false, scrollWheelZoom: false, attributionControl: true,
    zoomSnap: 0.25, minZoom: 5, maxZoom: 13
  });
  L.control.zoom({ position: "bottomright" }).addTo(map);
  map.attributionControl.setPrefix(false);

  const mapaEscuro = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    subdomains: "abcd", maxZoom: 19, attribution: "© OpenStreetMap · © CARTO"
  });
  const satelite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19, attribution: "Imagens © Esri"
  }).addTo(map);
  // foto de satélite da região salva no site: aparece na hora, mesmo antes
  // (ou sem) os quadradinhos online carregarem
  map.createPane("fundo").style.zIndex = 150;
  const fundoSat = L.imageOverlay("assets/img/mapa-satelite.webp", [[-15.2, -59.5], [-5.6, -51.5]], { pane: "fundo", interactive: false }).addTo(map);
  box.classList.add("is-sat");

  // roda do mouse só depois de clicar no mapa (não atrapalha a rolagem da página)
  map.on("click focus", () => map.scrollWheelZoom.enable());
  box.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());

  const km = (a, b) => map.distance(a, b) / 1000;
  const fmtTempo = (h) => {
    const min = Math.round(h * 60 / 5) * 5;
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? " " + (min % 60) + " min" : ""}`;
  };

  const tudo = [];
  // círculos de alcance e marcadores das bases
  bases.forEach((b, i) => {
    L.circle(b.coord, { radius: raio, color: "#3ddc6b", weight: 1.2, dashArray: "6 6", fillColor: "#3ddc6b", fillOpacity: 0.07, interactive: false }).addTo(map);
    const m = L.marker(b.coord, {
      icon: L.divIcon({ className: "pin-base", html: `<span class="pin-base__dot"></span><span class="pin-base__nome">Base ${b.nome}</span>`, iconSize: [18, 18], iconAnchor: [9, 9] }),
      zIndexOffset: 1000, keyboard: true, title: `Base ${b.nome}`
    }).addTo(map);
    m.on("click", () => mostrarBase(i));
    tudo.push(b.coord);
  });

  extras.forEach((r) => {
    L.circle(r.coord, { radius: (r.raioKm || 150) * 1000, color: "#f5c400", weight: 1.2, dashArray: "6 6", fillColor: "#f5c400", fillOpacity: 0.06, interactive: false }).addTo(map);
    L.marker(r.coord, { icon: L.divIcon({ className: "pin-regiao", html: r.nome, iconSize: null }), interactive: false }).addTo(map);
    tudo.push(r.coord);
  });

  let rota = null;
  cidades.forEach((c) => {
    const m = L.marker(c.coord, {
      icon: L.divIcon({ className: "pin-cidade", html: `<span class="pin-cidade__dot"></span><span class="pin-cidade__nome">${c.nome}</span>`, iconSize: [12, 12], iconAnchor: [6, 6] }),
      keyboard: true, title: c.nome
    }).addTo(map);
    m.on("click", () => mostrarCidade(c, m));
    tudo.push(c.coord);
  });

  function maisProxima(coord) {
    let best = null;
    bases.forEach((b) => { const d = km(coord, b.coord); if (!best || d < best.d) best = { b, d }; });
    return best;
  }

  function setInfo(titulo, texto, link) {
    info.innerHTML = `<p class="atuacao__titulo">${titulo}</p><p class="atuacao__texto">${texto}</p>` +
      (link ? `<a class="atuacao__link" href="${link}" target="_blank" rel="noopener">Como chegar na base →</a>` : "");
    info.classList.remove("is-flash"); void info.offsetWidth; info.classList.add("is-flash");
  }

  function limparRota() { if (rota) { map.removeLayer(rota); rota = null; } }

  function mostrarCidade(c, m) {
    const p = maisProxima(c.coord);
    limparRota();
    rota = L.polyline([p.b.coord, c.coord], { color: "#f5c400", weight: 2, dashArray: "2 8", lineCap: "round", className: "rota-voo" }).addTo(map);
    el.querySelectorAll(".pin-cidade.is-on").forEach((n) => n.classList.remove("is-on"));
    m.getElement() && m.getElement().classList.add("is-on");
    setInfo(`${c.nome} – ${c.uf}`,
      `<b>${Math.round(p.d)} km</b> da base de ${p.b.nome} · cerca de <b>${fmtTempo(p.d / vel)}</b> de voo`);
    map.flyToBounds(L.latLngBounds([p.b.coord, c.coord]), Object.assign({ duration: 0.9, maxZoom: 9 }, folga()));
    marcarChip(null);
  }

  function mostrarBase(i) {
    const b = bases[i];
    limparRota();
    const n = cidades.filter((c) => km(c.coord, b.coord) <= raio / 1000).length;
    setInfo(`Base ${b.nome} – ${b.uf}`,
      `${b.principal ? "Nossa base principal. " : ""}${n} cidade${n === 1 ? "" : "s"} atendida${n === 1 ? "" : "s"} num raio de ${raio / 1000} km.`,
      `https://www.google.com/maps/dir/?api=1&destination=${b.coord.join(",")}`);
    map.flyTo(b.coord, 8, { duration: 0.9 });
    marcarChip(`base-${i}`);
  }

  function marcarChip(id) {
    box.querySelectorAll("[data-ir]").forEach((bt) => bt.classList.toggle("is-on", bt.dataset.ir === id));
  }

  // espaço para os botões (em cima) e o cartão de informações (embaixo)
  const folga = () => {
    const sobre = info.offsetParent === box && getComputedStyle(info).position === "absolute";
    return { paddingTopLeft: [20, 70], paddingBottomRight: [20, sobre ? info.offsetHeight + 30 : 20] };
  };
  function verTudo(animar) {
    limparRota();
    const bounds = L.latLngBounds(tudo);
    animar ? map.flyToBounds(bounds, Object.assign({ duration: 0.9 }, folga())) : map.fitBounds(bounds, folga());
    marcarChip("tudo");
  }

  box.querySelectorAll("[data-ir]").forEach((bt) => bt.addEventListener("click", () => {
    const [tipo, idx] = bt.dataset.ir.split("-");
    if (tipo === "tudo") {
      verTudo(true);
      setInfo("Área de atuação", "Toque numa cidade para ver a distância e o tempo de voo a partir da base mais próxima.");
    } else if (tipo === "base") mostrarBase(+idx);
    else {
      const r = extras[+idx];
      limparRota();
      const p = maisProxima(r.coord);
      setInfo(r.nome, `Também atendemos o ${r.nome}. Fica a cerca de <b>${Math.round(p.d)} km</b> da base de ${p.b.nome} (~${fmtTempo(p.d / vel)} de voo).`);
      map.flyTo(r.coord, 7, { duration: 0.9 });
      marcarChip(bt.dataset.ir);
    }
  }));

  const btCamada = box.querySelector("[data-camada]");
  btCamada.addEventListener("click", () => {
    const sat = map.hasLayer(satelite);
    if (sat) { map.removeLayer(satelite); map.removeLayer(fundoSat); mapaEscuro.addTo(map); btCamada.textContent = "Satélite"; }
    else { map.removeLayer(mapaEscuro); fundoSat.addTo(map); satelite.addTo(map); btCamada.textContent = "Mapa"; }
    box.classList.toggle("is-sat", !sat);
  });

  const zoomNomes = () => el.classList.toggle("nomes-ocultos", map.getZoom() < 7.5);
  map.on("zoomend", zoomNomes);
  verTudo(false); zoomNomes();
  // o mapa nasce dentro de um bloco animado: recalcula o tamanho quando aparece
  const refit = () => { map.invalidateSize(); verTudo(false); };
  addEventListener("load", refit);
  if ("ResizeObserver" in window) {
    let w = el.clientWidth;
    new ResizeObserver(() => { if (Math.abs(el.clientWidth - w) > 20) { w = el.clientWidth; refit(); } }).observe(el);
  }
})();
