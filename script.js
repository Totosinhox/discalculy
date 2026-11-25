// Minijogos do Discalculy (não depende do Firebase: funciona mesmo sem conta).
// Ao terminar uma partida, dispara o evento "discalculy:fim"; o arquivo
// auth-header.js escuta esse evento e salva a pontuação se houver usuário logado.

const TOTAL_RODADAS = 5;

const $ = (id) => document.getElementById(id);

function sortear(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Cada jogo sabe criar uma pergunta: { text (HTML), answer (número) }.
const jogos = {
  contas: {
    badge: "JOGO 01",
    title: "Contas rápidas",
    desc: "Resolva uma conta por vez. Respire e pense com calma.",
    label: "QUANTO É?",
    criar() {
      let a = sortear(1, 10);
      let b = sortear(1, 10);
      const soma = Math.random() > 0.48;
      // Na subtração o resultado nunca fica negativo.
      if (!soma && a < b) [a, b] = [b, a];
      return {
        text: `${a} ${soma ? "+" : "−"} ${b} <em>= ?</em>`,
        answer: soma ? a + b : a - b,
      };
    },
  },
  maior: {
    badge: "JOGO 02",
    title: "Qual é maior?",
    desc: "Compare os números e escolha o maior deles.",
    label: "QUAL NÚMERO É MAIOR?",
    criar() {
      const a = sortear(1, 30);
      let b = sortear(1, 30);
      while (a === b) b = sortear(1, 30);
      return { text: `${a} <em>ou</em> ${b}`, answer: Math.max(a, b) };
    },
  },
  sequencia: {
    badge: "JOGO 03",
    title: "Complete a sequência",
    desc: "Observe o padrão e descubra qual número vem depois.",
    label: "QUAL NÚMERO ESTÁ FALTANDO?",
    criar() {
      const passo = [2, 3, 5][sortear(0, 2)];
      const a = sortear(1, 8);
      const b = a + passo;
      const c = b + passo;
      return { text: `${a}, ${b}, ${c}, <em>?</em>`, answer: c + passo };
    },
  },
};

let jogoAtual = "contas";
let rodada = 0;
let pontos = 0;
let respostaCerta = null;
let respondeu = false;

function atualizarProgresso() {
  $("roundLabel").textContent =
    rodada < TOTAL_RODADAS ? `Rodada ${rodada + 1} de ${TOTAL_RODADAS}` : "Rodada concluída";
  $("scoreLabel").textContent = `Pontos: ${pontos}`;
  $("bar").style.width = `${(rodada / TOTAL_RODADAS) * 100}%`;
}

function novaPergunta(focar) {
  respondeu = false;
  const pergunta = jogos[jogoAtual].criar();
  respostaCerta = pergunta.answer;
  $("question").innerHTML = pergunta.text;
  $("answer").value = "";
  $("answer").disabled = false;
  $("answerForm").classList.remove("hidden");
  $("feedback").textContent = "Você consegue! Faça no seu tempo.";
  $("feedback").className = "";
  $("next").classList.add("hidden");
  atualizarProgresso();
  if (focar) $("answer").focus();
}

function escolherJogo(chave) {
  jogoAtual = chave;
  rodada = 0;
  pontos = 0;
  respondeu = false;

  document.querySelectorAll(".tab").forEach((aba) => {
    const ativa = aba.dataset.game === chave;
    aba.classList.toggle("active", ativa);
    aba.setAttribute("aria-selected", String(ativa));
  });

  const jogo = jogos[chave];
  $("badge").textContent = jogo.badge;
  $("gameTitle").textContent = jogo.title;
  $("gameDesc").textContent = jogo.desc;
  $("questionLabel").textContent = jogo.label;

  $("end").classList.add("hidden");
  $("question").classList.remove("hidden");
  $("feedback").classList.remove("hidden");
  $("saveStatus").textContent = "";
  $("saveStatus").className = "";

  novaPergunta(false);
}

function terminarPartida() {
  $("answerForm").classList.add("hidden");
  $("question").classList.add("hidden");
  $("feedback").classList.add("hidden");
  $("next").classList.add("hidden");
  $("end").classList.remove("hidden");
  $("bar").style.width = "100%";
  atualizarProgresso();

  $("endMessage").textContent =
    pontos === TOTAL_RODADAS
      ? "Mandou muito bem! Você acertou todas. Continue praticando no seu ritmo."
      : pontos >= 3
      ? `Você acertou ${pontos} de ${TOTAL_RODADAS}. Cada tentativa é uma oportunidade de aprender!`
      : `Você completou ${TOTAL_RODADAS} rodadas. Que tal tentar novamente e observar como se sente?`;

  document.dispatchEvent(
    new CustomEvent("discalculy:fim", {
      detail: { jogo: jogoAtual, pontos: pontos, total: TOTAL_RODADAS },
    })
  );
}

// A resposta aceita só dígitos (as contas nunca dão resultado negativo).
$("answer").addEventListener("input", () => {
  $("answer").value = $("answer").value.replace(/\D/g, "");
});

$("answerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (respondeu) return;

  const valor = $("answer").value.trim();
  if (valor === "") {
    $("feedback").textContent = "Digite um número para continuar.";
    $("feedback").className = "try";
    $("answer").focus();
    return;
  }

  respondeu = true;
  if (Number(valor) === respostaCerta) {
    pontos++;
    $("feedback").textContent = "Isso mesmo! Você acertou. ✦";
    $("feedback").className = "good";
  } else {
    $("feedback").textContent = `A resposta desta rodada é ${respostaCerta}. Tudo bem errar: tente de novo na próxima!`;
    $("feedback").className = "try";
  }

  $("answer").disabled = true;
  rodada++;
  atualizarProgresso();
  $("next").textContent = rodada >= TOTAL_RODADAS ? "Ver resultado" : "Próxima rodada →";
  $("next").classList.remove("hidden");
  $("next").focus();
});

$("next").addEventListener("click", () => {
  if (rodada >= TOTAL_RODADAS) terminarPartida();
  else novaPergunta(true);
});

$("restart").addEventListener("click", () => escolherJogo(jogoAtual));

document.querySelectorAll(".tab").forEach((aba) => {
  aba.addEventListener("click", () => escolherJogo(aba.dataset.game));
});

escolherJogo("contas");
