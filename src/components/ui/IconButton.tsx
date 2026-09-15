import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: LucideIcon;
  label: string;
  tone?: 'default' | 'primary' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon: Icon, label, tone = 'default', style, ...props }: IconButtonProps): React.JSX.Element {
  const { colors } = useTheme();
  const color = tone === 'primary' ? colors.primary : tone === 'danger' ? colors.coral : colors.text;
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
        pressed && { backgroundColor: colors.border },
        style,
      ]}
    >
      <Icon size={21} color={color} strokeWidth={2.2} />
    </Pressable>
  );
}
