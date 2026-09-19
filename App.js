import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://pokeapi.co/api/v2/pokemon/';
const INITIAL_POKEMON = 'pikachu';

function formatLabel(value) {
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import PokedexScreen from './src/screens/PokedexScreen';

// App.js es el punto de entrada que Expo carga en Android e iOS.
// La pantalla y la lógica viven en src para mantener este archivo pequeño.
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f1e8" />
        <PokedexScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView evita que el contenido quede debajo del notch o de la barra de estado.
  safeArea: { flex: 1, backgroundColor: '#f5f1e8' },
});
    borderRadius: 18,
    borderWidth: 3,
    height: 285,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  pokemonImage: { height: '88%', resizeMode: 'contain', width: '88%' },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderColor: '#111111',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
  },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 10, paddingVertical: 14 },
  pokemonName: { color: '#111111', fontSize: 25, fontWeight: '900', textTransform: 'capitalize' },
  pokemonType: { color: '#77736a', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detailsGrid: { borderColor: '#111111', borderRadius: 14, borderWidth: 2, flexDirection: 'row', overflow: 'hidden' },
  detailsColumn: { flex: 1 },
  statBlock: { borderBottomColor: '#111111', borderBottomWidth: 1, minHeight: 83, padding: 13 },
  statHeading: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  statLabel: { color: '#6a665d', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  statValue: { color: '#111111', fontSize: 20, fontWeight: '900', marginTop: 8 },
  moveBlock: { borderBottomColor: '#111111', borderBottomWidth: 1, minHeight: 83, padding: 13 },
  moveNumber: { color: '#6a665d', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  moveName: { color: '#111111', fontSize: 16, fontWeight: '800', marginTop: 10, textTransform: 'capitalize' },
  errorBox: { alignItems: 'center', backgroundColor: '#f8ddd7', borderColor: '#a52b1f', borderRadius: 12, borderWidth: 2, flexDirection: 'row', gap: 8, marginTop: 16, padding: 13 },
  errorText: { color: '#7c2017', flex: 1, fontSize: 13, fontWeight: '700' },
  emptyState: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 70 },
  emptyTitle: { color: '#111111', fontSize: 23, fontWeight: '900', marginTop: 14 },
  emptyCopy: { color: '#6a665d', fontSize: 14, marginTop: 7, textAlign: 'center' },
  backButton: { borderColor: '#111111', borderRadius: 10, borderWidth: 2, marginTop: 22, paddingHorizontal: 16, paddingVertical: 12 },
  backButtonText: { color: '#111111', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  bottomBar: { flexDirection: 'row', gap: 10, paddingBottom: 12, paddingTop: 12 },
  tab: { alignItems: 'center', borderColor: '#111111', borderRadius: 13, borderWidth: 2, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 49 },
  activeTab: { backgroundColor: '#f4c84b' },
  tabText: { color: '#111111', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
