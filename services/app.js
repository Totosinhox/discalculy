
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { cadastrar, entrar, sair } from "./services/auth";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [tela, setTela] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregandoInicial(false);
    });

    return unsubscribe;
  }, []);

  function limparCampos() {
    setEmail("");
    setSenha("");
  }

  function mostrarErro(erro) {
    const mensagens = {
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/invalid-email": "Digite um e-mail válido.",
      "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/too-many-requests":
        "Muitas tentativas. Aguarde e tente novamente.",
      "auth/network-request-failed":
        "Falha de conexão. Verifique sua internet.",
      "auth/operation-not-allowed":
        "Ative o login por e-mail e senha no Firebase.",
    };

    Alert.alert(
      "Não foi possível continuar",
      mensagens[erro.code] || "Ocorreu um erro. Tente novamente."
    );
  }

  async function handleEnviar() {
    const emailLimpo = email.trim();

    if (!emailLimpo || !senha) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }

    if (
      tela === "cadastro" &&
      (!emailLimpo.includes("@") || senha.length < 6)
    ) {
      Alert.alert(
        "Confira os dados",
        "Digite um e-mail válido e uma senha com pelo menos 6 caracteres."
      );
      return;
    }

    setProcessando(true);

    try {
      if (tela === "cadastro") {
        await cadastrar(emailLimpo, senha);
      } else {
        await entrar(emailLimpo, senha);
      }

      limparCampos();
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      setProcessando(false);
    }
  }

  async function handleSair() {
    try {
      await sair();
      limparCampos();
      setTela("login");
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  }

  if (carregandoInicial) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCarregando}>
          Verificando sua sessão...
        </Text>
      </View>
    );
  }

  if (usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.conteudo}>
          <Text style={styles.logo}>LoginApp</Text>
          <Text style={styles.titulo}>Você entrou!</Text>
          <Text style={styles.descricao}>
            Login realizado com sucesso.
          </Text>

          <View style={styles.cartao}>
            <Text style={styles.rotulo}>Conta conectada</Text>
            <Text style={styles.emailUsuario}>
              {usuario.email}
            </Text>
            <Text style={styles.descricao}>
              Seu usuário está autenticado pelo Firebase.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botao}
            onPress={handleSair}
          >
            <Text style={styles.textoBotao}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cadastro = tela === "cadastro";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>LoginApp</Text>

          <Text style={styles.titulo}>
            {cadastro ? "Crie sua conta" : "Bem-vindo de volta"}
          </Text>

          <Text style={styles.descricao}>
            {cadastro
              ? "Preencha os dados para começar."
              : "Entre com seu e-mail e sua senha."}
          </Text>

          <View style={styles.formulario}>
            <Text style={styles.rotulo}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="voce@exemplo.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />

            <Text style={styles.rotulo}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor="#94A3B8"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={cadastro ? "new-password" : "current-password"}
            />

            <TouchableOpacity
              style={[
                styles.botao,
                processando && styles.botaoDesativado,
              ]}
              onPress={handleEnviar}
              disabled={processando}
            >
              <Text style={styles.textoBotao}>
                {processando
                  ? "Aguarde..."
                  : cadastro
                  ? "Criar conta"
                  : "Entrar"}
              </Text>
            </TouchableOpacity>

            <View style={styles.linha}>
              <Text style={styles.textoAlternativo}>
                {cadastro
                  ? "Já tem uma conta?"
                  : "Ainda não tem uma conta?"}
              </Text>

              <TouchableOpacity
                disabled={processando}
                onPress={() => {
                  setTela(cadastro ? "login" : "cadastro");
                  limparCampos();
                }}
              >
                <Text style={styles.link}>
                  {cadastro ? " Fazer login" : " Criar conta"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  textoCarregando: {
    marginTop: 12,
    color: "#475569",
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 32,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 24,
  },
  formulario: {
    gap: 10,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  botao: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 18,
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linha: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  textoAlternativo: {
    color: "#64748B",
  },
  link: {
    color: "#2563EB",
    fontWeight: "700",
  },
  cartao: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  emailUsuario: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginVertical: 10,
  },
});

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { cadastrar, entrar, sair } from "./services/auth";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [tela, setTela] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregandoInicial(false);
    });

    return unsubscribe;
  }, []);

  function limparCampos() {
    setEmail("");
    setSenha("");
  }

  function mostrarErro(erro) {
    const mensagens = {
      "auth/email-already-in-use": "Este e-mail já está cadastrado.",
      "auth/invalid-email": "Digite um e-mail válido.",
      "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/too-many-requests":
        "Muitas tentativas. Aguarde e tente novamente.",
      "auth/network-request-failed":
        "Falha de conexão. Verifique sua internet.",
      "auth/operation-not-allowed":
        "Ative o login por e-mail e senha no Firebase.",
    };

    Alert.alert(
      "Não foi possível continuar",
      mensagens[erro.code] || "Ocorreu um erro. Tente novamente."
    );
  }

  async function handleEnviar() {
    const emailLimpo = email.trim();

    if (!emailLimpo || !senha) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha.");
      return;
    }

    if (
      tela === "cadastro" &&
      (!emailLimpo.includes("@") || senha.length < 6)
    ) {
      Alert.alert(
        "Confira os dados",
        "Digite um e-mail válido e uma senha com pelo menos 6 caracteres."
      );
      return;
    }

    setProcessando(true);

    try {
      if (tela === "cadastro") {
        await cadastrar(emailLimpo, senha);
      } else {
        await entrar(emailLimpo, senha);
      }

      limparCampos();
    } catch (erro) {
      mostrarErro(erro);
    } finally {
      setProcessando(false);
    }
  }

  async function handleSair() {
    try {
      await sair();
      limparCampos();
      setTela("login");
    } catch (erro) {
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  }

  if (carregandoInicial) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.textoCarregando}>
          Verificando sua sessão...
        </Text>
      </View>
    );
  }

  if (usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.conteudo}>
          <Text style={styles.logo}>LoginApp</Text>
          <Text style={styles.titulo}>Você entrou!</Text>
          <Text style={styles.descricao}>
            Login realizado com sucesso.
          </Text>

          <View style={styles.cartao}>
            <Text style={styles.rotulo}>Conta conectada</Text>
            <Text style={styles.emailUsuario}>
              {usuario.email}
            </Text>
            <Text style={styles.descricao}>
              Seu usuário está autenticado pelo Firebase.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botao}
            onPress={handleSair}
          >
            <Text style={styles.textoBotao}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cadastro = tela === "cadastro";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>LoginApp</Text>

          <Text style={styles.titulo}>
            {cadastro ? "Crie sua conta" : "Bem-vindo de volta"}
          </Text>

          <Text style={styles.descricao}>
            {cadastro
              ? "Preencha os dados para começar."
              : "Entre com seu e-mail e sua senha."}
          </Text>

          <View style={styles.formulario}>
            <Text style={styles.rotulo}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="voce@exemplo.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />

            <Text style={styles.rotulo}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo de 6 caracteres"
              placeholderTextColor="#94A3B8"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={cadastro ? "new-password" : "current-password"}
            />

            <TouchableOpacity
              style={[
                styles.botao,
                processando && styles.botaoDesativado,
              ]}
              onPress={handleEnviar}
              disabled={processando}
            >
              <Text style={styles.textoBotao}>
                {processando
                  ? "Aguarde..."
                  : cadastro
                  ? "Criar conta"
                  : "Entrar"}
              </Text>
            </TouchableOpacity>

            <View style={styles.linha}>
              <Text style={styles.textoAlternativo}>
                {cadastro
                  ? "Já tem uma conta?"
                  : "Ainda não tem uma conta?"}
              </Text>

              <TouchableOpacity
                disabled={processando}
                onPress={() => {
                  setTela(cadastro ? "login" : "cadastro");
                  limparCampos();
                }}
              >
                <Text style={styles.link}>
                  {cadastro ? " Fazer login" : " Criar conta"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 28,
  },
  centralizado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  textoCarregando: {
    marginTop: 12,
    color: "#475569",
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 32,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    marginBottom: 24,
  },
  formulario: {
    gap: 10,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  botao: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 18,
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linha: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 22,
  },
  textoAlternativo: {
    color: "#64748B",
  },
  link: {
    color: "#2563EB",
    fontWeight: "700",
  },
  cartao: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },npx create-expo-app@latest LoginBase --template blanknpx create-expo-app@latest LoginBase --template blanknpx create-expo-app@latest LoginBase --template blanknpx create-expo-app@latest LoginBase --template blanknpx create-expo-app@latest LoginBase --template blank
  emailUsuario: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginVertical: 10,
  },
});
