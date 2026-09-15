import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useIncomingShare } from 'expo-sharing';
import { ActivityIndicator, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppText } from '@/src/components/ui/AppText';
import { Screen } from '@/src/components/ui/Screen';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import { captureLink } from '@/src/features/capture/captureLink';
import { extractFirstHttpUrl } from '@/src/utils/url';
import { InvalidSharedContentError } from '@/src/domain/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { LocalMetadataProvider } from '@/src/services/metadata/LocalMetadataProvider';
import { resolveMetadataForLink } from '@/src/features/metadata/resolveMetadata';

export default function ShareHandlerScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const { sharedPayloads, clearSharedPayloads } = useIncomingShare();
  const processedPayload = useRef<string | null>(null);
  const [message, setMessage] = useState('Guardando enlace…');

  useEffect(() => {
    if (sharedPayloads.length === 0) return;
    const signature = JSON.stringify(sharedPayloads);
    if (processedPayload.current === signature) return;
    processedPayload.current = signature;
    void (async () => {
      try {
        const text = sharedPayloads.map((payload) => payload.value ?? '').join('\n');
        const url = extractFirstHttpUrl(text);
        if (!url) throw new InvalidSharedContentError();
        const result = await captureLink(new LinksRepository(db), { url, source: 'share' });
        if (!result.duplicate) void resolveMetadataForLink(new LinksRepository(db), new LocalMetadataProvider(), result.link);
        setMessage(result.duplicate ? 'Este enlace ya estaba guardado' : 'Guardado en Inbox');
        clearSharedPayloads();
        setTimeout(() => router.replace('/'), 650);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'No se pudo guardar el contenido compartido');
        clearSharedPayloads();
        setTimeout(() => router.replace('/'), 1300);
      }
    })();
  }, [clearSharedPayloads, db, sharedPayloads]);

  return <Screen scroll={false}><View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}><ActivityIndicator color={colors.primary} /><AppText variant="h2" style={{ textAlign: 'center' }}>{message}</AppText></View></Screen>;
}
