import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomTabs from '../components/BottomTabs';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';
import { INITIAL_POKEMON } from '../constants/pokemon';
import { fetchPokemonByQuery } from '../services/pokemonApi';

export default function PokedexScreen() {
  const insets = useSafeAreaInsets();

  // Estado de búsqueda y de presentación de la pantalla.
  const [query, setQuery] = useState(INITIAL_POKEMON);
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pokedex');
  const [favorite, setFavorite] = useState(false);

  // Carga un Pokémon y transforma los errores técnicos en mensajes aptos para el usuario.
  async function searchPokemon(value) {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPokemonByQuery(value);
      setPokemon(result);
      setFavorite(false);
    } catch (searchError) {
      setPokemon(null);
      setError(searchError.message === 'EMPTY_QUERY'
        ? 'Escribe un nombre o un ID para buscar.'
        : 'No encontramos ese Pokémon. Revisa el nombre o el ID.');
    } finally {
      setLoading(false);
    }
  }

  // La primera carga evita mostrar una pantalla vacía al abrir la aplicación.
  useEffect(() => {
    searchPokemon(INITIAL_POKEMON);
  }, []);

  // La pestaña de favoritos reutiliza el mismo estado local sin otra pantalla de navegación.
  const isFavoritesTab = activeTab === 'favorites';

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>POKÉDEX / 001</Text>
          <Text style={styles.title}>Gotta find 'em all.</Text>
        </View>
        <View style={styles.headerMark}>
          <View style={styles.headerMarkDot} />
        </View>
      </View>
      {/* SearchBar recibe el texto y devuelve la acción de buscar mediante callbacks. */}
      <SearchBar onChangeQuery={setQuery} onSearch={() => searchPokemon(query)} query={query} />
      {isFavoritesTab ? (
        // Esta versión mantiene favoritos en memoria durante la sesión actual.
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={40} color="#111111" />
          <Text style={styles.emptyTitle}>Tus favoritos</Text>
          <Text style={styles.emptyCopy}>
            {favorite ? 'Tu Pokémon actual está guardado aquí.' : 'Aún no tienes Pokémon guardados.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* PokemonCard se encarga de la imagen, datos, movimientos y favorito. */}
          <PokemonCard favorite={favorite} loading={loading} onToggleFavorite={() => setFavorite(!favorite)} pokemon={pokemon} />
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={19} color="#a52b1f" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      )}
      <BottomTabs activeTab={activeTab} onChangeTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 18, paddingTop: 14 },
  eyebrow: { color: '#6a665d', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#111111', fontSize: 27, fontWeight: '900', letterSpacing: 0 },
  headerMark: { alignItems: 'center', borderColor: '#111111', borderRadius: 20, borderWidth: 2, height: 38, justifyContent: 'center', width: 38 },
  headerMarkDot: { backgroundColor: '#f04c35', borderRadius: 8, height: 16, width: 16 },
  content: { paddingBottom: 14 },
  errorBox: { alignItems: 'center', backgroundColor: '#f8ddd7', borderColor: '#a52b1f', borderRadius: 12, borderWidth: 2, flexDirection: 'row', gap: 8, marginTop: 16, padding: 13 },
  errorText: { color: '#7c2017', flex: 1, fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 70 },
  emptyTitle: { color: '#111111', fontSize: 23, fontWeight: '900', marginTop: 14 },
  emptyCopy: { color: '#6a665d', fontSize: 14, marginTop: 7, textAlign: 'center' },
});
