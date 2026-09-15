import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { AppText } from '@/src/components/ui/AppText';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { IconButton } from '@/src/components/ui/IconButton';
import { LinkCard } from '@/src/components/ui/LinkCard';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { LinksRepository } from '@/src/database/repositories/LinksRepository';
import type { Link } from '@/src/domain/link';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function SearchScreen(): React.JSX.Element {
  const db = useSQLiteContext();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Link[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      void new LinksRepository(db).search(query).then(setResults);
    }, 180);
    return () => clearTimeout(timeout);
  }, [db, query]);

  return (
    <Screen>
      <ScreenHeader title="Buscar" subtitle="Busca en tu biblioteca local" back />
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, minHeight: 56 }}>
        <SearchIcon size={20} color={colors.primary} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Título, dominio, URL o nota" placeholderTextColor={colors.muted} autoFocus style={{ flex: 1, color: colors.text, fontSize: 15, paddingHorizontal: 10 }} />
        {query ? <IconButton icon={X} label="Limpiar búsqueda" onPress={() => setQuery('')} style={{ width: 34, height: 34 }} /> : null}
      </View>
      {!query.trim() ? <EmptyState title="Encuentra cualquier enlace" description="La búsqueda funciona sin conexión y revisa todos los datos guardados." /> : results.length === 0 ? <EmptyState title="Sin coincidencias" description="Prueba con otro término o revisa la ortografía." /> : <View style={{ gap: 14 }}>{results.map((link) => <LinkCard key={link.id} link={link} compact onPress={() => router.push(`/links/${link.id}`)} />)}<AppText variant="caption" muted>{results.length} resultados</AppText></View>}
    </Screen>
  );
}

