// Roda em todas as páginas:
//  1) mostra "Entrar" ou "Meu histórico / Sair" no menu, conforme o login;
//  2) salva a pontuação no Firestore quando um minijogo termina.
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { comTimeout, mensagemErroFirebase } from "./validacao.js";

const $ = (id) => document.getElementById(id);

function criarLink(texto, href) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = texto;
  return a;
}

function atualizarMenu(usuario) {
  const area = $("authArea");
  if (!area) return;
  area.replaceChildren();

  if (usuario) {
    area.appendChild(criarLink("Meu histórico", "historico.html"));
    const sair = document.createElement("button");
    sair.type = "button";
    sair.className = "nav-btn";
    sair.id = "btnSair";
    sair.textContent = "Sair";
    sair.addEventListener("click", async () => {
      try {
        await signOut(auth);
        // O histórico é privado: ao sair, volta para o início.
        if (location.pathname.endsWith("historico.html")) {
          location.href = "index.html";
        }
      } catch (erro) {
        alert("Não foi possível sair da conta. Tente novamente.");
      }
    });
    area.appendChild(sair);
  } else {
    area.appendChild(criarLink("Entrar", "conta.html"));
  }
}

function atualizarDicaDeSalvamento(usuario) {
  const dica = $("saveHint");
  if (!dica) return;
  dica.replaceChildren();
  if (usuario) {
    dica.textContent = "Sua pontuação é salva automaticamente no seu histórico.";
  } else {
    dica.append("Quer guardar sua pontuação? ");
    const link = criarLink("Entre ou crie uma conta", "conta.html");
    link.className = "save-link";
    dica.appendChild(link);
    dica.append(".");
  }
}

onAuthStateChanged(auth, (usuario) => {
  atualizarMenu(usuario);
  atualizarDicaDeSalvamento(usuario);
});

// Salva o resultado quando o minijogo (script.js) avisa que terminou.
document.addEventListener("discalculy:fim", async (evento) => {
  const status = $("saveStatus");
  if (!status) return;

  const usuario = auth.currentUser;
  if (!usuario) {
    status.className = "";
    status.replaceChildren(
      "Quer guardar essa pontuação? ",
      Object.assign(criarLink("Entre na sua conta", "conta.html"), { className: "save-link" }),
      "."
    );
    return;
  }

  const { jogo, pontos, total } = evento.detail;
  status.className = "";
  status.textContent = "Salvando sua pontuação...";

  try {
    await comTimeout(
      addDoc(collection(db, "users", usuario.uid, "resultados"), {
        jogo: jogo,
        pontos: pontos,
        total: total,
        criadoEm: serverTimestamp(),
      })
    );
    status.className = "good";
    status.textContent = "Pontuação salva no seu histórico.";
  } catch (erro) {
    console.error("Erro ao salvar pontuação:", erro);
    status.className = "try";
    status.textContent = "Não foi possível salvar: " + mensagemErroFirebase(erro);
  }
});
