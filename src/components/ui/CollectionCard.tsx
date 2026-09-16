import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { Collection } from '@/src/domain/collection';
import { CollectionIcon } from '@/src/components/ui/CollectionIcon';
import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

type CollectionCardProps = { collection: Collection; onPress: () => void; onLongPress?: () => void };

export function CollectionCard({ collection, onPress, onLongPress }: CollectionCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const tint = collection.color || colors.primary;
  return (
    <Pressable onPress={onPress} onLongPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress?.(); }} delayLongPress={420} style={({ pressed }) => [{ minHeight: 142, padding: 14, paddingTop: 10, borderRadius: 20, backgroundColor: `${tint}18`, borderWidth: 1, borderColor: `${tint}65`, overflow: 'hidden', transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
      <View style={{ width: 62, height: 18, marginLeft: 2, marginBottom: -1, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: tint }} />
      <View style={{ flex: 1, borderRadius: 14, borderTopLeftRadius: 4, backgroundColor: `${tint}35`, padding: 13, justifyContent: 'space-between' }}>
        <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: `${tint}40`, alignItems: 'center', justifyContent: 'center' }}><CollectionIcon name={collection.icon} color={tint} size={23} /></View>
        <View style={{ gap: 2 }}><AppText variant="h2" numberOfLines={1}>{collection.name}</AppText><AppText variant="caption" muted>{collection.linkCount ?? 0} {collection.linkCount === 1 ? 'enlace' : 'enlaces'}</AppText></View>
      </View>
    </Pressable>
  );
}
