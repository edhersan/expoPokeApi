// ──────────────────────────────────────────────────────────────
// ARCHIVO:  app/_layout.tsx
// FUNCIÓN:  Layout RAÍZ de la app (envuelve todo con providers y el Stack de rutas)
// DEPENDE:  context/PokemonSearchContext.tsx, context/GameSearchContext.tsx
// RUTA:     punto de entrada de expo-router (main → expo-router/entry en package.json)
// CAMBIOS:  agregar un provider global → anidar aquí | color de fondo general → styles.container
// ──────────────────────────────────────────────────────────────

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { GameSearchProvider } from '@/context/GameSearchContext';
import { PokemonSearchProvider } from '@/context/PokemonSearchContext';

export default function RootLayout() {
  return (
    // Providers de estado global: envuelven toda la app para que las pestañas
    // de Pokémon y de Juegos compartan su búsqueda (ver context/*)
    <PokemonSearchProvider>
      <GameSearchProvider>
        {/* SafeAreaProvider: respeta el notch/barra de estado del dispositivo */}
        <SafeAreaProvider>
          {/* Barra de estado del sistema (reloj, batería) en tono oscuro */}
          <StatusBar barStyle="dark-content" backgroundColor="#d9edf8" />
          {/* Stack de navegación: header oculto (cada pantalla trae el suyo propio) */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.container,
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SafeAreaProvider>
      </GameSearchProvider>
    </PokemonSearchProvider>
  );
}

// Estilos: color de fondo base de toda la app (azul claro aero)
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9edf8',
  },
});
