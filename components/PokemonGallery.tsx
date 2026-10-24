// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/components/PokemonGallery.tsx
// FUNCIÓN:  Galería de imágenes del Pokémon buscado (portada + sprites)
// USADO POR: app/(tabs)/pokedex.tsx
// CAMBIOS:  nº de fotos mostradas → .slice(0, 3) | orden de imágenes → array `images` |
//           altura de las tarjetas → styles.imageCard / styles.featuredImage
// ──────────────────────────────────────────────────────────────

import { Platform, ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Pokemon } from '@/types';

interface PokemonGalleryProps {
  pokemon: Pokemon | null;
  loading: boolean;
}

// Sombras de las tarjetas de imagen, adaptadas por plataforma
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

export default function PokemonGallery({ loading, pokemon }: PokemonGalleryProps) {
  // Selección de imágenes por prioridad: arte oficial → frontal → shiny → dorso → dream world
  // Se descartan las nulas y se muestran máximo 3
  const images = [
    pokemon?.sprites?.other?.['official-artwork']?.front_default,
    pokemon?.sprites?.front_default,
    pokemon?.sprites?.front_shiny,
    pokemon?.sprites?.back_default,
    pokemon?.sprites?.other?.dream_world?.front_default,
  ].filter((img): img is string => Boolean(img)).slice(0, 3);

  const imageCardStyle = { ...styles.imageCard, ...getImageCardShadows() };

  return (
    <View style={styles.gallery}>
      {/* Encabezado de la sección: título + número de Pokédex */}
      <View style={styles.galleryHeader}>
        <Text style={styles.kicker}>FOTOS DEL POKEMON</Text>
        {pokemon && <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>}
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color="#275972" size="large" /></View>
      ) : (
        <View style={styles.imageGrid}>
          {/* La primera imagen es la destacada (más grande); el rótulo depende del índice */}
          {images.map((image, index) => (
            <View key={image} style={[imageCardStyle, index === 0 && styles.featuredImage]}>
              <Image
                accessibilityLabel={`Imagen ${index + 1} de ${pokemon?.name}`}
                resizeMode="contain"
                source={{ uri: image }}
                style={styles.imageStyle}
              />
              <Text style={styles.imageLabel}>{index === 0 ? 'OFFICIAL ARTWORK' : index === 1 ? 'NORMAL SPRITE' : 'ALTERNATIVE SPRITE'}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── [SECCIÓN] Estilos ───
const styles = StyleSheet.create({
  gallery: { flex: 1 },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kicker: { color: '#35627a', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  id: { color: '#4e7184', fontSize: 12, fontWeight: '800' },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  imageGrid: { gap: 12 },
  imageCard: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 16, borderWidth: 1.5, height: 140, justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  featuredImage: { height: 245 },
  imageStyle: { height: '78%', width: '78%' },
  imageLabel: { bottom: 10, color: '#4e7184', fontSize: 9, fontWeight: '900', letterSpacing: 1.1, position: 'absolute' },
});
