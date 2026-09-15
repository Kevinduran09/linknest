import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LinkCard } from '@/src/components/ui/LinkCard';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import type { Link } from '@/src/domain/link';

export default function InboxScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const [links, setLinks] = useState<Link[]>([]);
  const load = useCallback(async () => setLinks(await new LinksRepository(db).listPending()), [db]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function saveToUnsorted(id: string): Promise<void> {
    await new LinksRepository(db).finalize(id, { collectionId: null });
    await load();
  }

  async function deleteLink(id: string): Promise<void> {
    await new LinksRepository(db).delete(id);
    await load();
  }

  return (
    <Screen>
      <ScreenHeader title="Inbox" subtitle="Revisa lo que guardaste recientemente" back />
      {links.length === 0 ? <EmptyState title="Inbox despejado" description="Los enlaces que compartas o pegues aparecerán aquí antes de organizarlos." actionLabel="Volver al inicio" onAction={() => router.replace('/')} /> : links.map((link) => (
        <View key={link.id} style={{ gap: 10 }}>
          <LinkCard link={link} onPress={() => router.push(`/links/${link.id}`)} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AppButton label="Guardar en Unsorted" onPress={() => void saveToUnsorted(link.id)} style={{ flex: 1 }} />
            <AppButton label="Eliminar" variant="danger" onPress={() => void deleteLink(link.id)} style={{ flex: 0.55 }} />
          </View>
          <AppText variant="caption" muted>La previsualización se completa automáticamente cuando hay conexión.</AppText>
        </View>
      ))}
    </Screen>
  );
}
