import { Link as LinkIcon, MoreHorizontal, Star } from 'lucide-react-native';
import { View } from 'react-native';

import type { Link } from '@/src/domain/link';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppText } from '@/src/components/ui/AppText';
import { IconButton } from '@/src/components/ui/IconButton';
import { LinkPreview } from '@/src/components/ui/LinkPreview';
import { useTheme } from '@/src/theme/ThemeProvider';

type LinkCardProps = {
  link: Link;
  onPress: () => void;
  onLongPress?: () => void;
  onMenu?: () => void;
  compact?: boolean;
};

export function LinkCard({ link, onPress, onLongPress, onMenu, compact = false }: LinkCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const title = link.title?.trim() || link.domain || link.originalUrl;
  return (
    <AppCard pressable={true} onPress={onPress} onLongPress={onLongPress} style={{ overflow: 'hidden' }}>
      {!compact ? <LinkPreview imageUrl={link.imageUrl} domain={link.domain} height={132} /> : null}
      <View style={{ padding: 14, gap: 7 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <LinkIcon size={13} color={colors.muted} />
          <AppText variant="caption" muted numberOfLines={1} style={{ flex: 1 }}>{link.siteName || link.domain}</AppText>
          {link.isFavorite ? <Star size={15} color={colors.gold} fill={colors.gold} /> : null}
          {onMenu ? <IconButton icon={MoreHorizontal} label="Más opciones" onPress={onMenu} style={{ width: 32, height: 32, marginRight: -6 }} /> : null}
        </View>
        <AppText variant="h2" numberOfLines={2}>{title}</AppText>
        {!compact && link.description ? <AppText muted numberOfLines={2}>{link.description}</AppText> : null}
        {link.status === 'PENDING' ? <AppText variant="caption" style={{ color: colors.mint }}>Pendiente de revisar</AppText> : null}
        {link.metadataState === 'FAILED' ? <AppText variant="caption" style={{ color: colors.coral }}>Preview no disponible</AppText> : null}
      </View>
    </AppCard>
  );
}
