# Guia de Edição — Manual Flow

Guia rápido para alterar o manual depois de publicado. Tudo é feito direto pelo site do GitHub, sem instalar nada. Todo *commit* (salvamento) publica a mudança automaticamente em 1–2 minutos.

> **Regra de ouro:** o conteúdo do manual está só no `index.html`. As cores/fontes estão no `assets/css/style.css`. O comportamento (busca, menu, etc.) está no `assets/js/app.js` — esse você não precisa mexer.

---

## Como abrir um arquivo para editar (vale para todos os casos abaixo)

1. No repositório, clique em **Código**.
2. Clique no arquivo que quer editar (ex: `index.html`).
3. Clique no ícone de lápis ✏️ no canto superior direito (**Edit this file**).
4. Faça a alteração.
5. Role até o final da página, escreva uma frase curta descrevendo o que mudou (ex: `corrige texto da etapa de captação`) e clique no botão verde **Commit changes**.

---

## 1. Alterar um texto existente

1. Abra o `index.html` para edição (passo acima).
2. Use **Ctrl+F** (busca do navegador) para achar o texto que você quer mudar — copie um trecho da frase atual do site e cole na busca.
3. Edite o texto **entre as tags**, sem mexer no que está dentro de `< >`.

```html
<!-- Antes -->
<p>Confirme nome, CPF/CNPJ, e-mail e WhatsApp.</p>

<!-- Depois -->
<p>Confirme nome completo, CPF/CNPJ, e-mail, WhatsApp e nacionalidade.</p>
```

4. Salve com **Commit changes**.

---

## 2. Trocar a logo

A logo atual é um ícone desenhado em código (SVG), sem arquivo de imagem. Você tem duas opções:

### Opção A — Usar uma imagem de logo própria (mais simples)

1. Faça upload do arquivo da logo (PNG ou SVG, fundo transparente) para `assets/img/` — use **Add file → Upload files** dentro da pasta `assets/img`.
   - Exemplo de nome: `logo.png`
2. Abra o `index.html` para edição.
3. Localize este bloco (é o `<svg class="brand-mark">...</svg>` logo no topo do arquivo, dentro de `<div class="brand">`):

```html
<div class="brand">
  <svg class="brand-mark" viewBox="0 0 40 40" ...>
    ...
  </svg>
  <div class="brand-text">
```

4. Troque **só o bloco `<svg class="brand-mark">...</svg>`** inteiro por:

```html
<img class="brand-mark" src="assets/img/logo.png" alt="Logo">
```

5. Salve. A nova logo aparece no topo do menu lateral.

### Opção B — Trocar também o ícone da aba do navegador (favicon)

1. Suba sua logo (de preferência em formato `.svg` ou `.png` quadrado) para `assets/img/`, por exemplo `favicon-novo.png`.
2. Abra `index.html`, ache esta linha (fica no `<head>`, perto do topo):

```html
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
```

3. Troque pelo novo caminho:

```html
<link rel="icon" href="assets/img/favicon-novo.png" type="image/png">
```

---

## 3. Trocar as cores (identidade visual)

1. Abra `assets/css/style.css` para edição.
2. As cores ficam todas no topo do arquivo, no bloco `:root { ... }`:

```css
:root{
  --green: #1FAE63;       /* cor principal (verde) */
  --green-dark: #138A4D;  /* verde mais escuro (hover de botões) */
  --green-light: #E3F7EE; /* verde clarinho (fundos de destaque) */
  --navy: #0E1158;        /* cor escura (menu lateral, títulos) */
  --navy-soft: #3B3F8F;
  --lavender: #EEF1FA;    /* fundo lilás claro (tabelas, cards) */
  ...
}
```

