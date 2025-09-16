import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ANOTACOES_KEY = "anotacoes_do_app";

export default function AnoteAqui() {
  const [anotacao, setAnotacao] = useState("");
  const [listaAnotacoes, setListaAnotacoes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregarAnotacoes();
  }, []);

  const carregarAnotacoes = async () => {
    try {
      const raw = await AsyncStorage.getItem(ANOTACOES_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      setListaAnotacoes(arr);
    } catch (e) {
      console.error(e);
      setListaAnotacoes([]);
    }
  };

  const salvarAnotacao = async () => {
    if (!anotacao.trim()) {
      Alert.alert("Erro", "A anotação não pode estar vazia.");
      return;
    }

    try {
      const raw = await AsyncStorage.getItem(ANOTACOES_KEY);
      const arr = raw ? JSON.parse(raw) : [];

      if (editandoId !== null) {
        const atualizado = arr.map((item) =>
          item.id === editandoId
            ? { ...item, texto: anotacao, data: new Date().toLocaleString("pt-BR") }
            : item
        );
        await AsyncStorage.setItem(ANOTACOES_KEY, JSON.stringify(atualizado));
        setListaAnotacoes(atualizado);
        setEditandoId(null);
        Alert.alert("Sucesso", "Anotação atualizada!");
      } else {
        const nova = {
          id: Date.now(),
          texto: anotacao,
          data: new Date().toLocaleString("pt-BR"),
        };
        const novoArray = [...arr, nova];
        await AsyncStorage.setItem(ANOTACOES_KEY, JSON.stringify(novoArray));
        setListaAnotacoes(novoArray);
        Alert.alert("Sucesso", "Anotação salva!");
      }

      setAnotacao("");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar a anotação.");
    }
  };

  const excluirAnotacao = (id) => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir esta anotação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            const novo = listaAnotacoes.filter((item) => item.id !== id);
            await AsyncStorage.setItem(ANOTACOES_KEY, JSON.stringify(novo));
            setListaAnotacoes(novo);
            if (editandoId === id) {
              setEditandoId(null);
              setAnotacao("");
            }
          } catch (e) {
            console.error(e);
            Alert.alert("Erro", "Não foi possível excluir a anotação.");
          }
        },
      },
    ]);
  };

  const iniciarEdicao = (item) => {
    setAnotacao(item.texto);
    setEditandoId(item.id);
  };

  const cancelarEdicao = () => {
    setAnotacao("");
    setEditandoId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onLongPress={() => iniciarEdicao(item)} style={{ flex: 1 }}>
        <Text style={styles.itemData}>{item.data}</Text>
        <Text style={styles.itemTexto}>{item.texto}</Text>
      </TouchableOpacity>

      <View style={styles.itemButtons}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEdit]}
          onPress={() => iniciarEdicao(item)}
        >
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDelete]}
          onPress={() => excluirAnotacao(item.id)}
        >
          <Text style={styles.btnText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Anotações</Text>
      <Text style={styles.contador}>Total: {listaAnotacoes.length}</Text>

      <TextInput
        style={styles.input}
        placeholder="Escreva sua anotação..."
        value={anotacao}
        onChangeText={setAnotacao}
        multiline
      />

      <View style={styles.botoes}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSalvar]}
          onPress={salvarAnotacao}
        >
          <Text style={styles.btnText}>
            {editandoId !== null ? "Salvar Alterações" : "Salvar Anotação"}
          </Text>
        </TouchableOpacity>

        {editandoId !== null ? (
          <TouchableOpacity
            style={[styles.btn, styles.btnCancelar]}
            onPress={cancelarEdicao}
          >
            <Text style={styles.btnText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, styles.btnReload]}
            onPress={carregarAnotacoes}
          >
            <Text style={styles.btnText}>Recarregar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={listaAnotacoes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        style={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma anotação salva ainda...</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#111",
    paddingTop: 50,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
    color: "#FF00FF", // Neon pink
    fontFamily: "Courier New", // Retro font
  },
  contador: {
    fontSize: 14,
    color: "#00FF00", // Neon green
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Courier New", // Retro font
  },
  input: {
    backgroundColor: "#222",
    borderColor: "#FF00FF", // Neon pink
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Courier New", // Retro font
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnSalvar: {
    backgroundColor: "#FF00FF", // Neon pink
  },
  btnReload: {
    backgroundColor: "#00FF00", // Neon green
  },
  btnCancelar: {
    backgroundColor: "#888888", // Light grey
  },
  btnEdit: {
    backgroundColor: "#00FFFF", // Neon blue
  },
  btnDelete: {
    backgroundColor: "#FF4444", // Neon red
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Courier New", // Retro font
  },
  lista: {
    flex: 1,
  },
  card: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  itemData: {
    fontSize: 12,
    color: "#00FFFF", // Neon blue
    marginBottom: 6,
    fontFamily: "Courier New", // Retro font
  },
  itemTexto: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Courier New", // Retro font
  },
  itemButtons: {
    flexDirection: "column",
    marginLeft: 10,
  },
  vazio: {
    textAlign: "center",
    marginTop: 30,
    color: "#00FF00", // Neon green
    fontSize: 16,
    fontFamily: "Courier New", // Retro font
  },
});
