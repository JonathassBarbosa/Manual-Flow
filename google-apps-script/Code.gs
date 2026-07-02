/**
 * MANUAL FLOW — SAC (backend em Google Apps Script)
 * ---------------------------------------------------------------
 * Cole este código no editor de Apps Script vinculado à sua planilha
 * (Extensões → Apps Script, dentro do Google Sheets).
 *
 * Veja o passo a passo completo de instalação em CONFIGURAR-SAC.md.
 *
 * A planilha precisa ter 2 abas, com estes nomes exatos:
 *
 * Aba "Perguntas" — cabeçalho na linha 1:
 *   ID | Area | Pergunta | Autor | DataPergunta | Status | Resposta | RespondidoPor | DataResposta
 *
 * Aba "Usuarios_Suporte" — cabeçalho na linha 1:
 *   Usuario | Senha | Nome
 * ---------------------------------------------------------------
 */

const SHEET_PERGUNTAS = "Perguntas";
const SHEET_USUARIOS = "Usuarios_Suporte";
const PREFIXO_ID = "FLOW-";

/* ------------------------- roteamento HTTP ------------------------- */

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "list") {
      return jsonOut(listAnswered(e.parameter.area));
    }

    if (action === "pending") {
      const auth = checkAuth(e.parameter.usuario, e.parameter.senha);
      if (!auth.ok) return jsonOut({ ok: false, error: "Usuário ou senha inválidos." });
      return jsonOut({ ok: true, items: listPending(e.parameter.area) });
    }

    return jsonOut({ ok: false, error: "Ação inválida." });
  } catch (err) {
    return jsonOut({ ok: false, error: "Erro no servidor: " + err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;

    if (action === "ask") {
      if (!body.pergunta || !body.area) {
        return jsonOut({ ok: false, error: "Pergunta ou área não informada." });
      }
      return jsonOut(askQuestion(body.area, body.pergunta, body.autor));
    }

    if (action === "login") {
      return jsonOut(checkAuth(body.usuario, body.senha));
    }

    if (action === "answer") {
      const auth = checkAuth(body.usuario, body.senha);
      if (!auth.ok) return jsonOut({ ok: false, error: "Usuário ou senha inválidos." });
      if (!body.id || !body.resposta) {
        return jsonOut({ ok: false, error: "Faltam dados para responder." });
      }
      return jsonOut(answerQuestion(body.id, body.resposta, auth.nome || body.usuario));
    }

    return jsonOut({ ok: false, error: "Ação inválida." });
  } catch (err) {
    return jsonOut({ ok: false, error: "Erro no servidor: " + err.message });
  }
}

/* ------------------------- funções auxiliares ------------------------- */

function getSheet(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Aba "' + name + '" não encontrada na planilha.');
  return sh;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAuth(usuario, senha) {
  if (!usuario || !senha) return { ok: false, error: "Informe usuário e senha." };
  const sh = getSheet(SHEET_USUARIOS);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowUser = String(data[i][0] || "").trim();
    const rowPass = String(data[i][1] || "");
    if (rowUser === String(usuario).trim() && rowPass === String(senha)) {
      return { ok: true, nome: data[i][2] || usuario };
    }
  }
  return { ok: false, error: "Usuário ou senha inválidos." };
}

function nextId(sh) {
  const lastRow = sh.getLastRow(); // inclui o cabeçalho
  return PREFIXO_ID + String(lastRow).padStart(4, "0");
}

function askQuestion(area, pergunta, autor) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = getSheet(SHEET_PERGUNTAS);
    const id = nextId(sh);
    sh.appendRow([id, area, pergunta, autor || "", new Date(), "Pendente", "", "", ""]);
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

function listAnswered(area) {
  const sh = getSheet(SHEET_PERGUNTAS);
  const data = sh.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0], rowArea = row[1], pergunta = row[2];
    const status = row[5], resposta = row[6], respondidoPor = row[7], dataResposta = row[8];
    if (status === "Respondida" && (!area || rowArea === area)) {
      items.push({
        id: id,
        area: rowArea,
        pergunta: pergunta,
        resposta: resposta,
        respondidoPor: respondidoPor,
        dataResposta: dataResposta ? new Date(dataResposta).toISOString() : ""
      });
    }
  }
  // mais recentes primeiro
  items.reverse();
  return { ok: true, items: items };
}

function listPending(area) {
  const sh = getSheet(SHEET_PERGUNTAS);
  const data = sh.getDataRange().getValues();
  const items = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0], rowArea = row[1], pergunta = row[2], autor = row[3];
    const dataPergunta = row[4], status = row[5];
    if (status === "Pendente" && (!area || rowArea === area)) {
      items.push({
        id: id,
        area: rowArea,
        pergunta: pergunta,
        autor: autor,
        dataPergunta: dataPergunta ? new Date(dataPergunta).toISOString() : ""
      });
    }
  }
  return items;
}

function answerQuestion(id, resposta, respondidoPor) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = getSheet(SHEET_PERGUNTAS);
    const data = sh.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        const linha = i + 1; // getRange é 1-indexado
        sh.getRange(linha, 6).setValue("Respondida");      // Status
        sh.getRange(linha, 7).setValue(resposta);          // Resposta
        sh.getRange(linha, 8).setValue(respondidoPor);     // RespondidoPor
        sh.getRange(linha, 9).setValue(new Date());        // DataResposta
        return { ok: true };
      }
    }
    return { ok: false, error: "Pergunta com esse protocolo não foi encontrada." };
  } finally {
    lock.releaseLock();
  }
}
