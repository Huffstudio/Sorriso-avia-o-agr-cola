# Sorriso Aviação Agrícola — site institucional

Site one-page em HTML, CSS e JavaScript puro. Não precisa de build nem de servidor especial.

## Como editar os contatos
Abra `js/config.js` e troque os valores: WhatsApp, telefone, e-mail, endereço, busca do mapa e Instagram.
Todos os botões do site são preenchidos automaticamente a partir desse arquivo.

## Textos e números
- Textos das seções: `index.html`.
- Números da faixa de destaques (hectares, anos, aeronaves): atributos `data-count` em `index.html`. **Os valores atuais são exemplos, troque pelos reais.**
- Especificações da frota (tanque, faixa, velocidade): seção `#frota` em `index.html`.

## Estrutura
```
index.html          página
css/style.css       estilos (cores no topo, em :root)
js/config.js        dados de contato
js/plane.js         Air Tractor interativo do topo (segue o mouse, pulveriza e sai da tela ao rolar)
js/main.js          rolagem suave, revelações, parallax, contadores, cursor, botões magnéticos
js/vendor/          GSAP 3.12.5, ScrollTrigger e Lenis 1.1.13 (cópias locais)
assets/             logo e ilustrações SVG (Air Tractor, Ipanema, nuvem)
```

## Visualizar localmente
```bash
python3 -m http.server 8080
```
Abra http://localhost:8080.

## Publicar
Funciona em qualquer hospedagem estática: GitHub Pages (Settings → Pages → branch), Netlify ou Vercel (arrastar a pasta).
