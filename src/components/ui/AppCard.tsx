import { Pressable, View, type PressableProps, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';
import { radii } from '@/src/theme/tokens';

type AppCardProps = Omit<ViewProps, 'style'> & { pressable?: false; style?: StyleProp<ViewStyle> };
type PressableCardProps = Omit<PressableProps, 'style'> & { pressable: true; style?: StyleProp<ViewStyle> };

export function AppCard(props: AppCardProps | PressableCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const cardStyle = [
    { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radii.card },
    props.style,
  ];
  if ('pressable' in props && props.pressable) {
    const { pressable: _pressable, ...pressableProps } = props;
    return <Pressable {...pressableProps} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.88 }]} />;
  }
  return <View {...props} style={cardStyle} />;
}
