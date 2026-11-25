// Tela de conta: cadastro, login e recuperação de senha (Firebase Authentication).
// No cadastro, o perfil do usuário também é gravado no Firestore (users/{uid}).
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  validarCadastro,
  validarLogin,
  validarEmail,
  mensagemErroFirebase,
  comTimeout,
} from "./validacao.js";

const $ = (id) => document.getElementById(id);

const CAMPOS = ["nome", "email", "senha", "confirmacao"];
const ERROS = {
  nome: "erroNome",
  email: "erroEmail",
  senha: "erroSenha",
  confirmacao: "erroConfirmacao",
};

let modo = "login"; // "login" ou "cadastro"
let processando = false;
let redirecionando = false;

function mostrarMensagem(texto, tipo) {
  const msg = $("formMsg");
  msg.textContent = texto;
  msg.className = "form-msg" + (tipo ? " " + tipo : "");
}

function limparErros() {
  CAMPOS.forEach((campo) => {
    $(ERROS[campo]).textContent = "";
    $(campo).removeAttribute("aria-invalid");
  });
  mostrarMensagem("", "");
}

function mostrarErrosDeCampo(erros) {
  let primeiro = null;
  CAMPOS.forEach((campo) => {
    if (erros[campo]) {
      $(ERROS[campo]).textContent = erros[campo];
      $(campo).setAttribute("aria-invalid", "true");
      if (!primeiro) primeiro = campo;
    }
  });
  if (primeiro) $(primeiro).focus();
}

function definirModo(novoModo) {
  modo = novoModo;
  const cadastro = modo === "cadastro";

  document.querySelectorAll(".tab").forEach((aba) => {
    const ativa = aba.dataset.modo === modo;
    aba.classList.toggle("active", ativa);
    aba.setAttribute("aria-selected", String(ativa));
  });

  $("campoNome").classList.toggle("hidden", !cadastro);
  $("campoConfirmacao").classList.toggle("hidden", !cadastro);
  $("btnReset").classList.toggle("hidden", cadastro);

  $("contaTitulo").textContent = cadastro ? "Criar conta" : "Entrar";
  $("contaDesc").textContent = cadastro
    ? "Preencha os dados para começar a guardar sua pontuação."
    : "Entre com seu e-mail e sua senha para ver seu histórico.";
  $("btnEnviar").textContent = cadastro ? "Criar conta" : "Entrar";
  $("senha").setAttribute("autocomplete", cadastro ? "new-password" : "current-password");

  limparErros();
}

function bloquear(bloqueado) {
  processando = bloqueado;
  $("btnEnviar").disabled = bloqueado;
  $("btnReset").disabled = bloqueado;
  if (bloqueado) {
    $("btnEnviar").textContent = "Aguarde...";
  } else {
    $("btnEnviar").textContent = modo === "cadastro" ? "Criar conta" : "Entrar";
  }
}

function irParaOsJogos(texto) {
  redirecionando = true;
  mostrarMensagem(texto, "ok");
  setTimeout(() => {
    location.href = "index.html#jogos";
  }, 1200);
}

async function fazerCadastro({ nome, email, senha }) {
  const nomeLimpo = nome.trim().replace(/\s+/g, " ");
  const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);
  const usuario = credencial.user;

  // A conta já existe neste ponto. Se o perfil não puder ser salvo,
  // o usuário continua cadastrado e o erro só vai para o console.
  try {
    await updateProfile(usuario, { displayName: nomeLimpo });
    await comTimeout(
      setDoc(doc(db, "users", usuario.uid), {
        nome: nomeLimpo,
        email: usuario.email,
        criadoEm: serverTimestamp(),
      })
    );
  } catch (erro) {
    console.warn("Conta criada, mas o perfil não foi salvo:", erro);
  }
}

$("contaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (processando) return;
  limparErros();

  const dados = {
    nome: $("nome").value,
    email: $("email").value,
    senha: $("senha").value,
    confirmacao: $("confirmacao").value,
  };

  const erros = modo === "cadastro" ? validarCadastro(dados) : validarLogin(dados);
  if (Object.keys(erros).length > 0) {
    mostrarErrosDeCampo(erros);
    mostrarMensagem("Confira os campos destacados.", "erro");
    return;
  }

  bloquear(true);
  try {
    if (modo === "cadastro") {
      await fazerCadastro(dados);
      irParaOsJogos("Conta criada! Levando você para os minijogos...");
    } else {
      await signInWithEmailAndPassword(auth, dados.email.trim(), dados.senha);
      irParaOsJogos("Login feito! Levando você para os minijogos...");
    }
  } catch (erro) {
    console.error("Erro de autenticação:", erro);
    mostrarMensagem(mensagemErroFirebase(erro), "erro");
    bloquear(false);
  }
});

$("btnReset").addEventListener("click", async () => {
  if (processando) return;
  limparErros();

  const email = $("email").value;
  const erro = validarEmail(email);
  if (erro) {
    mostrarErrosDeCampo({ email: erro });
    mostrarMensagem("Digite seu e-mail para receber o link de nova senha.", "erro");
    return;
  }

  bloquear(true);
  try {
    await sendPasswordResetEmail(auth, email.trim());
    mostrarMensagem("Enviamos um link para redefinir a senha. Confira seu e-mail.", "ok");
  } catch (erroReset) {
    console.error("Erro ao enviar redefinição:", erroReset);
    mostrarMensagem(mensagemErroFirebase(erroReset), "erro");
  } finally {
    bloquear(false);
  }
});

$("mostrarSenha").addEventListener("change", (e) => {
  const tipo = e.target.checked ? "text" : "password";
  $("senha").type = tipo;
  $("confirmacao").type = tipo;
});

document.querySelectorAll(".tab").forEach((aba) => {
  aba.addEventListener("click", () => {
    if (!processando) definirModo(aba.dataset.modo);
  });
});

$("btnSairConta").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (erro) {
    console.error(erro);
  }
});

// Quem já está logado vê um resumo em vez do formulário.
onAuthStateChanged(auth, (usuario) => {
  // Durante o envio do formulário (ou o redirecionamento), a tela não muda:
  // senão a mensagem de sucesso sumiria junto com o formulário.
  if (processando || redirecionando) return;
  const logado = Boolean(usuario);
  $("contaForm").classList.toggle("hidden", logado);
  document.querySelector(".tabs").classList.toggle("hidden", logado);
  $("jaLogado").classList.toggle("hidden", !logado);
  if (logado) {
    $("emailLogado").textContent = usuario.displayName
      ? `${usuario.displayName} (${usuario.email})`
      : usuario.email;
  }
});

definirModo(location.hash === "#cadastro" ? "cadastro" : "login");
