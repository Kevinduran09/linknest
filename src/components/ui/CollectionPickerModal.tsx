import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { AppText } from '@/src/components/ui/AppText';
import { CollectionIcon } from '@/src/components/ui/CollectionIcon';
import type { Collection } from '@/src/domain/collection';
import { useTheme } from '@/src/theme/ThemeProvider';

type CollectionPickerModalProps = {
  visible: boolean;
  collections: Collection[];
  currentCollectionId: string | null;
  onSelect: (collection: Collection) => void;
  onClose: () => void;
};

export function CollectionPickerModal({ visible, collections, currentCollectionId, onSelect, onClose }: CollectionPickerModalProps): React.JSX.Element {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000055' }}>
        <Pressable onPress={(event) => event.stopPropagation()} style={{ maxHeight: '72%', backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: Math.max(insets.bottom, 22) }}>
          <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ gap: 3 }}><AppText variant="h1">Mover enlace</AppText><AppText muted>Elige la carpeta de destino</AppText></View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: `${colors.primary}12` }}><X size={22} color={colors.text} /></Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {collections.map((collection) => {
              const current = collection.id === currentCollectionId;
              return <Pressable key={collection.id} disabled={current} onPress={() => onSelect(collection)} style={({ pressed }) => [{ minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: current ? collection.color : colors.border, backgroundColor: current ? `${collection.color}18` : colors.background, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13 }, pressed && { opacity: 0.78 }]}><View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: `${collection.color}28`, alignItems: 'center', justifyContent: 'center' }}><CollectionIcon name={collection.icon} color={collection.color} size={20} /></View><View style={{ flex: 1, gap: 2 }}><AppText variant="h2">{collection.name}</AppText><AppText variant="caption" muted>{collection.linkCount ?? 0} {collection.linkCount === 1 ? 'enlace' : 'enlaces'}</AppText></View>{current ? <AppText variant="caption" style={{ color: collection.color, fontWeight: '700' }}>Actual</AppText> : null}</Pressable>;
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
