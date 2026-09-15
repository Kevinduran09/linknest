import { ArrowRight, Inbox } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { AppText } from '@/src/components/ui/AppText';
import { useTheme } from '@/src/theme/ThemeProvider';

type InboxBannerProps = { count: number; onPress: () => void };

export function InboxBanner({ count, onPress }: InboxBannerProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, backgroundColor: `${colors.mint}22` }, pressed && { opacity: 0.8 }]}>
      <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}>
        <Inbox size={22} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="h2">Tu Inbox está listo</AppText>
        <AppText muted>{count} {count === 1 ? 'enlace espera' : 'enlaces esperan'} revisión</AppText>
      </View>
      <ArrowRight size={21} color={colors.text} />
    </Pressable>
  );
}

