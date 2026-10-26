import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";

import { entrar } from "../services/auth";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    try {
      await entrar(email, senha);
      // A navegação para a tela inicial será
      // controlada pelo estado de autenticação.
    } catch (erro) {
      Alert.alert("Erro", "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Entrar
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Button
        title={carregando ? "Entrando..." : "Entrar"}
        onPress={handleLogin}
        disabled={carregando}
      />

      <Button
        title="Criar conta"
        onPress={() => navigation.navigate("Cadastro")}
      />
    </View>
  );
}import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";

import { entrar } from "../services/auth";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    try {
      await entrar(email, senha);
      // A navegação para a tela inicial será
      // controlada pelo estado de autenticação.
    } catch (erro) {
      Alert.alert("Erro", "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Entrar
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Button
        title={carregando ? "Entrando..." : "Entrar"}
        onPress={handleLogin}
        disabled={carregando}
      />

      <Button
        title="Criar conta"
        onPress={() => navigation.navigate("Cadastro")}
      />
    </View>
  );
}