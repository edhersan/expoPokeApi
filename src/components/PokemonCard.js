import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

// Los IDs de PokéAPI se muestran siempre con tres dígitos en la tarjeta.
function formatLabel(value) {
  return String(value).padStart(3, '0');
}

function StatBlock({ label, value, icon }) {
  return (
    <View style={styles.statBlock}>
      <View style={styles.statHeading}>
        <Ionicons name={icon} size={15} color="#275972" />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function MoveBlock({ number, name }) {
  return (
    <View style={styles.moveBlock}>
      <Text style={styles.moveNumber}>MOVE {number}</Text>
      <Text numberOfLines={1} style={styles.moveName}>
        {name.replaceAll('-', ' ')}
      </Text>
    </View>
  );
}

export default function PokemonCard({ favorite, loading, onToggleFavorite, pokemon }) {
  // PokéAPI ofrece dos fuentes: preferimos el artwork oficial y usamos el sprite como respaldo.
  const imageUri = pokemon?.sprites?.other?.['official-artwork']?.front_default
    || pokemon?.sprites?.front_default;

  // El requisito de la tarjeta es mostrar exactamente los dos primeros movimientos.
  const moves = pokemon?.moves?.slice(0, 2) || [];

  return (
    <>
      <View style={styles.cardHeader}>
        <Text style={styles.cardKicker}>SPECIMEN</Text>
        {pokemon && <Text style={styles.cardId}>#{formatLabel(pokemon.id)}</Text>}
      </View>
      <View style={styles.imageFrame}>
        {loading ? (
          <ActivityIndicator color="#111111" size="large" />
        ) : imageUri ? (
          <Image accessibilityLabel={`Imagen de ${pokemon.name}`} source={{ uri: imageUri }} style={styles.pokemonImage} />
        ) : null}
        {!loading && pokemon && (
          <Pressable
            accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            accessibilityRole="button"
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
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
  imageFrame: { alignItems: 'center', backgroundColor: 'rgba(235, 248, 255, 0.56)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 18, borderWidth: 1.5, height: 285, justifyContent: 'center', overflow: 'hidden', position: 'relative', shadowColor: '#3b7892', shadowOpacity: 0.2, shadowRadius: 12 },
  pokemonImage: { height: '88%', resizeMode: 'contain', width: '88%' },
  favoriteButton: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.72)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 20, borderWidth: 1.5, height: 40, justifyContent: 'center', position: 'absolute', right: 12, shadowColor: '#3b7892', shadowOpacity: 0.2, shadowRadius: 6, top: 12, width: 40 },
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
