import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

// Componente controlado: la pantalla conserva el texto y recibe el evento de búsqueda.
export default function SearchBar({ onChangeQuery, onSearch, placeholder, query }) {
  return (
    <View style={styles.searchRow}>
      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={19} color="#275972" />
        <TextInput
          accessibilityLabel="Buscar Pokémon por nombre o ID"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSearch}
          placeholder={placeholder}
          placeholderTextColor="#6b8999"
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
        <Ionicons name="arrow-forward" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  inputWrap: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.64)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, borderWidth: 1.5, flex: 1, flexDirection: 'row', gap: 9, height: 52, paddingHorizontal: 14 },
  input: { color: '#123247', flex: 1, fontSize: 16, fontWeight: '600', height: '100%' },
  searchButton: { alignItems: 'center', backgroundColor: '#276782', borderRadius: 12, height: 52, justifyContent: 'center', shadowColor: '#1d5068', shadowOpacity: 0.28, shadowRadius: 7, width: 55 },
  pressed: { opacity: 0.7 },
});
