// Código compartilhado por todas as páginas (não depende do Firebase).
(function () {
  var menuBtn = document.getElementById("menuBtn");
  var nav = document.getElementById("nav");

  function fecharMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Abrir menu");
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var aberto = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(aberto));
      menuBtn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    });

    // Fecha o menu ao tocar em qualquer link ou botão dele
    // (inclui os itens "Entrar", "Meu histórico" e "Sair", criados depois).
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a, button")) fecharMenu();
    });
  }

  var ano = document.getElementById("year");
  if (ano) ano.textContent = new Date().getFullYear();

  // Login e histórico precisam de um endereço http(s). Avisa quem abriu o
  // arquivo direto do computador (file://).
  if (location.protocol === "file:") {
    var aviso = document.createElement("div");
    aviso.className = "aviso-local";
    aviso.setAttribute("role", "alert");
    aviso.textContent =
      "Você abriu o arquivo direto do computador. Os minijogos funcionam, mas login e histórico só funcionam por um endereço http: use a extensão Live Server do VS Code ou o link do GitHub Pages.";
    document.body.insertBefore(aviso, document.body.firstChild);
  }
})();
