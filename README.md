# Manual Flow — Sistema de Atendimentos e Vendas

Manual interativo, em formato de site, construído em HTML/CSS/JS puro (sem build, sem dependências de servidor). Pode ser aberto direto no navegador ou hospedado gratuitamente no **GitHub Pages**.

## Estrutura de arquivos

```
.
├── index.html              ← todo o conteúdo do manual (editar aqui)
├── assets/
│   ├── css/style.css       ← cores, fontes, espaçamentos (identidade visual)
│   ├── js/app.js           ← busca, menu, barra de progresso, impressão
│   └── img/favicon.svg     ← ícone da aba do navegador
└── README.md
```

## Como hospedar no GitHub Pages (passo a passo)

1. Crie um repositório novo no GitHub (pode ser público ou privado, se a sua conta permitir Pages em repositório privado).
2. Envie todos os arquivos desta pasta para a raiz do repositório (mantendo a pasta `assets/` junto com o `index.html`).
3. No repositório, vá em **Settings → Pages**.
4. Em **Source**, selecione a branch `main` (ou `master`) e a pasta `/ (root)`.
5. Clique em **Save**. Em alguns minutos o GitHub mostrará o link público, algo como:
   `https://seu-usuario.github.io/nome-do-repositorio/`
6. Pronto — esse link pode ser compartilhado com toda a equipe.

### Toda vez que precisar atualizar o conteúdo

Basta editar o arquivo `index.html` (ou os arquivos CSS/JS) direto pelo GitHub (botão de lápis ✏️ no arquivo, ou clonando o repositório), e fazer **commit**. O GitHub Pages republica o site automaticamente em 1–2 minutos — a mudança aparece para todo mundo que acessar o link, sem precisar reenviar nada.

> Dica: se preferir editar localmente, basta abrir o `index.html` direto no navegador para conferir antes de subir (não precisa de servidor).

## Como editar o conteúdo

Todo o texto do manual está em `index.html`, organizado em blocos `<div class="area-block">` — um por área do menu lateral (Introdução, Perfis, Telas, Fluxo, Proposta, Gestão, Boas Práticas, Glossário). Dentro de cada área há `<section class="section" id="...">` — uma por tópico.

- Para **alterar um texto**: localize a seção pelo título (Ctrl+F no editor) e edite o HTML normalmente.
- Para **adicionar uma nova seção** dentro de uma área já existente: copie um bloco `<section class="section" id="...">...</section>` inteiro, troque o `id` (precisa ser único) e o conteúdo, e adicione o link correspondente em `<div class="nav-sub">` na barra lateral (mesmo `id` usado no `href="#..."`).
- Para **adicionar uma nova área**: copie um bloco `<div class="area-block">` inteiro e o bloco `<div class="nav-area">` correspondente na barra lateral, ajustando os números/IDs.
- A barra de **busca rápida** é gerada automaticamente a partir do conteúdo da página — não precisa atualizar nada à parte; ela sempre reflete o texto atual do `index.html`.

## Identidade visual usada

Extraída do material de encerramento do projeto Flow (GAV Resorts):

| Token | Cor |
|---|---|
| Verde "flow" (primária) | `#1FAE63` |
| Verde escuro (hover) | `#138A4D` |
| Verde claro (destaques) | `#E3F7EE` |
| Petróleo / navy (GAV Resorts) | `#0E1158` |
| Lavanda (cards secundários) | `#EEF1FA` |

Tipografia: **Sora** (títulos) + **Inter** (texto) + **IBM Plex Mono** (rótulos, números de etapa, termos do glossário), via Google Fonts.

> Quando você enviar o arquivo oficial da identidade visual (logo/paleta/fontes), essas variáveis em `assets/css/style.css` (bloco `:root`) podem ser substituídas em poucos minutos para alinhar 100% com a marca.

## Recursos do site

- **Sumário inicial** com cards clicáveis para as 8 áreas do manual.
- **Menu lateral fixo**, dividido por área, com sub-itens recolhíveis (acordeão).
- **Busca rápida** (atalho `/`) com resultados em tempo real e trechos destacados.
- **Indicador de progresso de leitura** e botão "voltar ao topo".
- **Destaque automático** da seção atual no menu conforme o scroll (scrollspy).
- **Botão Imprimir / PDF**, com layout específico de impressão (sem menu, com quebras de página por área).
- Totalmente responsivo (menu lateral vira gaveta no celular).