3. Troque os valores hexadecimais (`#1FAE63` etc.) pelas cores da identidade oficial. Use um site como [coolors.co](https://coolors.co) ou peça a cor exata para quem fez a marca.
4. Salve. O site inteiro atualiza as cores automaticamente (botões, menu, ícones, bordas), pois tudo usa essas variáveis.

> Não precisa mexer em mais nenhum lugar do CSS — só nesse bloco `:root`.

---

## 4. Adicionar uma foto ou print de tela

1. Suba a imagem para `assets/img/` (ex: `assets/img/tela-proposta.png`) usando **Add file → Upload files**.
2. Abra `index.html`, ache a seção onde quer inserir a imagem (use Ctrl+F com o título da seção, ex: "Proposta de Venda").
3. Cole esta linha logo após o parágrafo ou lista onde quer a imagem:

```html
<img src="assets/img/tela-proposta.png" alt="Tela de Proposta de Venda" style="width:100%; border-radius:12px; border:1px solid var(--line); margin:16px 0;">
```

4. Troque `tela-proposta.png` e o texto do `alt` pelo nome real do seu arquivo e uma descrição curta da imagem.
5. Salve.

---

## 5. Adicionar um vídeo

### Opção A — Vídeo hospedado no YouTube (recomendado, mais leve)

1. Pegue o link de **incorporar** do vídeo no YouTube (Compartilhar → Incorporar → copiar o `src` do código).
2. Cole isto na seção desejada do `index.html`:

```html
<div style="position:relative; padding-bottom:56.25%; height:0; margin:16px 0; border-radius:12px; overflow:hidden;">
  <iframe src="https://www.youtube.com/embed/SEU_CODIGO_AQUI"
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
    allowfullscreen></iframe>
</div>
```

3. Troque `SEU_CODIGO_AQUI` pelo código do vídeo (a parte depois de `v=` no link do YouTube, ou o que já vem no link de incorporar).

### Opção B — Vídeo próprio (arquivo .mp4)

> Atenção: vídeos deixam o repositório pesado. Use só para vídeos curtos (poucos MB). Para vídeos longos, prefira o YouTube no modo "não listado".

1. Suba o arquivo `.mp4` para `assets/img/` (pode ser usado o mesmo lugar das imagens).
2. Cole:

```html
<video controls style="width:100%; border-radius:12px; margin:16px 0;">
  <source src="assets/img/meu-video.mp4" type="video/mp4">
</video>
```

---

## 6. Adicionar um fluxograma

### Opção A — Imagem pronta (mais rápido)

Se você já tem o fluxograma desenhado (Miro, Figma, Canva, PowerPoint, etc.), exporte como PNG e siga o mesmo passo do item **4. Adicionar uma foto**.

### Opção B — Fluxo interativo no estilo do site (sem precisar de imagem)

O manual já tem um componente pronto de "passo a passo numerado" (é o que aparece em "Fluxo geral do atendimento"). Para criar um novo, copie e cole este bloco, ajustando o número de passos:

```html
<div class="steps">
  <div class="step" data-n="1"><h4>Nome do passo 1</h4><p>Descrição do que acontece nesse passo.</p></div>
  <div class="step" data-n="2"><h4>Nome do passo 2</h4><p>Descrição do que acontece nesse passo.</p></div>
  <div class="step" data-n="3"><h4>Nome do passo 3</h4><p>Descrição do que acontece nesse passo.</p></div>
</div>
```

- Cada `<div class="step">` é uma etapa do fluxograma.
- `data-n="1"` é o número que aparece na bolinha — pode ir até onde precisar (4, 5, 6...).
- Cole esse bloco dentro de qualquer `<section class="section">` já existente, ou crie uma seção nova (veja item 7).

---

## 7. Adicionar uma seção nova dentro de uma área já existente

Exemplo: adicionar um tópico novo dentro da área "Fluxo de Atendimento".

1. Abra `index.html` para edição.
2. Copie um bloco de seção inteiro existente, por exemplo este (de "Etapa de Recepção"):

```html
<section class="section" id="sec-recepcao">
  <h3>11. Etapa de Recepção</h3>
  <p>...</p>
</section>
```

3. Cole logo abaixo dele, e troque:
   - o `id="sec-recepcao"` por um **id novo e único**, ex: `id="sec-minha-secao"`
   - o título e o texto

```html
<section class="section" id="sec-minha-secao">
  <h3>Título da nova seção</h3>
  <p>Texto da nova seção aqui.</p>
</section>
```

4. Agora vá até a barra lateral (mais acima no mesmo arquivo) e ache o `<div class="nav-area" data-area="fluxo">` correspondente. Dentro do `<div class="nav-sub">`, adicione um novo link:

```html
<a href="#sec-minha-secao">Título da nova seção</a>
```

5. Salve. A busca rápida já vai indexar o conteúdo novo automaticamente — não precisa fazer mais nada.

---

## 8. Desfazer um erro

Errou algo e quer voltar como estava antes?

1. No repositório, clique no arquivo (ex: `index.html`).
2. Clique em **History** (ícone de relógio, perto do topo do arquivo).
3. Você verá a lista de todas as alterações (commits) já feitas.
4. Clique em uma versão anterior para ver como estava o arquivo naquele momento.
5. Clique nos **três pontinhos (`...`)** ao lado dessa versão → **Revert** (ou copie o conteúdo de lá e cole de volta no arquivo atual, editando e salvando normalmente).

---

## 9. Editar as Boas Práticas ou o SAC de uma área (novo recurso)

O manual agora abre com uma tela de seleção de perfil (carrossel). Depois que a pessoa escolhe sua área, ela vê uma seção com **"Boas práticas da sua área"** e **"Dúvidas frequentes (SAC)"**, além de apenas o conteúdo do manual relevante para aquele perfil.

Cada área tem um bloco próprio no `index.html`, identificado por `id="panel-CHAVE-DA-AREA"`. As chaves são:

| Área | Chave (`data-role`) |
|---|---|
| Administrador / Supervisor de Sala | `admin` |
| Captador | `captador` |
| Recepcionista | `recepcionista` |
| Gerente de Captação | `gerente-captacao` |
| Gerente de Sala | `gerente-sala` |
| Liner | `liner` |
| Closer | `closer` |
| Revisor | `revisor` |
| Sub Líder de Captação | `sub-captacao` |
| Sub Líder de Vendas | `sub-vendas` |
| Assistente de Contrato | `assistente-contrato` |
| Gerente Regional | `gerente-regional` |

### Para editar/adicionar uma boa prática

1. Abra `index.html` para edição e use Ctrl+F para achar `id="panel-closer"` (troque `closer` pela área desejada).
2. Dentro desse bloco, ache `<ul class="check-list">` e edite os itens `<li>...</li>` normalmente, ou adicione uma nova linha `<li>Nova boa prática aqui.</li>`.

### Para editar/adicionar uma pergunta do SAC

Dentro do mesmo bloco `panel-...`, ache `<div class="faq">`. Cada pergunta é um bloco assim:

```html
<details class="faq-item">
  <summary>Pergunta que a pessoa vai clicar para abrir</summary>
  <p>Resposta que aparece ao abrir.</p>
</details>
```

Copie um desses blocos, cole logo abaixo, e troque a pergunta e a resposta. Pode adicionar quantas quiser.

### Para dizer quais seções do manual aparecem para cada área

Cada seção operacional do manual (ex: "Etapa de Captação", "Documentação") tem um atributo `data-roles` que lista quem pode vê-la. Exemplo:

```html
<section class="section" id="sec-captacao" data-roles="captador gerente-captacao sub-captacao admin">
```

- Para liberar essa seção para mais um perfil, adicione a chave dele nessa lista (separada por espaço), por exemplo `sub-vendas`.
- Para tirar o acesso de um perfil, remova a chave da lista.
- Seções **sem** o atributo `data-roles` (como Objetivo do manual, Glossário, Conceitos principais) aparecem para todo mundo, sempre.
- `admin` deve permanecer em praticamente todas as listas, já que esse perfil é pensado para ver o manual quase por completo.

### Para adicionar uma área/perfil totalmente nova

1. Copie um `<button class="role-card" data-role="...">` inteiro (dentro de `<div id="carTrack">`) e ajuste a chave e o nome.
2. Copie um bloco `<div class="role-panel" data-role="...">` inteiro e ajuste chave, descrição, boas práticas e FAQ.
3. Adicione o `data-roles="..."` correspondente nas seções do manual que essa nova área deve enxergar.

---



| Quero alterar | Arquivo | O que fazer |
|---|---|---|
| Um texto | `index.html` | Editar o texto entre as tags |
| A logo | `index.html` | Trocar o `<svg class="brand-mark">` por `<img>` |
| As cores | `assets/css/style.css` | Trocar os valores no bloco `:root` |
| Uma foto/print | `index.html` + subir arquivo em `assets/img/` | Adicionar `<img src="...">` |
| Um vídeo | `index.html` | Adicionar `<iframe>` (YouTube) ou `<video>` (arquivo próprio) |
| Um fluxograma | `index.html` | Imagem (`<img>`) ou bloco `.steps` |
| Uma seção nova | `index.html` | Copiar um bloco `<section>` existente + link no menu |
| Uma área nova | `index.html` | Copiar um bloco `<div class="area-block">` + `<div class="nav-area">` inteiros |
| Boas práticas / SAC de um perfil | `index.html` | Editar dentro de `<div class="role-panel" data-role="...">` |
| Quais seções um perfil enxerga | `index.html` | Editar a lista `data-roles="..."` na tag `<section>` |

Qualquer dúvida na hora de aplicar algum desses passos, me manda um print da tela ou me diz o que está tentando mudar que eu te dou o trecho de código pronto.
