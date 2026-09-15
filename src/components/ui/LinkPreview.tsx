import { Image } from 'expo-image';
import { Globe2 } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

type LinkPreviewProps = { imageUrl: string | null; domain: string; height?: number };

export function LinkPreview({ imageUrl, domain, height = 150 }: LinkPreviewProps): React.JSX.Element {
  const { colors } = useTheme();
  if (!imageUrl) {
    return (
      <View style={{ height, backgroundColor: `${colors.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
        <Globe2 size={34} color={colors.primary} />
      </View>
    );
  }
  return (
    <Image
      source={{ uri: imageUrl }}
      contentFit="cover"
      transition={180}
      style={{ width: '100%', height, backgroundColor: `${colors.primary}18` }}
      accessibilityLabel={`Previsualización de ${domain}`}
    />
  );
}

