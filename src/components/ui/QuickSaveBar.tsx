import { useState } from 'react';
import { ClipboardPaste, Link2, Plus } from 'lucide-react-native';
import { Alert, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { IconButton } from '@/src/components/ui/IconButton';
import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

type QuickSaveBarProps = { onSave: (url: string) => Promise<{ duplicate: boolean }> };

export function QuickSaveBar({ onSave }: QuickSaveBarProps): React.JSX.Element {
  const { colors } = useTheme();
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function paste(): Promise<void> {
    const clipboard = await Clipboard.getStringAsync();
    setValue(clipboard);
  }

  async function save(): Promise<void> {
    if (!value.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const result = await onSave(value);
      setValue('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(result.duplicate ? 'Ya estaba guardado' : 'Guardado en Inbox', result.duplicate ? 'El enlace ya existe en tu biblioteca.' : 'Puedes revisarlo cuando quieras.');
    } catch (error) {
      Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intenta nuevamente.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <AppText variant="label">Quick Save</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 18, paddingLeft: 14, paddingRight: 5, minHeight: 58 }}>
        <Link2 size={20} color={colors.primary} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Pega un enlace para guardarlo…"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={save}
          style={{ flex: 1, color: colors.text, fontSize: 15, paddingHorizontal: 10, minHeight: 52 }}
          accessibilityLabel="URL del enlace"
        />
        <IconButton icon={ClipboardPaste} label="Pegar desde el portapapeles" onPress={paste} />
        <IconButton icon={Plus} label="Guardar enlace" tone="primary" onPress={save} disabled={!value.trim() || isSaving} />
      </View>
    </View>
  );
}
