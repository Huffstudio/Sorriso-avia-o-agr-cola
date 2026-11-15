/* =========================================================
   DADOS DE CONTATO — edite apenas este arquivo.
   Todos os botões do site são preenchidos a partir daqui.
   ========================================================= */
window.SITE_CONFIG = {
  // WhatsApp: somente números, com DDI 55 + DDD. Ex.: 5566999999999
  whatsapp: "5566999999999",
  whatsappTexto: "(66) 99999-9999",
  whatsappMensagem: "Olá! Vim pelo site da Sorriso Aviação Agrícola e gostaria de um orçamento de aplicação aérea.",

  // Telefone fixo: somente números, com DDI. Ex.: 556635440000
  telefone: "556635440000",
  telefoneTexto: "(66) 3544-0000",

  email: "contato@sorrisoaviacao.com.br",

  endereco: "Sorriso - MT",
  // Texto usado para posicionar o mapa (pode ser o endereço completo do hangar)
  mapaBusca: "Sorriso, MT",

  instagram: "https://instagram.com/",

  // ---------- MAPA DE ATUAÇÃO (seção Contato) ----------
  // Coordenadas: [latitude, longitude]. Pegue no Google Maps (clique direito no ponto).
  bases: [
    { nome: "Sorriso", uf: "MT", coord: [-12.5425, -55.7211], principal: true },
    { nome: "Nova Canaã do Norte", uf: "MT", coord: [-10.6346, -55.7031] }
  ],
  // Raio do círculo em volta de cada base (km)
  raioBaseKm: 150,
  // Cidades atendidas (aparecem como pontos clicáveis)
  cidades: [
    { nome: "Lucas do Rio Verde", uf: "MT", coord: [-13.0500, -55.9042] },
    { nome: "Sinop", uf: "MT", coord: [-11.8642, -55.5094] },
    { nome: "Nova Mutum", uf: "MT", coord: [-13.8375, -56.0742] },
    { nome: "Vera", uf: "MT", coord: [-12.3036, -55.3050] },
    { nome: "Tapurah", uf: "MT", coord: [-12.6950, -56.5178] },
    { nome: "Ipiranga do Norte", uf: "MT", coord: [-12.2408, -56.1531] },
    { nome: "Nova Ubiratã", uf: "MT", coord: [-12.9833, -55.2556] },
    { nome: "Cláudia", uf: "MT", coord: [-11.5075, -54.8836] },
    { nome: "Colíder", uf: "MT", coord: [-10.8133, -55.4553] },
    { nome: "Alta Floresta", uf: "MT", coord: [-9.8756, -56.0861] },
    { nome: "Guarantã do Norte", uf: "MT", coord: [-9.9620, -54.9120] },
    { nome: "Novo Progresso", uf: "PA", coord: [-7.1478, -55.3817] }
  ],
  // Região destacada fora do MT
  regioesExtras: [
    { nome: "Sul do Pará", coord: [-7.6, -55.2], raioKm: 170 }
  ],
  // Velocidade média usada para estimar o tempo de voo (km/h)
  velocidadeVooKmh: 200
};
