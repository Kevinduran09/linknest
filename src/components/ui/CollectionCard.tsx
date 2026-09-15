import { Folder, Inbox } from 'lucide-react-native';
import { View } from 'react-native';

import type { Collection } from '@/src/domain/collection';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

type CollectionCardProps = { collection: Collection; onPress: () => void; onLongPress?: () => void };

export function CollectionCard({ collection, onPress, onLongPress }: CollectionCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const tint = collection.color || colors.primary;
  const Icon = collection.isSystem ? Inbox : Folder;
  return (
    <AppCard pressable={true} onPress={onPress} onLongPress={onLongPress} style={{ padding: 16, minHeight: 128, justifyContent: 'space-between' }}>
      <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: `${tint}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={tint} />
      </View>
      <View style={{ gap: 3 }}>
        <AppText variant="h2" numberOfLines={1}>{collection.name}</AppText>
        <AppText variant="caption" muted>{collection.linkCount ?? 0} {collection.linkCount === 1 ? 'enlace' : 'enlaces'}</AppText>
      </View>
    </AppCard>
  );
}

