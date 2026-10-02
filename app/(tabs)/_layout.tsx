import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#275972',
        tabBarInactiveTintColor: '#6b8999',
        tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: 8 + insets.bottom }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="pokedex"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      <Tabs.Screen
        name="pokemon-info"
        options={{
          title: 'Info Pokémon',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Juegos',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
      <Tabs.Screen
        name="game-info"
        options={{
          title: 'Info Juego',
          tabBarIcon: ({ focused }) => (
            <Ionicons name={focused ? 'game-controller' : 'game-controller-outline'} size={22} color={focused ? '#275972' : '#6b8999'} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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