import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

type AppTextProps = TextProps & {
  variant?: 'display' | 'h1' | 'h2' | 'body' | 'caption' | 'label';
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[
        { color: muted ? colors.muted : colors.text },
        variant === 'display' && { fontSize: 32, lineHeight: 36, fontWeight: '600' },
        variant === 'h1' && { fontSize: 24, lineHeight: 30, fontWeight: '700' },
        variant === 'h2' && { fontSize: 18, lineHeight: 24, fontWeight: '600' },
        variant === 'body' && { fontSize: 15, lineHeight: 21 },
        variant === 'caption' && { fontSize: 12, lineHeight: 16 },
        variant === 'label' && { fontSize: 13, lineHeight: 18, fontWeight: '600' },
        style,
      ]}
    />
  );
}

