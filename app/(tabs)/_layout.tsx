// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/(tabs)/_layout.tsx
// FUNCIÓN:  Barra de pestañas inferior (define las 5 secciones de la app)
// DEPENDE:  react-native-safe-area-context (insets para el home indicator)
// USADO POR: app/_layout.tsx monta esta ruta como "(tabs)"
// CAMBIOS:  AGREGAR/QUITAR PESTAÑA → bloque <Tabs.Screen> | colores activo/inactivo →
//           tabBarActiveTintColor / tabBarInactiveTintColor | iconos → librería Ionicons
// ──────────────────────────────────────────────────────────────

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  // Altura extra del sistema (home indicator de iPhone, etc.)
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Paleta de la barra: azul petróleo activo / gris azulado inactivo
        tabBarActiveTintColor: '#275972',
        tabBarInactiveTintColor: '#6b8999',
        tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      {/* ─── [PESTAÑA 1] Pokédex → galería de fotos del Pokémon buscado ─── */}
      <Tabs.Screen
        name="pokedex"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      {/* ─── [PESTAÑA 2] Info Pokémon → ficha técnica (altura, peso, ataques) ─── */}
      <Tabs.Screen
        name="pokemon-info"
        options={{
          title: 'Info Pokémon',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      {/* ─── [PESTAÑA 3] Juegos → galería de imágenes del videojuego buscado ─── */}
      <Tabs.Screen
        name="games"
        options={{
          title: 'Juegos',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      {/* ─── [PESTAÑA 4] Info Juego → ficha técnica del videojuego ─── */}
      <Tabs.Screen
        name="game-info"
        options={{
          title: 'Info Juego',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'game-controller' : 'game-controller-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      {/* ─── [PESTAÑA 5] Profesor → directorio de docentes con alta/edición/baja ─── */}
      <Tabs.Screen
        name="profesor"
        options={{
          title: 'Profesor',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'school' : 'school-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── [SECCIÓN] Estilos ───
const styles = StyleSheet.create({
  // Barra translúcida tipo vidrio con borde superior
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1.5,
    height: 60,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tabIcon: {
    marginBottom: 2,
  },
});
