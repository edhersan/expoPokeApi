import { Platform, ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Game } from '../types';

interface GameGalleryProps {
  game: Game | null;
  loading: boolean;
}

function getImageCardShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#3b7892', shadowOpacity: 0.16, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 8px rgba(59, 120, 146, 0.16)' },
    default: {},
  }) || {};
}

export default function GameGallery({ game, loading }: GameGalleryProps) {
  const imageCardStyle = { ...styles.imageCard, ...getImageCardShadows() };
  return (
    <View style={styles.gallery}>
      <View style={styles.galleryHeader}>
        <Text style={styles.kicker}>ARCHIVO DE JUEGO</Text>
        {game && <Text style={styles.id}>GIANTBOMB / {game.id}</Text>}
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color="#275972" size="large" /></View>
      ) : (
        <View style={styles.imageGrid}>
          {(game?.images || []).map((image, index) => (
            <View key={image} style={[imageCardStyle, index === 0 && styles.featuredImage]}>
              <Image
                accessibilityLabel={`Imagen ${index + 1} de ${game?.name}`}
                resizeMode="cover"
                source={{ uri: image }}
                style={styles.imageStyle}
              />
              <Text style={styles.imageLabel}>{index === 0 ? 'PORTADA' : `CAPTURA 0${index}`}</Text>
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
  imageCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, height: 140, justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  featuredImage: { height: 245 },
  imageStyle: { height: '100%', width: '100%' },
  imageLabel: { backgroundColor: 'rgba(217, 237, 248, 0.82)', bottom: 10, color: '#35627a', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, paddingHorizontal: 8, paddingVertical: 4, position: 'absolute' },
});