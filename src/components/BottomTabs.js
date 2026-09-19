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
        <Ionicons name="grid-outline" size={17} color="#111111" />
        <Text style={styles.tabText}>POKÉDEX</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'favorites' }}
        onPress={() => onChangeTab('favorites')}
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
      >
        <Ionicons name="heart-outline" size={17} color="#111111" />
        <Text style={styles.tabText}>FAVORITOS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { flexDirection: 'row', gap: 10, paddingBottom: 12, paddingTop: 12 },
  tab: { alignItems: 'center', borderColor: '#111111', borderRadius: 13, borderWidth: 2, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 49 },
  activeTab: { backgroundColor: '#f4c84b' },
  tabText: { color: '#111111', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
