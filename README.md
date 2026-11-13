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
js/plane.js         Air Tractor do topo: recortado da foto, se solta e sai da tela ao rolar
js/main.js          rolagem suave, revelações, parallax das fotos, contadores, menu
js/vendor/          GSAP 3.12.5, ScrollTrigger e Lenis 1.1.13 (cópias locais)
assets/             logo (versão para fundo escuro) e fotos em assets/img
```

## Trocar a foto do topo por vídeo
Em `index.html`, dentro de `.hero__frame`, troque a `<img class="hero__bg">` pela linha de `<video>` que está comentada logo acima e coloque o arquivo em `assets/video/topo.mp4`.
O Air Tractor recortado (`assets/img/air-tractor-recorte.webp`) foi posicionado para casar com a foto atual; com outro fundo, ajuste a posição de `.plane-anchor` em `css/style.css` ou remova o avião.

## Visualizar localmente
```bash
python3 -m http.server 8080
```
Abra http://localhost:8080.

## Publicar
Funciona em qualquer hospedagem estática: GitHub Pages (Settings → Pages → branch), Netlify ou Vercel (arrastar a pasta).
