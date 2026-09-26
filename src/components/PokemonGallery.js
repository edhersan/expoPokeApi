import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function PokemonGallery({ loading, pokemon }) {
  const images = [
    pokemon?.sprites?.other?.['official-artwork']?.front_default,
    pokemon?.sprites?.front_default,
    pokemon?.sprites?.front_shiny,
    pokemon?.sprites?.back_default,
    pokemon?.sprites?.other?.dream_world?.front_default,
  ].filter(Boolean).slice(0, 3);

  return (
    <View style={styles.gallery}>
      <View style={styles.galleryHeader}>
        <Text style={styles.kicker}>FOTOS DEL POKEMON</Text>
        {pokemon && <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>}
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color="#275972" size="large" /></View>
      ) : (
        <View style={styles.imageGrid}>
          {images.map((image, index) => (
            <View key={image} style={[styles.imageCard, index === 0 && styles.featuredImage]}>
              <Image
                accessibilityLabel={`Imagen ${index + 1} de ${pokemon.name}`}
                source={{ uri: image }}
                style={styles.image}
              />
              <Text style={styles.imageLabel}>{index === 0 ? 'OFFICIAL ARTWORK' : index === 1 ? 'NORMAL SPRITE' : 'ALTERNATIVE SPRITE'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gallery: { flex: 1 },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  id: { color: '#4e7184', fontSize: 12, fontWeight: '800' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  imageGrid: { gap: 12 },
  imageCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, height: 140, justifyContent: 'center', overflow: 'hidden', position: 'relative', shadowColor: '#3b7892', shadowOpacity: 0.16, shadowRadius: 8 },
  featuredImage: { height: 245 },
  image: { height: '78%', resizeMode: 'contain', width: '78%' },
  imageLabel: { bottom: 10, color: '#4e7184', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, position: 'absolute' },
});
