import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function GameDetails({ game, loading }) {
  if (loading || !game) {
    return <View style={styles.empty}><Text style={styles.emptyText}>Cargando ficha del juego...</Text></View>;
  }

  return (
    <View style={styles.details}>
      <Text style={styles.kicker}>PERFIL DEL VIDEOJUEGO</Text>
      <Text style={styles.name}>{game.name}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaCard}>
          <Ionicons name="calendar-outline" size={18} color="#275972" />
          <Text style={styles.metaLabel}>LANZAMIENTO</Text>
          <Text style={styles.metaValue}>{game.released || 'Sin fecha'}</Text>
        </View>
        <View style={styles.metaCard}>
          <Ionicons name="code-slash-outline" size={18} color="#275972" />
          <Text style={styles.metaLabel}>DESARROLLADOR</Text>
          <Text numberOfLines={2} style={styles.metaValue}>{game.developer}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>DESCRIPCION</Text>
      <ScrollView nestedScrollEnabled style={styles.descriptionBox}>
        <Text style={styles.description}>{game.description}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  details: { flex: 1 },
  empty: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  emptyText: { color: '#4e7184', fontSize: 15, fontWeight: '700' },
  kicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  name: { color: '#123247', fontSize: 30, fontWeight: '900', marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metaCard: { backgroundColor: 'rgba(255, 255, 255, 0.58)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 14, borderWidth: 1.5, flex: 1, minHeight: 112, padding: 13 },
  metaLabel: { color: '#4e7184', fontSize: 9, fontWeight: '900', letterSpacing: 1, marginTop: 8 },
  metaValue: { color: '#123247', fontSize: 15, fontWeight: '800', marginTop: 6 },
  sectionTitle: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginBottom: 10 },
  descriptionBox: { backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, maxHeight: 310, padding: 17 },
  description: { color: '#31586d', fontSize: 16, lineHeight: 24 },
});