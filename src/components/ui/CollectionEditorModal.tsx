import { useState } from 'react';
import { Check, X } from 'lucide-react-native';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';

import { AppText } from '@/src/components/ui/AppText';
import { CollectionIcon } from '@/src/components/ui/CollectionIcon';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { COLLECTION_COLORS, COLLECTION_ICONS, type Collection, type CollectionIconName } from '@/src/domain/collection';
import { useTheme } from '@/src/theme/ThemeProvider';

type CollectionEditorModalProps = {
  visible: boolean;
  collection?: Collection | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CollectionEditorModal({ visible, collection = null, onClose, onSaved }: CollectionEditorModalProps): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COLLECTION_COLORS[0]);
  const [icon, setIcon] = useState<CollectionIconName>('folder');
  const [saving, setSaving] = useState(false);

  async function save(): Promise<void> {
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      const repository = new CollectionsRepository(db);
      if (collection) await repository.update(collection.id, { name, color, icon });
      else await repository.create({ name, color, icon });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: '#00000044' }} />
        <View style={{ maxHeight: '88%', backgroundColor: colors.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) }}>
          <View style={{ alignItems: 'center', marginBottom: 8 }}><View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border }} /></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <AppText variant="h1">{collection ? 'Editar colección' : 'Agregar colección'}</AppText>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: `${colors.primary}12` }}><X size={22} color={colors.text} /></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18, paddingTop: 8 }}>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><AppText variant="label">NOMBRE</AppText><AppText variant="caption" muted>{name.length}/40</AppText></View>
              <TextInput value={name} onChangeText={(value) => setName(value.slice(0, 40))} placeholder="Ej. Viajes, ideas, inspiración…" placeholderTextColor={colors.muted} autoFocus={!collection} style={{ color: colors.text, backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 16, minHeight: 54, paddingHorizontal: 16, fontSize: 15 }} />
            </View>
            <View style={{ gap: 10 }}>
              <AppText variant="label">COLOR</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
                {COLLECTION_COLORS.map((item) => <Pressable key={item} onPress={() => setColor(item)} accessibilityRole="button" accessibilityLabel={`Elegir color ${item}`} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: item, alignItems: 'center', justifyContent: 'center', borderWidth: color === item ? 3 : 1, borderColor: color === item ? colors.text : colors.border }}>{color === item ? <Check size={17} color={item === '#202124' ? '#FFFFFF' : colors.text} strokeWidth={3} /> : null}</Pressable>)}
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <AppText variant="label">ICONO</AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 }}>
                {COLLECTION_ICONS.map((item) => { const selected = icon === item; return <Pressable key={item} onPress={() => setIcon(item)} accessibilityRole="button" accessibilityLabel={`Elegir icono ${item}`} style={{ width: 44, height: 42, borderRadius: 12, backgroundColor: selected ? `${color}22` : colors.background, borderWidth: 1, borderColor: selected ? color : colors.border, alignItems: 'center', justifyContent: 'center' }}><CollectionIcon name={item} color={selected ? color : colors.text} size={21} /></Pressable>; })}
              </View>
            </View>
            <Pressable onPress={() => void save()} disabled={!name.trim() || saving} accessibilityRole="button" style={({ pressed }) => [{ minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: name.trim() ? color : colors.border }, pressed && { opacity: 0.85 }]}><AppText style={{ color: name.trim() ? '#FFFFFF' : colors.muted, fontWeight: '700' }}>{saving ? 'Guardando…' : collection ? 'Guardar cambios' : 'Crear colección'}</AppText></Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
