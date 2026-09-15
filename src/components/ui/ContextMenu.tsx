import { Modal, Pressable } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

export type ContextAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  destructive?: boolean;
  onPress: () => void | Promise<void>;
};

type ContextMenuProps = { visible: boolean; title: string; actions: ContextAction[]; onClose: () => void };

export function ContextMenu({ visible, title, actions, onClose }: ContextMenuProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' }}>
        <Pressable onPress={(event) => event.stopPropagation()} style={{ backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 32, gap: 8 }}>
          <AppText variant="h2" style={{ marginBottom: 6 }}>{title}</AppText>
          {actions.map(({ id, label, icon: Icon, destructive, onPress }) => <Pressable key={id} onPress={() => { onClose(); void onPress(); }} style={({ pressed }) => [{ minHeight: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 }, pressed && { backgroundColor: colors.border }]}><Icon size={20} color={destructive ? colors.coral : colors.text} /><AppText style={{ color: destructive ? colors.coral : colors.text }}>{label}</AppText></Pressable>)}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
