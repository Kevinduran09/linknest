import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { LinkCard } from '@/src/components/ui/LinkCard';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import type { Collection } from '@/src/domain/collection';
import type { Link } from '@/src/domain/link';

export default function CollectionDetailScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const load = useCallback(async () => {
    const [nextCollection, nextLinks] = await Promise.all([new CollectionsRepository(db).getById(id), new LinksRepository(db).listByCollection(id)]);
    setCollection(nextCollection);
    setLinks(nextLinks);
  }, [db, id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!collection) return <Screen><ScreenHeader title="Colección" back /><EmptyState title="Colección no encontrada" description="Es posible que haya sido eliminada." actionLabel="Volver" onAction={() => router.back()} /></Screen>;

  return (
    <Screen>
      <ScreenHeader title={collection.name} subtitle={`${collection.linkCount ?? 0} enlaces`} back />
      {links.length === 0 ? <EmptyState title="Aún está vacía" description="Guarda aquí los enlaces que quieras consultar más adelante." /> : links.map((link) => <LinkCard key={link.id} link={link} onPress={() => router.push(`/links/${link.id}`)} />)}
      {collection.isSystem ? <AppText variant="caption" muted>Unsorted es la colección predeterminada y no se puede eliminar.</AppText> : null}
    </Screen>
  );
}
