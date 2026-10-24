// ──────────────────────────────────────────────────────────────
// ARCHIVO:  components/ui/SegmentedControl.tsx
// FUNCIÓN:  Control segmentado simple para selección de opciones
// USADO POR: app/(tabs)/chat.tsx
// ──────────────────────────────────────────────────────────────

import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Option {
  value: number;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: number;
  onChange: (value: number) => void;
  style?: any;
}

export default function SegmentedControl({ options, value, onChange, style }: SegmentedControlProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt, i) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[
            styles.button,
            i === 0 && styles.buttonFirst,
            i === options.length - 1 && styles.buttonLast,
            value === opt.value && styles.buttonActive,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.buttonText,
              value === opt.value && styles.buttonTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 12 },
  button: { alignItems: 'center', flex: 1, paddingHorizontal: 2, paddingVertical: 8 },
  buttonFirst: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  buttonLast: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  buttonActive: { backgroundColor: '#275972' },
  buttonText: { color: '#275972', fontSize: 11, fontWeight: '700' },
  buttonTextActive: { color: '#fff' },
});