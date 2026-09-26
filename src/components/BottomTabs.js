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
        <Text style={styles.tabText}>POKÉDEX</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'favorites' }}
        onPress={() => onChangeTab('favorites')}
        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
      >
        <Ionicons name="heart-outline" size={17} color="#275972" />
        <Text style={styles.tabText}>FAVORITOS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: { flexDirection: 'row', gap: 10, paddingBottom: 12, paddingTop: 12 },
  tab: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.42)', borderColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 13, borderWidth: 1.5, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', minHeight: 49 },
  activeTab: { backgroundColor: 'rgba(255, 255, 255, 0.78)', borderColor: '#ffffff' },
  tabText: { color: '#275972', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
