import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { COLLECTION_COLORS } from '@/src/domain/collection';
import type { Collection } from '@/src/domain/collection';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function EditCollectionScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COLLECTION_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const next = await new CollectionsRepository(db).getById(id);
    setCollection(next);
    if (next) {
      setName(next.name);
      setColor(next.color);
    }
  }, [db, id]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function save(): Promise<void> {
    if (!collection || !name.trim() || saving) return;
    setSaving(true);
    try {
      await new CollectionsRepository(db).update(collection.id, { name, icon: collection.icon, color });
      router.back();
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  }

  if (!collection) return <Screen><ScreenHeader title="Editar colección" back /><EmptyState title="Colección no encontrada" description="Es posible que haya sido eliminada." actionLabel="Volver" onAction={() => router.back()} /></Screen>;
  if (collection.isSystem) return <Screen><ScreenHeader title="Editar colección" back /><EmptyState title="Colección protegida" description="Unsorted es la colección predeterminada y no se puede editar." actionLabel="Volver" onAction={() => router.back()} /></Screen>;

  return (
    <Screen>
      <ScreenHeader title="Editar colección" subtitle="Actualiza su nombre y color" back />
      <View style={{ gap: 10 }}>
        <AppText variant="label">Nombre</AppText>
        <TextInput value={name} onChangeText={setName} placeholder="Nombre de la colección" placeholderTextColor={colors.muted} autoFocus style={{ color: colors.text, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, minHeight: 54, paddingHorizontal: 16, fontSize: 15 }} />
      </View>
      <View style={{ gap: 12 }}>
        <AppText variant="label">Color</AppText>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {COLLECTION_COLORS.map((item) => <Pressable key={item} onPress={() => setColor(item)} accessibilityRole="button" accessibilityLabel={`Elegir color ${item}`} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: item, alignItems: 'center', justifyContent: 'center', borderWidth: color === item ? 3 : 0, borderColor: colors.text }}>{color === item ? <Check size={20} color="#FFFFFF" /> : null}</Pressable>)}
        </View>
      </View>
      <AppButton label={saving ? 'Guardando…' : 'Guardar cambios'} onPress={() => void save()} disabled={!name.trim() || saving} />
    </Screen>
  );
}
