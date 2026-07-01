# Configurar o SAC com Google Sheets — Manual Flow

Este guia mostra como ligar o manual a uma Google Sheet, para que:

- Cada área tenha seu próprio SAC (perguntas e respostas).
- Qualquer pessoa possa registrar uma dúvida nova (recebe um número de protocolo, ex: `FLOW-0007`).
- O suporte tenha uma tela de login para responder, e a resposta apareça automaticamente no SAC da área certa — sempre "amarrada" à pergunta original (mesma linha da planilha = mesmo protocolo).

Não é necessário nenhum servidor pago: tudo roda de graça no Google Sheets + Google Apps Script.

---

## Passo 1 — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco.
2. Dê um nome, por exemplo **"Manual Flow — SAC"**.
3. Renomeie a primeira aba (embaixo, clique com o botão direito em "Página1") para **`Perguntas`** (exatamente assim, sem acento).
4. Na linha 1 dessa aba, cole estes cabeçalhos, um por coluna (A até I):

```
ID	Area	Pergunta	Autor	DataPergunta	Status	Resposta	RespondidoPor	DataResposta
```

5. Crie uma segunda aba (botão **+** embaixo) e renomeie para **`Usuarios_Suporte`**.
6. Na linha 1 dessa aba, cole:

```
Usuario	Senha	Nome
```

7. Na linha 2, cadastre o primeiro usuário do suporte, por exemplo:

```
suporte	Flow@2026	Equipe de Suporte
```

> Troque `Flow@2026` por uma senha própria. Pode cadastrar quantas linhas/usuários quiser — um por pessoa do suporte.

### Popular o SAC com as perguntas já preparadas

Enviei o arquivo `seed_Perguntas.csv` com **37 perguntas e respostas reais**, extraídas e organizadas a partir do histórico do grupo de suporte do WhatsApp (analisei cerca de 17.700 mensagens de 7 meses). Os nomes de clientes, CPFs e IDs específicos foram removidos — o conteúdo foi reescrito de forma genérica, mantendo apenas o padrão do problema e da solução real que foi dada pela equipe.

> **Sobre a área "Gerente Regional":** no histórico analisado, praticamente não há dúvidas técnicas sobre o uso do sistema vindas desse perfil — as mensagens dessa audiência são majoritariamente sobre indicadores comerciais, não sobre "como usar o Flow". Por isso, deixei essa área sem perguntas semente de propósito: ela vai nascer organicamente, com o estado de "ainda não há dúvidas" e o formulário de pergunta, exatamente como você pediu.

Para importar:

1. Abra o arquivo `seed_Perguntas.csv` no Excel/Google Sheets (ou com bloco de notas) e copie todo o conteúdo, **sem a linha do cabeçalho** (já que o cabeçalho já está na linha 1 da sua aba).
2. Clique na célula **A2** da aba `Perguntas` e cole.

---

## Passo 2 — Criar o Apps Script (o "motor" que liga a planilha à internet)

1. Na planilha, vá em **Extensões → Apps Script**.
2. Vai abrir uma aba nova com um arquivo `Código.gs` vazio. Apague todo o conteúdo.
3. Abra o arquivo `google-apps-script/Code.gs` que te enviei, copie todo o conteúdo e cole no editor do Apps Script.
4. Clique no ícone de disquete (💾) para salvar. Dê um nome ao projeto, por exemplo "Manual Flow SAC".

---

## Passo 3 — Publicar como Web App (deixar acessível pela internet)

1. No Apps Script, clique no botão azul **Implantar → Nova implantação** (no canto superior direito).
2. Clique no ícone de engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web**.
3. Configure:
   - **Executar como:** Eu (seu e-mail)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **Implantar**.
5. Na primeira vez, o Google vai pedir autorização — clique em **Autorizar acesso**, escolha sua conta, e se aparecer um aviso de "app não verificado", clique em **Configurações avançadas → Acessar Manual Flow SAC (não seguro)**. É normal para scripts pessoais; o aviso existe porque o Google não analisou o script manualmente, mas ele só acessa a sua própria planilha.
6. Depois de autorizar, aparece uma tela com a **URL do app da Web** — algo como:
   `https://script.google.com/macros/s/AKfycb.../exec`
7. **Copie essa URL inteira.**

> Sempre que você editar o `Code.gs` no futuro, repita esse passo (Implantar → Gerenciar implantações → ✏️ editar → Nova versão → Implantar), ou as mudanças não entram em vigor.

---

## Passo 4 — Conectar o manual à planilha

1. No repositório do GitHub, abra o arquivo `assets/js/config.js` para edição.
2. Troque:

```js
const FLOW_API_URL = "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT";
```

Pela URL que você copiou no passo anterior:

```js
const FLOW_API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

3. Salve (**Commit changes**). Em 1–2 minutos o SAC do manual já estará lendo e gravando direto na sua planilha.

---

## Como usar no dia a dia

### Quem acessa o manual (qualquer pessoa)
- Ao entrar na área dela, vê o SAC daquela área carregado da planilha.
- Se não houver nenhuma dúvida ainda respondida, aparece a mensagem "Ainda não há dúvidas registradas para esta área" com um botão para perguntar.
- Ao clicar em **"+ Fazer uma nova pergunta"**, escreve a dúvida e envia — recebe na hora um número de protocolo (ex: `FLOW-0032`).
- Essa pergunta cai automaticamente na aba `Perguntas` da planilha, com Status = `Pendente`.

### Quem é do suporte
1. No manual, clique em **"Área de suporte"** (rodapé do menu lateral).
2. Entre com usuário e senha (os mesmos cadastrados na aba `Usuarios_Suporte`).
3. Aparece a lista de dúvidas pendentes, com filtro por área.
4. Escreva a resposta e clique em **Responder**.
5. A dúvida sai da lista de pendentes e passa a aparecer automaticamente no SAC da área correspondente, para todo mundo que acessar o manual — sempre com a pergunta e a resposta juntas (mesmo protocolo, mesma linha da planilha).

---

## Rastreabilidade — como funciona por trás

Cada pergunta vira **uma única linha** na aba `Perguntas`, identificada por um protocolo único (`FLOW-0001`, `FLOW-0002`, ...). A resposta do suporte é escrita **na mesma linha** (colunas Resposta, RespondidoPor, DataResposta). Isso significa que pergunta e resposta nunca podem "descasar" — elas são, literalmente, a mesma linha da planilha. Você pode a qualquer momento abrir a planilha e ver o histórico completo, filtrando por área ou por status.

---

## Segurança — o que você precisa saber

- O login do suporte impede que qualquer visitante comum **responda** dúvidas, mas é um controle simples (usuário/senha guardados na própria planilha), adequado para uso interno da equipe — não é um sistema de autenticação corporativa robusta.
- Qualquer pessoa com o link do manual pode **ler** as dúvidas já respondidas e **enviar** novas perguntas (isso é intencional, para funcionar como um SAC aberto).
- Não cadastre senhas sensíveis ou reaproveitadas de outros sistemas — trate como uma senha de uso interno e simples.
- Se quiser reforçar a segurança futuramente (ex: exigir login Google para responder), me avise — dá para evoluir o Apps Script para isso.

---

## Arquivos desta pasta

| Arquivo | Para que serve |
|---|---|
| `Code.gs` | Cole no Apps Script (Passo 2). |
| `seed_Perguntas.csv` | Perguntas/respostas iniciais para colar na aba `Perguntas`. |
| `seed_Usuarios_Suporte.csv` | Exemplo de usuário de suporte para a aba `Usuarios_Suporte`. |
