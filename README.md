# Discalculy — aprender no seu ritmo

Projeto Interdisciplinar de Desenvolvimento Web · tema: **discalculia**.

Site de divulgação + aplicação web em HTML, CSS e JavaScript puro (sem npm), com **Firebase Authentication** (cadastro e login) e **Cloud Firestore** (banco de dados).

## Integrantes

- Jullia dos Santos
- Kauê Castro dos Santos
- Laura Freitas de Campos
- Mariana de Andrade Lima
- Renato Moraes Alves

## Objetivos

- **Informar** sobre a discalculia com linguagem simples, sem julgamentos e com referências confiáveis.
- **Praticar** matemática com minijogos curtos, sem tempo limite e sem competição.
- **Acompanhar** a evolução de cada pessoa por meio de conta e histórico de partidas.

## Telas

| Página | O que faz |
|---|---|
| `index.html` | Site de divulgação: discalculia, projeto (objetivos e funcionalidades), minijogos, dicas, integrantes e referências |
| `conta.html` | Cadastro, login e recuperação de senha (com validação e mensagens de erro) |
| `historico.html` | "Meu histórico": partidas salvas no banco de dados (só para usuário logado) |

## Funcionalidades

- 3 minijogos de 5 rodadas: Contas rápidas, Qual é maior? e Complete a sequência.
- Cadastro (nome, e-mail, senha) e login; o perfil é gravado no Firestore em `users/{uid}`.
- Ao terminar uma partida logado, a pontuação é salva em `users/{uid}/resultados`.
- Tela de histórico com total de partidas, melhor pontuação, média de acertos e lista das últimas 50 partidas.
- Validação dos formulários e tratamento de erros (e-mail inválido, senha curta, senhas diferentes, e-mail já cadastrado, senha errada, sem internet, sem permissão no banco).

## Como rodar

O login e o histórico **não funcionam abrindo o `index.html` com duplo clique** (`file://`). Use um destes jeitos:

1. **VS Code:** instale a extensão *Live Server*, clique com o botão direito em `index.html` e escolha *Open with Live Server*.
2. **Terminal:** na pasta do projeto, rode `npx serve` (ou `python -m http.server 5500`) e abra o endereço mostrado (`http://localhost:...`).
3. **GitHub Pages:** em *Settings → Pages*, publique a branch `main` (pasta `/root`). O endereço fica `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Os minijogos funcionam em qualquer caso; sem login a pontuação só não é salva.

## Configuração do Firebase (uma vez)

No [console do Firebase](https://console.firebase.google.com), projeto **discalculy**:

1. **Authentication → Sign-in method:** ative **E-mail/senha**.
2. **Authentication → Configurações → Domínios autorizados:** confirme `localhost` e adicione `SEU-USUARIO.github.io` se for usar o GitHub Pages.
3. **Firestore Database:** clique em *Criar banco de dados* (modo produção, região `southamerica-east1` ou a mais próxima).
4. **Firestore Database → Regras:** cole o conteúdo de `firestore.rules` e clique em *Publicar*.

A configuração do app (`firebase.js`) vem do projeto "discalculy". A chave web do Firebase não é segredo; quem protege os dados são as regras do passo 4.

## Estrutura

```
index.html       site de divulgação
conta.html       cadastro / login
historico.html   histórico de partidas
styles.css       estilos (todas as páginas)
script.js        minijogos
comum.js         menu mobile, ano do rodapé, aviso de arquivo local
firebase.js      configuração do Firebase (Auth + Firestore)
auth-header.js   menu Entrar/Sair e salvamento da pontuação
conta.js         lógica de cadastro e login
historico.js     leitura do histórico no Firestore
validacao.js     validações e mensagens de erro
firestore.rules  regras de segurança do banco
penguin.png      mascote
```

## Aviso

O Discalculy é um projeto educativo. Não realiza diagnósticos e não substitui professores, psicopedagogos ou profissionais de saúde.
