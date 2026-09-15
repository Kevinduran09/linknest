import { useState } from 'react';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { useTheme } from '@/src/theme/ThemeProvider';

const palette = ['#665CF6', '#49C7A6', '#FF7A70', '#F3C35A', '#4B9BFF'];

export default function NewCollectionScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(palette[0]);

  async function createCollection(): Promise<void> {
    if (!name.trim()) return;
    await new CollectionsRepository(db).create({ name, icon: 'folder', color });
    router.back();
  }

  return (
    <Screen>
      <ScreenHeader title="Nueva colección" subtitle="Dale un espacio a tus enlaces" back />
      <View style={{ gap: 10 }}>
        <AppText variant="label">Nombre</AppText>
        <TextInput value={name} onChangeText={setName} placeholder="Ej. Ideas para proyectos" placeholderTextColor={colors.muted} autoFocus style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, minHeight: 54, paddingHorizontal: 16, fontSize: 15 }} />
      </View>
      <View style={{ gap: 12 }}>
        <AppText variant="label">Color</AppText>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {palette.map((item) => <Pressable key={item} onPress={() => setColor(item)} accessibilityRole="button" accessibilityLabel={`Elegir color ${item}`} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: item, alignItems: 'center', justifyContent: 'center', borderWidth: color === item ? 3 : 0, borderColor: colors.text }}>{color === item ? <Check size={20} color="#FFFFFF" /> : null}</Pressable>)}
        </View>
      </View>
      <AppButton label="Crear colección" onPress={() => void createCollection()} disabled={!name.trim()} />
    </Screen>
  );
}

