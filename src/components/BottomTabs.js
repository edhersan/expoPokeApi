import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// La pantalla conserva activeTab; este componente solo pinta y emite el cambio.
export default function BottomTabs({ activeTab, onChangeTab }) {
  return (
    <View style={styles.bottomBar}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'pokedex' }}
        onPress={() => onChangeTab('pokedex')}
        style={[styles.tab, activeTab === 'pokedex' && styles.activeTab]}
      >
        <Ionicons name="grid-outline" size={17} color="#275972" />
        <Text style={styles.tabText}>POKÉMON / FOTOS</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'pokemon-info' }}
        onPress={() => onChangeTab('pokemon-info')}
        style={[styles.tab, activeTab === 'pokemon-info' && styles.activeTab]}
      >
        <Ionicons name="document-text-outline" size={17} color="#275972" />
        <Text style={styles.tabText}>POKÉMON / INFO</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'games' }}
        onPress={() => onChangeTab('games')}
        style={[styles.tab, activeTab === 'games' && styles.activeTab]}
      >
        <Ionicons name="images-outline" size={17} color="#275972" />
        <Text style={styles.tabText}>JUEGOS / FOTOS</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'game-info' }}
        onPress={() => onChangeTab('game-info')}
        style={[styles.tab, activeTab === 'game-info' && styles.activeTab]}
      >
        <Ionicons name="game-controller-outline" size={17} color="#275972" />
        <Text style={styles.tabText}>JUEGOS / INFO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 12, paddingTop: 12 },
  tab: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.46)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 13, borderWidth: 1.5, flexBasis: '48%', flexGrow: 1, flexDirection: 'row', gap: 6, justifyContent: 'center', minHeight: 45 },
  activeTab: { backgroundColor: 'rgba(255, 255, 255, 0.84)' },
  tabText: { color: '#275972', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
});
