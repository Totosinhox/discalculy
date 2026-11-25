// Validação dos formulários e tradução dos erros do Firebase.
// Cada função devolve uma mensagem de erro ("" quando está tudo certo).

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validarNome(nome) {
  const limpo = (nome || "").trim().replace(/\s+/g, " ");
  if (!limpo) return "Digite seu nome.";
  if (limpo.length < 2) return "O nome precisa ter pelo menos 2 letras.";
  if (limpo.length > 60) return "O nome pode ter no máximo 60 caracteres.";
  return "";
}

export function validarEmail(email) {
  const limpo = (email || "").trim();
  if (!limpo) return "Digite seu e-mail.";
  if (!REGEX_EMAIL.test(limpo)) {
    return "Digite um e-mail válido, como nome@exemplo.com.";
  }
  return "";
}

export function validarSenhaNova(senha) {
  if (!senha) return "Crie uma senha.";
  if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
  if (senha.length > 64) return "A senha pode ter no máximo 64 caracteres.";
  return "";
}

export function validarSenhaLogin(senha) {
  if (!senha) return "Digite sua senha.";
  return "";
}

export function validarConfirmacao(senha, confirmacao) {
  if (!confirmacao) return "Repita a senha para confirmar.";
  if (senha !== confirmacao) return "As senhas não são iguais.";
  return "";
}

// Devolve um objeto { campo: mensagem } só com os campos que têm erro.
export function validarCadastro({ nome, email, senha, confirmacao }) {
  const erros = {};
  const eNome = validarNome(nome);
  const eEmail = validarEmail(email);
  const eSenha = validarSenhaNova(senha);
  const eConf = validarConfirmacao(senha, confirmacao);
  if (eNome) erros.nome = eNome;
  if (eEmail) erros.email = eEmail;
  if (eSenha) erros.senha = eSenha;
  if (eConf) erros.confirmacao = eConf;
  return erros;
}

export function validarLogin({ email, senha }) {
  const erros = {};
  const eEmail = validarEmail(email);
  const eSenha = validarSenhaLogin(senha);
  if (eEmail) erros.email = eEmail;
  if (eSenha) erros.senha = eSenha;
  return erros;
}

const MENSAGENS = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado. Tente entrar.",
  "auth/invalid-email": "Digite um e-mail válido, como nome@exemplo.com.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed":
    "Sem conexão com a internet. Verifique e tente de novo.",
  "auth/operation-not-allowed":
    "O login por e-mail e senha ainda não foi ativado no Firebase.",
  "auth/operation-not-supported-in-this-environment":
    "Abra o site por um endereço http (Live Server ou GitHub Pages), não direto pelo arquivo.",
  "auth/unauthorized-domain":
    "Este endereço não está autorizado no Firebase (Authentication > Configurações > Domínios autorizados).",
  "permission-denied":
    "Sem permissão no banco de dados. Confira as regras do Firestore.",
  unavailable: "Banco de dados indisponível no momento. Tente de novo.",
  timeout: "A conexão está lenta e não foi possível confirmar. Tente de novo.",
};

export function mensagemErroFirebase(erro) {
  const codigo = (erro && erro.code) || "";
  return MENSAGENS[codigo] || "Algo deu errado. Tente novamente.";
}

// Cancela uma operação que demore demais (ex.: sem internet).
export function comTimeout(promessa, ms = 10000) {
  let temporizador;
  const limite = new Promise((_, rejeitar) => {
    temporizador = setTimeout(() => {
      const erro = new Error("timeout");
      erro.code = "timeout";
      rejeitar(erro);
    }, ms);
  });
  return Promise.race([promessa, limite]).finally(() => clearTimeout(temporizador));
}
