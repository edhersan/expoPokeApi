import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

// Componente controlado: la pantalla conserva el texto y recibe el evento de búsqueda.
export default function SearchBar({ onChangeQuery, onSearch, query }) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={19} color="#111111" />
        <TextInput
          accessibilityLabel="Buscar Pokémon por nombre o ID"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSearch}
          placeholder="Nombre o ID..."
          placeholderTextColor="#77736a"
          returnKeyType="search"
          style={styles.input}
          value={query}
        />
      </View>
      <Pressable
        accessibilityLabel="Buscar Pokémon"
        accessibilityRole="button"
        onPress={onSearch}
        style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-forward" size={22} color="#f5f1e8" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Input y botón comparten una fila para conservar el patrón del wireframe.
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderColor: '#111111',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 9,
    height: 52,
    paddingHorizontal: 14,
  },
  input: { color: '#111111', flex: 1, fontSize: 16, fontWeight: '600', height: '100%' },
  searchButton: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 55,
  },
  pressed: { opacity: 0.7 },
});
