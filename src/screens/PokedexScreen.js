import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomTabs from '../components/BottomTabs';
import PokemonDetails from '../components/PokemonDetails';
import PokemonGallery from '../components/PokemonGallery';
import GameDetails from '../components/GameDetails';
import GameGallery from '../components/GameGallery';
import SearchBar from '../components/SearchBar';
import { INITIAL_GAME } from '../constants/freetogame';
import { INITIAL_POKEMON } from '../constants/pokemon';
import { fetchGameByQuery } from '../services/juegosApi';
import { fetchPokemonByQuery } from '../services/pokemonApi';

export default function PokedexScreen() {
  const insets = useSafeAreaInsets();

  // Estado de búsqueda y de presentación de la pantalla.
  const [query, setQuery] = useState(INITIAL_POKEMON);
  const [gameQuery, setGameQuery] = useState(INITIAL_GAME);
  const [pokemon, setPokemon] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pokedex');

  // Carga un Pokémon y transforma los errores técnicos en mensajes aptos para el usuario.
  async function searchPokemon(value) {
    setLoading(true);
    setError('');
    try {
      const result = await fetchPokemonByQuery(value);
      setPokemon(result);
    } catch (searchError) {
      setPokemon(null);
      setError(searchError.message === 'EMPTY_QUERY'
        ? 'Escribe un nombre o un ID para buscar.'
        : 'No encontramos ese Pokémon. Revisa el nombre o el ID.');
    } finally {
      setLoading(false);
    }
  }

  async function searchGame(value) {
    setGameLoading(true);
    setError('');
    try {
      const result = await fetchGameByQuery(value);
      setGame(result);
    } catch (searchError) {
      setGame(null);
      setError(searchError.message === 'EMPTY_QUERY'
        ? 'Escribe el nombre de un videojuego para buscar.'
        : 'No encontramos ese videojuego en el catálogo de FreeToGame.');
    } finally {
      setGameLoading(false);
    }
  }

  function handleSearch() {
    if (activeTab.startsWith('game')) {
      searchGame(gameQuery);
    } else {
      searchPokemon(query);
    }
  }

  function handleTabChange(nextTab) {
    setActiveTab(nextTab);
    setError('');
    if (nextTab.startsWith('game') && !game) {
      searchGame(gameQuery);
    }
  }

  // La primera carga evita mostrar una pantalla vacía al abrir la aplicación.
  useEffect(() => {
    searchPokemon(INITIAL_POKEMON);
  }, []);

  // La pestaña de favoritos reutiliza el mismo estado local sin otra pantalla de navegación.
  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.aeroGlow, styles.glowTop]} />
        <View style={[styles.aeroGlow, styles.glowBottom]} />
        <View style={styles.aeroHighlight} />
      </View>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{activeTab.startsWith('game') ? 'VIDEOJUEGOS / FREETOGAME' : 'POKÉDEX / 001'}</Text>
          <Text style={styles.title}>{activeTab.startsWith('game') ? 'descubre nuevos mundos.' : 'son muchos y conozco pocos.'}</Text>
        </View>
        <View style={styles.headerMark}>
          <View style={styles.headerMarkDot} />
        </View>
      </View>
      {/* SearchBar recibe el texto y devuelve la acción de buscar mediante callbacks. */}
      <SearchBar
        onChangeQuery={activeTab.startsWith('game') ? setGameQuery : setQuery}
        onSearch={handleSearch}
        placeholder={activeTab.startsWith('game') ? 'Nombre del videojuego...' : 'Nombre o ID...'}
        query={activeTab.startsWith('game') ? gameQuery : query}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'pokedex' && <PokemonGallery loading={loading} pokemon={pokemon} />}
        {activeTab === 'pokemon-info' && <PokemonDetails loading={loading} pokemon={pokemon} />}
        {activeTab === 'games' && <GameGallery game={game} loading={gameLoading} />}
        {activeTab === 'game-info' && <GameDetails game={game} loading={gameLoading} />}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={19} color="#d86a5d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
      <BottomTabs activeTab={activeTab} onChangeTab={handleTabChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#d9edf8', flex: 1, overflow: 'hidden', paddingHorizontal: 20 },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  aeroGlow: { borderRadius: 180, position: 'absolute' },
  glowTop: { backgroundColor: 'rgba(255, 255, 255, 0.62)', height: 270, right: -95, top: -95, width: 270 },
  glowBottom: { backgroundColor: 'rgba(99, 181, 225, 0.32)', bottom: -125, height: 300, left: -120, width: 300 },
  aeroHighlight: { backgroundColor: 'rgba(255, 255, 255, 0.32)', height: 1, left: 0, position: 'absolute', right: 0, top: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 18, paddingTop: 14 },
  eyebrow: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#123247', fontSize: 27, fontWeight: '900', letterSpacing: 0 },
  headerMark: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.36)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, borderWidth: 1.5, height: 38, justifyContent: 'center', shadowColor: '#39738e', shadowOpacity: 0.2, shadowRadius: 8, width: 38 },
  headerMarkDot: { backgroundColor: '#f05d4f', borderRadius: 8, height: 16, width: 16 },
  content: { paddingBottom: 14 },
  errorBox: { alignItems: 'center', backgroundColor: 'rgba(255, 235, 232, 0.86)', borderColor: '#d86a5d', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', gap: 8, marginTop: 16, padding: 13 },
  errorText: { color: '#8d3329', flex: 1, fontSize: 13, fontWeight: '700' },
});
