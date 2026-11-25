// Tela "Meu histórico": lê do Firestore as partidas do usuário logado.
// Caminho dos dados: users/{uid}/resultados
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { comTimeout, mensagemErroFirebase } from "./validacao.js";

const $ = (id) => document.getElementById(id);

const NOMES_DOS_JOGOS = {
  contas: "Contas rápidas",
  maior: "Qual é maior?",
  sequencia: "Complete a sequência",
};

function mostrarEstado(texto, tipo) {
  const estado = $("estado");
  estado.textContent = texto;
  estado.className = "notice" + (tipo ? " " + tipo : "");
  estado.classList.remove("hidden");
}

function formatarData(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") return "—";
  return timestamp.toDate().toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function criarCelula(texto) {
  const td = document.createElement("td");
  td.textContent = texto;
  return td;
}

function mostrarResultados(partidas) {
  const corpo = $("linhas");
  corpo.replaceChildren();

  partidas.forEach((p) => {
    const linha = document.createElement("tr");
    linha.appendChild(criarCelula(formatarData(p.criadoEm)));
    linha.appendChild(criarCelula(NOMES_DOS_JOGOS[p.jogo] || "Minijogo"));
    linha.appendChild(criarCelula(`${p.pontos} de ${p.total}`));
    corpo.appendChild(linha);
  });

  const somaPontos = partidas.reduce((s, p) => s + p.pontos, 0);
  const somaTotal = partidas.reduce((s, p) => s + p.total, 0);
  const melhor = partidas.reduce((m, p) => Math.max(m, p.pontos), 0);

  $("statPartidas").textContent = String(partidas.length);
  $("statMelhor").textContent = String(melhor);
  $("statMedia").textContent = somaTotal ? `${Math.round((somaPontos / somaTotal) * 100)}%` : "—";

  $("estado").classList.add("hidden");
  $("conteudoHistorico").classList.remove("hidden");
}

async function carregarHistorico(usuario) {
  $("historicoSub").textContent = usuario.displayName
    ? `Olá, ${usuario.displayName}. Aqui estão suas últimas partidas.`
    : "Aqui estão suas últimas partidas.";
  mostrarEstado("Carregando seu histórico...", "");

  try {
    const consulta = query(
      collection(db, "users", usuario.uid, "resultados"),
      orderBy("criadoEm", "desc"),
      limit(50)
    );
    const resposta = await comTimeout(getDocs(consulta), 12000);
    const partidas = resposta.docs.map((d) => d.data());

    if (partidas.length === 0) {
      $("conteudoHistorico").classList.add("hidden");
      mostrarEstado("Você ainda não jogou nenhuma partida. Jogue uma rodada para ver seu histórico aqui.", "");
      $("irParaJogos").classList.remove("hidden");
      return;
    }

    $("irParaJogos").classList.add("hidden");
    mostrarResultados(partidas);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
    $("conteudoHistorico").classList.add("hidden");
    $("irParaJogos").classList.add("hidden");
    mostrarEstado("Não foi possível carregar o histórico: " + mensagemErroFirebase(erro), "erro");
  }
}

onAuthStateChanged(auth, (usuario) => {
  if (!usuario) {
    // Página privada: sem login, volta para a tela de entrada.
    location.href = "conta.html";
    return;
  }
  carregarHistorico(usuario);
});
