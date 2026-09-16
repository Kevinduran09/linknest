import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Linking, Share, TextInput, View } from 'react-native';
import { Star, Trash2 } from 'lucide-react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppText } from '@/src/components/ui/AppText';
import { IconButton } from '@/src/components/ui/IconButton';
import { LinkPreview } from '@/src/components/ui/LinkPreview';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { AppCard } from '@/src/components/ui/AppCard';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import type { Link } from '@/src/domain/link';
import type { Tag } from '@/src/domain/tag';
import { TagsRepository } from '@/src/database/repositories/TagsRepository';
import { useTheme } from '@/src/theme/ThemeProvider';
import { LocalMetadataProvider } from '@/src/services/metadata/LocalMetadataProvider';
import { resolveMetadataForLink } from '@/src/features/metadata/resolveMetadata';
import { CollectionsRepository } from '@/src/database/repositories/CollectionsRepository';
import type { Collection } from '@/src/domain/collection';
import { CollectionPickerModal } from '@/src/components/ui/CollectionPickerModal';

export default function LinkDetailScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [link, setLink] = useState<Link | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [retryingMetadata, setRetryingMetadata] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const load = useCallback(async () => {
    const [nextLink, nextTags, nextCollections] = await Promise.all([new LinksRepository(db).getById(id), new TagsRepository(db).listForLink(id), new CollectionsRepository(db).list()]);
    setLink(nextLink);
    setTags(nextTags);
    setCollections(nextCollections);
    setNotes(nextLink?.notes ?? '');
  }, [db, id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (!link) return <Screen><ScreenHeader title="Enlace" back /><AppText muted>Enlace no encontrado.</AppText></Screen>;
  const currentLink = link;

  async function openLink(): Promise<void> {
    await new LinksRepository(db).markOpened(currentLink.id);
    await Linking.openURL(currentLink.resolvedUrl || currentLink.originalUrl);
  }

  async function shareLink(): Promise<void> {
    await Share.share({ message: `${currentLink.title ? `${currentLink.title}\n` : ''}${currentLink.resolvedUrl || currentLink.originalUrl}` });
  }

  async function toggleFavorite(): Promise<void> {
    await new LinksRepository(db).setFavorite(currentLink.id, !currentLink.isFavorite);
    await load();
  }

  async function deleteLink(): Promise<void> {
    await new LinksRepository(db).delete(currentLink.id);
    router.back();
  }

  async function saveNotes(): Promise<void> {
    await new LinksRepository(db).updateNotes(currentLink.id, notes);
  }

  async function addTag(): Promise<void> {
    if (!tagInput.trim()) return;
    const repository = new TagsRepository(db);
    const tag = await repository.getOrCreate(tagInput);
    await repository.addToLink(currentLink.id, tag.id);
    setTagInput('');
    await load();
  }

  async function removeTag(tagId: string): Promise<void> {
    await new TagsRepository(db).removeFromLink(currentLink.id, tagId);
    await load();
  }

  async function retryMetadata(): Promise<void> {
    if (retryingMetadata) return;
    setRetryingMetadata(true);
    try {
      await resolveMetadataForLink(new LinksRepository(db), new LocalMetadataProvider(), currentLink, { maxAttempts: 2 });
      await load();
    } finally {
      setRetryingMetadata(false);
    }
  }

  async function moveToCollection(collection: Collection): Promise<void> {
    if (collection.id === currentLink.collectionId) return;
    await new LinksRepository(db).move(currentLink.id, collection.id);
    setShowMove(false);
    router.replace(`/collections/${collection.id}`);
  }

  return (
    <Screen>
      <ScreenHeader title="Detalle" subtitle={link.domain} back actions={<IconButton icon={Trash2} label="Eliminar enlace" tone="danger" onPress={() => void deleteLink()} />} />
      <AppCard style={{ overflow: 'hidden' }}><LinkPreview imageUrl={link.imageUrl} domain={link.domain} height={190} /><View style={{ padding: 18, gap: 10 }}><AppText variant="h1">{link.title || link.domain}</AppText><AppText muted>{link.originalUrl}</AppText><AppText variant="caption" style={{ color: link.metadataState === 'FAILED' ? colors.coral : colors.mint }}>{link.metadataState === 'PENDING' ? 'Preview pendiente de resolver' : link.metadataState === 'FAILED' ? 'No se pudo cargar la preview' : link.metadataState === 'RESOLVING' ? 'Cargando preview…' : 'Preview lista'}</AppText>{link.metadataState === 'FAILED' ? <AppButton label={retryingMetadata ? 'Reintentando…' : 'Reintentar preview'} variant="secondary" onPress={() => void retryMetadata()} disabled={retryingMetadata} /> : null}</View></AppCard>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}><AppButton label="Abrir" onPress={() => void openLink()} style={{ flex: 1, minWidth: 130 }} /><AppButton label="Compartir" variant="secondary" onPress={() => void shareLink()} style={{ flex: 1, minWidth: 130 }} /><AppButton label="Mover" variant="secondary" onPress={() => setShowMove(true)} style={{ flex: 1, minWidth: 130 }} /><IconButton icon={Star} label={link.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'} onPress={() => void toggleFavorite()} tone={link.isFavorite ? 'primary' : 'default'} /></View>
      {link.description ? <View style={{ gap: 8 }}><AppText variant="h2">Descripción</AppText><AppText muted>{link.description}</AppText></View> : null}
      <View style={{ gap: 10 }}><AppText variant="h2">Etiquetas</AppText><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{tags.map((tag) => <View key={tag.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 12, backgroundColor: `${colors.primary}18` }}><AppText variant="caption" style={{ color: colors.primary }}>#{tag.name}</AppText><AppText variant="caption" onPress={() => void removeTag(tag.id)} style={{ color: colors.muted }}>×</AppText></View>)}</View><View style={{ flexDirection: 'row', gap: 8 }}><TextInput value={tagInput} onChangeText={setTagInput} onSubmitEditing={() => void addTag()} placeholder="Añadir etiqueta" placeholderTextColor={colors.muted} autoCapitalize="none" style={{ flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12, color: colors.text }} /><AppButton label="Añadir" variant="secondary" onPress={() => void addTag()} /></View></View>
      <View style={{ gap: 8 }}><AppText variant="h2">Notas</AppText><TextInput value={notes} onChangeText={setNotes} onBlur={() => void saveNotes()} placeholder="Escribe una nota para recordar por qué guardaste este enlace…" placeholderTextColor={colors.muted} multiline textAlignVertical="top" style={{ minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14, color: colors.text, backgroundColor: colors.surface }} /></View>
      <CollectionPickerModal visible={showMove} collections={collections} currentCollectionId={link.collectionId} onSelect={(collection) => void moveToCollection(collection)} onClose={() => setShowMove(false)} />
    </Screen>
  );
}
