# Marília Crozatti · Fineline Tattoo

Site de apresentação da tatuadora Marília Crozatti (@mariliacrozatti.tattoo), Studio Ink'Alma, Campinas/SP.
Prévia: https://azeugral.github.io/marilia-crozatti/ (com `noindex` até a aprovação).

## Estrutura

- `index.html`: página única (topo, manifesto, estilos, energéticas, trabalhos, reformas, sobre, estúdio, lojinha, relatos, agendar).
- `assets/css/marilia.css`: papel creme + verde do estúdio, Antonio fina nos títulos, Jost no texto, Mrs Saint Delafield só como palavra manuscrita.
- Topo: retrato da Marília (enviado por ela) sangrando à direita, nome grande à esquerda, uma entrada só. No "Sobre", a selfie no estúdio, também enviada por ela.
- `assets/js/marilia.js`: topo, menu, entradas, portfólio com filtros e tela cheia, comparador de reformas, vídeos com som, ficha que monta a mensagem do WhatsApp.
- `assets/js/obras.js`: lista do portfólio, gerada por `tools/processar.py` a partir do Instagram extraído (`../_ref/ig`).
- Monograma MC redesenhado em linha a partir da marca d'água das fotos dela (`assets/img/mc-*.svg` e o `<symbol id="mc">` do HTML).
- `tools/gerar_og.py`: `og.jpg`, `apple-touch-icon.png` e `favicon-32.png`.

## CONFIRMAR com a cliente

1. **Endereço do Studio Ink'Alma** (rua/bairro em Campinas). Hoje o site diz só "Campinas, SP".
2. **"Desde 2015" / "11 anos"**: tirado do reel de ago/2024 ("tatuo há 9 anos").
3. **IBM de madrugada** antes da tatuagem: veio de uma legenda; confirmar se ela quer isso no "Sobre".
4. **Sábados exclusivos para energéticas**: legenda de out/2024; ver se ainda vale.
5. **Lojinha (incensos Hemp)**: aromas e especificações tirados do destaque. Faltam preço, se entrega/envia e se a linha continua.
6. **Relatos**: trechos de legendas de clientes (energéticas e cliente antiga). Pedir autorização e, se quiserem, nome.
7. **Nomes nas energéticas** (Thaísa, Fabi, Andriza, Lilian, Talita, Amanda) e a tríade de cada uma vêm das legendas públicas; confirmar que pode citar.
8. **Logo**: o MC foi redesenhado em vetor a partir da marca d'água. Se ela tiver o arquivo original, trocar.
9. Domínio próprio (quando houver): trocar og:url/og:image, tirar o `noindex`, criar `robots.txt` e `sitemap.xml`.

---
Site por [L R G Z](https://lrgz.com.br)
