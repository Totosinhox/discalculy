import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
} from "react-native";

import { cadastrar } from "../services/auth";

export default function Cadastro({ navigation }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    if (!email.trim() || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    try {
      await cadastrar(email, senha);
      Alert.alert("Sucesso", "Conta criada!");
    } catch (erro) {
      Alert.alert(
        "Erro",
        "Não foi possível criar a conta. Confira os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Criar conta
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha (mínimo de 6 caracteres)"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Button
        title={carregando ? "Criando..." : "Cadastrar"}
        onPress={handleCadastro}
        disabled={carregando}
      />

      <Button
        title="Já tenho conta"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
}