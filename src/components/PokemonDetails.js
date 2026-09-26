import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function PokemonDetails({ loading, pokemon }) {
  const moves = pokemon?.moves?.slice(0, 4) || [];

  if (loading || !pokemon) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Cargando ficha...</Text></View>;
  }

  return (
    <View style={styles.details}>
      <Text style={styles.kicker}>PERFIL DEL POKEMON</Text>
      <Text style={styles.name}>{pokemon.name}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="resize-outline" size={18} color="#275972" />
          <Text style={styles.statLabel}>ALTURA</Text>
          <Text style={styles.statValue}>{pokemon.height / 10} m</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="barbell-outline" size={18} color="#275972" />
          <Text style={styles.statLabel}>PESO</Text>
          <Text style={styles.statValue}>{pokemon.weight / 10} kg</Text>
        </View>
      </View>
      <Text style={styles.description}>{pokemon.description}</Text>
      <View style={styles.attackHeader}>
        <Text style={styles.sectionTitle}>ATAQUES</Text>
        <Ionicons name="flash-outline" size={18} color="#275972" />
      </View>
      <View style={styles.movesGrid}>
        {moves.map((move, index) => (
          <View key={move.move.name} style={styles.moveCard}>
            <Text style={styles.moveNumber}>0{index + 1}</Text>
            <Text style={styles.moveName}>{move.move.name.replaceAll('-', ' ')}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  details: { flex: 1 },
  empty: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  emptyText: { color: '#4e7184', fontSize: 15, fontWeight: '700' },
  kicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  name: { color: '#123247', fontSize: 31, fontWeight: '900', marginBottom: 14, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, flex: 1, padding: 13 },
  statLabel: { color: '#4e7184', fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 8 },
  statValue: { color: '#123247', fontSize: 20, fontWeight: '900', marginTop: 5 },
  description: { backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, color: '#31586d', fontSize: 16, lineHeight: 24, padding: 17 },
  attackHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginTop: 22 },
  sectionTitle: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  movesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moveCard: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, minHeight: 84, padding: 13, width: '48%' },
  moveNumber: { color: '#6b93a6', fontSize: 11, fontWeight: '900' },
  moveName: { color: '#123247', fontSize: 15, fontWeight: '800', marginTop: 11, textTransform: 'capitalize' },
});