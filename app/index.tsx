import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Edit3, Trash2 } from 'lucide-react-native';

import { CollectionCard } from '@/src/components/ui/CollectionCard';
import { HomeHeader } from '@/src/components/ui/ScreenHeader';
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
import { CollectionEditorModal } from '@/src/components/ui/CollectionEditorModal';
import { UNSORTED_COLLECTION_ID } from '@/src/domain/collection';

export default function HomeScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const load = useCallback(async () => {
    const collectionsRepository = new CollectionsRepository(db);
    const linksRepository = new LinksRepository(db);
    const [nextCollections, nextRecent] = await Promise.all([
      collectionsRepository.list(),
      linksRepository.listRecent(),
    ]);
    setCollections(nextCollections);
    setRecentLinks(nextRecent);
  }, [db]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function saveUrl(url: string): Promise<{ duplicate: boolean }> {
    const repository = new LinksRepository(db);
    const result = await captureLink(repository, { url, source: 'manual' });
    let collectionId = result.link.collectionId;
    if (result.link.status !== 'SAVED') {
      await repository.finalize(result.link.id, { collectionId: UNSORTED_COLLECTION_ID });
      collectionId = UNSORTED_COLLECTION_ID;
    }
    if (!result.duplicate) void resolveMetadataForLink(repository, new LocalMetadataProvider(), result.link);
    await load();
    router.push(`/collections/${collectionId ?? UNSORTED_COLLECTION_ID}`);
    return { duplicate: result.duplicate };
  }

  return (
    <Screen>
      <HomeHeader />
      <QuickSaveBar onSave={saveUrl} />
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="h2">Colecciones</AppText>
          <AppButton label="Nueva" variant="secondary" onPress={() => setShowCreateCollection(true)} style={{ minHeight: 38, paddingHorizontal: 12 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {collections.map((collection) => <View key={collection.id} style={{ width: '48%', minWidth: 156 }}><CollectionCard collection={collection} onPress={() => router.push(`/collections/${collection.id}`)} onLongPress={() => setMenuCollection(collection)} /></View>)}
        </View>
      </View>
      <View style={{ gap: 14 }}>
        <AppText variant="h2">Guardados recientes</AppText>
        {recentLinks.length === 0 ? <AppText muted>Aún no tienes enlaces guardados en una colección.</AppText> : recentLinks.map((link) => <LinkCard key={link.id} link={link} compact onPress={() => router.push(`/links/${link.id}`)} />)}
      </View>
      <ContextMenu visible={Boolean(menuCollection)} title={menuCollection?.name ?? 'Colección'} onClose={() => setMenuCollection(null)} actions={menuCollection ? [{ id: 'edit', label: 'Editar colección', icon: Edit3, onPress: () => router.push(`/collections/${menuCollection.id}/edit`) }, { id: 'delete', label: 'Eliminar colección', icon: Trash2, destructive: true, onPress: () => { if (menuCollection.isSystem) { Alert.alert('Acción no disponible', 'Unsorted no se puede eliminar.'); return; } Alert.alert('Eliminar colección', 'Sus enlaces se moverán a Unsorted.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => void new CollectionsRepository(db).delete(menuCollection.id).then(load) }]); } }] : []} />
      <CollectionEditorModal key={showCreateCollection ? 'create-open' : 'create-closed'} visible={showCreateCollection} onClose={() => setShowCreateCollection(false)} onSaved={() => { setShowCreateCollection(false); void load(); }} />
    </Screen>
  );
}
