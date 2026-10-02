import { Ionicons } from '@expo/vector-icons';
import { Platform, ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Pokemon } from '../types';

interface PokemonCardProps {
  pokemon: Pokemon | null;
  loading: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
}

function formatLabel(value: number): string {
  return String(value).padStart(3, '0');
}

function StatBlock({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statBlock}>
      <View style={styles.statHeading}>
        <Ionicons name={icon as any} size={15} color="#275972" />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MoveBlock({ number, name }: { number: number; name: string }) {
  return (
    <View style={styles.moveBlock}>
      <Text style={styles.moveNumber}>MOVE {number}</Text>
      <Text numberOfLines={1} style={styles.moveName}>
        {name.replace(/-/g, ' ')}
      </Text>
    </View>
  );
}

function getShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#3b7892', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 6 },
    web: { boxShadow: '0 4px 12px rgba(59, 120, 146, 0.2)' },
    default: {},
  }) || {};
}

function getFavoriteButtonShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#3b7892', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 3 },
    web: { boxShadow: '0 2px 6px rgba(59, 120, 146, 0.2)' },
    default: {},
  }) || {};
}

export default function PokemonCard({ favorite, loading, onToggleFavorite, pokemon }: PokemonCardProps) {
  const imageUri = pokemon?.sprites?.other?.['official-artwork']?.front_default
    || pokemon?.sprites?.front_default;

  const moves = pokemon?.moves?.slice(0, 2) || [];

  const imageFrameStyle = { ...styles.imageFrame, ...getShadows() };
  const favoriteButtonStyle = { ...styles.favoriteButton, ...getFavoriteButtonShadows() };

  return (
    <>
      <View style={styles.cardHeader}>
        <Text style={styles.cardKicker}>SPECIMEN</Text>
        {pokemon && <Text style={styles.cardId}>#{formatLabel(pokemon.id)}</Text>}
      </View>
      <View style={imageFrameStyle}>
        {loading ? (
          <ActivityIndicator color="#111111" size="large" />
        ) : imageUri ? (
          <Image accessibilityLabel={`Imagen de ${pokemon?.name}`} resizeMode="contain" source={{ uri: imageUri }} style={styles.pokemonImage} />
        ) : null}
        {!loading && pokemon && (
          <Pressable
            accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            accessibilityRole="button"
            onPress={onToggleFavorite}
            style={({ pressed }) => [favoriteButtonStyle, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color="#111111" />
          </Pressable>
        )}
      </View>
      {pokemon && (
        <>
          <View style={styles.nameRow}>
            <Text style={styles.pokemonName}>{pokemon.name}</Text>
            <Text style={styles.pokemonType}>NORMAL DATA</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailsColumn}>
              <StatBlock icon="resize-outline" label="ALTURA" value={`${pokemon.height / 10} m`} />
              <StatBlock icon="barbell-outline" label="PESO" value={`${pokemon.weight / 10} kg`} />
            </View>
            <View style={styles.detailsColumn}>
              {moves.map((move, index) => (
                <MoveBlock key={move.move.name} number={index + 1} name={move.move.name} />
              ))}
            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardKicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  cardId: { color: '#4e7184', fontSize: 12, fontWeight: '800' },
  imageFrame: { alignItems: 'center', backgroundColor: 'rgba(235, 248, 255, 0.56)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, borderWidth: 1.5, height: 285, justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  pokemonImage: { height: '88%', width: '88%' },
  favoriteButton: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.72)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, borderWidth: 1.5, height: 40, justifyContent: 'center', position: 'absolute', right: 12, top: 12, width: 40 },
  nameRow: { alignItems: 'baseline', flexDirection: 'row', gap: 10, paddingVertical: 14 },
  pokemonName: { color: '#123247', fontSize: 25, fontWeight: '900', textTransform: 'capitalize' },
  pokemonType: { color: '#4e7184', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detailsGrid: { backgroundColor: 'rgba(255, 255, 255, 0.42)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', overflow: 'hidden' },
  detailsColumn: { flex: 1 },
  statBlock: { borderBottomColor: 'rgba(39, 103, 130, 0.24)', borderBottomWidth: 1, minHeight: 83, padding: 13 },
  statHeading: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  statLabel: { color: '#4e7184', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  statValue: { color: '#123247', fontSize: 20, fontWeight: '900', marginTop: 8 },
  moveBlock: { borderBottomColor: 'rgba(39, 103, 130, 0.24)', borderBottomWidth: 1, minHeight: 83, padding: 13 },
  moveNumber: { color: '#4e7184', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  moveName: { color: '#123247', fontSize: 16, fontWeight: '800', marginTop: 10, textTransform: 'capitalize' },
});