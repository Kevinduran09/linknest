import { Pressable, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';
import { radii } from '@/src/theme/tokens';

type AppButtonProps = Omit<PressableProps, 'style'> & { label: string; variant?: 'primary' | 'secondary' | 'danger'; style?: StyleProp<ViewStyle> };

export function AppButton({ label, variant = 'primary', style, ...props }: AppButtonProps): React.JSX.Element {
  const { colors } = useTheme();
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.coral : colors.surface;
  const foreground = variant === 'secondary' ? colors.text : '#FFFFFF';
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      style={({ pressed }) => [
        { minHeight: 44, paddingHorizontal: 16, borderRadius: radii.button, alignItems: 'center', justifyContent: 'center', backgroundColor, borderWidth: variant === 'secondary' ? 1 : 0, borderColor: colors.border },
        pressed && { opacity: 0.86, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text style={{ color: foreground, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}
