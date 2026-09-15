import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Edit3, Trash2 } from 'lucide-react-native';

import { CollectionCard } from '@/src/components/ui/CollectionCard';
import { HomeHeader } from '@/src/components/ui/ScreenHeader';
import { InboxBanner } from '@/src/components/ui/InboxBanner';
import { LinkCard } from '@/src/components/ui/LinkCard';
import { QuickSaveBar } from '@/src/components/ui/QuickSaveBar';
import { Screen } from '@/src/components/ui/Screen';
import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import type { Collection } from '@/src/domain/collection';
import type { Link } from '@/src/domain/link';
import { captureLink } from '@/src/features/capture/captureLink';
import { LocalMetadataProvider } from '@/src/services/metadata/LocalMetadataProvider';
import { resolveMetadataForLink } from '@/src/features/metadata/resolveMetadata';
import { ContextMenu } from '@/src/components/ui/ContextMenu';

export default function HomeScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);

  const load = useCallback(async () => {
    const collectionsRepository = new CollectionsRepository(db);
    const linksRepository = new LinksRepository(db);
    const [nextCollections, nextRecent, nextPending] = await Promise.all([
      collectionsRepository.list(),
      linksRepository.listRecent(),
      linksRepository.countPending(),
    ]);
    setCollections(nextCollections);
    setRecentLinks(nextRecent);
    setPendingCount(nextPending);
  }, [db]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function saveUrl(url: string): Promise<{ duplicate: boolean }> {
    const result = await captureLink(new LinksRepository(db), { url, source: 'manual' });
    if (!result.duplicate) void resolveMetadataForLink(new LinksRepository(db), new LocalMetadataProvider(), result.link);
    await load();
    return { duplicate: result.duplicate };
  }

  return (
    <Screen>
      <HomeHeader />
      <QuickSaveBar onSave={saveUrl} />
      {pendingCount > 0 ? <InboxBanner count={pendingCount} onPress={() => router.push('/inbox')} /> : null}
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="h2">Colecciones</AppText>
          <AppButton label="Nueva" variant="secondary" onPress={() => router.push('/collections/new')} style={{ minHeight: 38, paddingHorizontal: 12 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {collections.map((collection) => <View key={collection.id} style={{ width: '48%', minWidth: 156 }}><CollectionCard collection={collection} onPress={() => router.push(`/collections/${collection.id}`)} onLongPress={() => setMenuCollection(collection)} /></View>)}
        </View>
      </View>
      <View style={{ gap: 14 }}>
        <AppText variant="h2">Guardados recientes</AppText>
        {recentLinks.length === 0 ? <AppText muted>Aún no tienes enlaces guardados en una colección.</AppText> : recentLinks.map((link) => <LinkCard key={link.id} link={link} compact onPress={() => router.push(`/links/${link.id}`)} />)}
      </View>
      <ContextMenu visible={Boolean(menuCollection)} title={menuCollection?.name ?? 'Colección'} onClose={() => setMenuCollection(null)} actions={menuCollection ? [{ id: 'edit', label: 'Editar colección', icon: Edit3, onPress: () => Alert.alert('Próximamente', 'La edición de colecciones se agregará en la siguiente iteración.') }, { id: 'delete', label: 'Eliminar colección', icon: Trash2, destructive: true, onPress: () => { if (menuCollection.isSystem) { Alert.alert('Acción no disponible', 'Unsorted no se puede eliminar.'); return; } Alert.alert('Eliminar colección', 'Sus enlaces se moverán a Unsorted.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => void new CollectionsRepository(db).delete(menuCollection.id).then(load) }]); } }] : []} />
    </Screen>
  );
}
