import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';

type ScreenProps = ScrollViewProps & { children: React.ReactNode; scroll?: boolean };

export function Screen({ children, scroll = true, contentContainerStyle, ...props }: ScreenProps): React.JSX.Element {
  const { colors } = useTheme();
  const contentStyle = [{ padding: spacing.xl, gap: spacing.xxl, paddingBottom: 40 }, contentContainerStyle];
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: colors.background }}>
      {scroll ? <ScrollView {...props} contentContainerStyle={contentStyle}>{children}</ScrollView> : <View style={{ flex: 1, padding: spacing.xl }}>{children}</View>}
    </SafeAreaView>
  );
}
