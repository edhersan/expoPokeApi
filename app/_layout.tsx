import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet } from 'react-native';
import { GameSearchProvider } from '@/context/GameSearchContext';
import { PokemonSearchProvider } from '@/context/PokemonSearchContext';

export default function RootLayout() {
  return (
    <PokemonSearchProvider>
      <GameSearchProvider>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#d9edf8" />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d9edf8',
  },
});