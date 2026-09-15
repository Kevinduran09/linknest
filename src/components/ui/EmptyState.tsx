import { View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

type EmptyStateProps = { title: string; description: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 10 }}>
      <View style={{ width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.primary}18` }}>
        <Bookmark size={26} color={colors.primary} />
      </View>
      <AppText variant="h2" style={{ textAlign: 'center', marginTop: 4 }}>{title}</AppText>
      <AppText muted style={{ textAlign: 'center', maxWidth: 290 }}>{description}</AppText>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

