import { ArrowLeft, Search, Settings } from 'lucide-react-native';
import { View } from 'react-native';
import { router } from 'expo-router';

import { AppText } from '@/src/components/ui/AppText';
import { IconButton } from '@/src/components/ui/IconButton';

type ScreenHeaderProps = { title: string; subtitle?: string; back?: boolean; actions?: React.ReactNode };

export function ScreenHeader({ title, subtitle, back = false, actions }: ScreenHeaderProps): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {back ? <IconButton icon={ArrowLeft} label="Volver" onPress={() => router.back()} /> : null}
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="h1">{title}</AppText>
        {subtitle ? <AppText muted>{subtitle}</AppText> : null}
      </View>
      {actions}
    </View>
  );
}

export function HomeHeader(): React.JSX.Element {
  return <ScreenHeader title="LinkNest" subtitle="Tu biblioteca personal" actions={<><IconButton icon={Search} label="Buscar" onPress={() => router.push('/search')} /><IconButton icon={Settings} label="Configuración" onPress={() => router.push('/settings')} /></>} />;
}

