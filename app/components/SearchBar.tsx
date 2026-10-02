import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import React from 'react';

interface SearchBarProps {
  onChangeQuery: (text: string) => void;
  onSearch: () => void;
  placeholder: string;
  query: string;
}

function getShadows(): Record<string, any> {
  if (typeof Platform === 'undefined' || !Platform.select) {
    return {};
  }
  return Platform.select({
    ios: { shadowColor: '#1d5068', shadowOpacity: 0.28, shadowRadius: 7, shadowOffset: { width: 0, height: 2 } },
    android: { elevation: 4 },
    web: { boxShadow: '0 2px 7px rgba(29, 80, 104, 0.28)' },
    default: {},
  }) || {};
}

export default function SearchBar({ onChangeQuery, onSearch, placeholder, query }: SearchBarProps) {
  const searchButtonStyle = { ...styles.searchButton, ...getShadows() };

  return (
    <View style={styles.searchRow}>
      <View style={styles.inputWrap}>
        <Ionicons name="search-outline" size={19} color="#275972" />
        <TextInput
          accessibilityLabel="Buscar por nombre"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeQuery}
          onSubmitEditing={onSearch}
          placeholder={placeholder}
          placeholderTextColor="#6b8999"
          returnKeyType="search"
          style={styles.input}
          value={query}
        />
      </View>
      <Pressable
        accessibilityLabel="Buscar"
        accessibilityRole="button"
        onPress={onSearch}
        style={({ pressed }) => [searchButtonStyle, pressed && styles.pressed]}
      >
        <Ionicons name="arrow-forward" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  inputWrap: { alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.64)', borderColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, borderWidth: 1.5, flex: 1, flexDirection: 'row', gap: 9, height: 52, paddingHorizontal: 14 },
  input: { color: '#123247', flex: 1, fontSize: 16, fontWeight: '600', height: '100%' },
  searchButton: { alignItems: 'center', backgroundColor: '#276782', borderRadius: 12, height: 52, justifyContent: 'center', width: 55 },
  pressed: { opacity: 0.7 },
});