import { Ionicons } from '@expo/vector-icons';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '@/components/SearchBar';
import GameDetails from '@/components/GameDetails';
import { useGameSearch } from '@/context/GameSearchContext';

function getHeaderMarkShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#39738e', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 8px rgba(57, 115, 142, 0.2)' },
    default: {},
  }) || {};
}

export default function GameInfoScreen() {
  const insets = useSafeAreaInsets();
  const { query, game, loading, error, setQuery, searchGame } = useGameSearch();

  const headerMarkStyle = { ...styles.headerMark, ...getHeaderMarkShadows() };

  function handleSearch() {
    void searchGame();
  }

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View pointerEvents="none" style={styles.backgroundLayer}>
        <View style={[styles.aeroGlow, styles.glowTop]} />
        <View style={[styles.aeroGlow, styles.glowBottom]} />
        <View style={styles.aeroHighlight} />
      </View>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>VIDEOJUEGOS / INFO</Text>
          <Text style={styles.title}>ficha técnica del juego.</Text>
        </View>
        <View style={headerMarkStyle}>
          <View style={styles.headerMarkDot} />
        </View>
      </View>
      <SearchBar
        onChangeQuery={setQuery}
        onSearch={handleSearch}
        placeholder="Nombre del videojuego..."
        query={query}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GameDetails game={game} loading={loading} />
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={19} color="#d86a5d" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#d9edf8', flex: 1, overflow: 'hidden', paddingHorizontal: 20 },
  backgroundLayer: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  aeroGlow: { borderRadius: 180, position: 'absolute' },
  glowTop: { backgroundColor: 'rgba(255, 255, 255, 0.62)', height: 270, right: -95, top: -95, width: 270 },
  glowBottom: { backgroundColor: 'rgba(99, 181, 225, 0.32)', bottom: -125, height: 300, left: -120, width: 300 },
  aeroHighlight: { backgroundColor: 'rgba(255, 255, 255, 0.32)', height: 1, left: 0, position: 'absolute', right: 0, top: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 18, paddingTop: 14 },
  eyebrow: { color: '#35627a', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#123247', fontSize: 27, fontWeight: '900', letterSpacing: 0 },
  headerMark: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.36)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 20, borderWidth: 1.5, height: 38, justifyContent: 'center', width: 38 },
  headerMarkDot: { backgroundColor: '#f05d4f', borderRadius: 8, height: 16, width: 16 },
  content: { paddingBottom: 14 },
  errorBox: { alignItems: 'center', backgroundColor: 'rgba(255, 235, 232, 0.86)', borderColor: '#d86a5d', borderRadius: 12, borderWidth: 1.5, flexDirection: 'row', gap: 8, marginTop: 16, padding: 13 },
  errorText: { color: '#8d3329', flex: 1, fontSize: 13, fontWeight: '700' },
});