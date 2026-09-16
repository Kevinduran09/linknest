import { Alert, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import { AppText } from '@/src/components/ui/AppText';
import { AppCard } from '@/src/components/ui/AppCard';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { AppButton } from '@/src/components/ui/AppButton';
import { createBackup, parseBackup, restoreBackupReplace } from '@/src/services/backup/BackupService';

export default function SettingsScreen(): React.JSX.Element {
  const db = useSQLiteContext();

  async function exportBackup(): Promise<void> {
    const backup = await createBackup(db);
    const uri = `${FileSystem.documentDirectory}linknest-backup-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(backup, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Compartir backup de LinkNest' });
  }

  async function importBackup(): Promise<void> {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled || !result.assets[0]) return;
    try {
      const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const backup = parseBackup(json);
      Alert.alert('Reemplazar biblioteca', 'Este backup reemplazará los datos actuales de LinkNest.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Importar', style: 'destructive', onPress: () => void restoreBackupReplace(db, backup).then(() => Alert.alert('Importación completa', 'Tu biblioteca fue restaurada.')).catch((error: unknown) => Alert.alert('No se pudo importar', error instanceof Error ? error.message : 'Intenta nuevamente.')) },
      ]);
    } catch (error) {
      Alert.alert('Backup inválido', error instanceof Error ? error.message : 'El archivo no es compatible.');
    }
  }

  return (
    <Screen>
      <ScreenHeader title="Configuración" subtitle="Privacidad y preferencias" back />
      <AppCard style={{ padding: 18, gap: 8 }}><AppText variant="h2">Local-first</AppText><AppText muted>Tu biblioteca vive en este dispositivo. No necesitas una cuenta ni un backend para usar LinkNest.</AppText></AppCard>
      <View style={{ gap: 10 }}><AppText variant="h2">Backup</AppText><AppText muted>Exporta tus colecciones, enlaces, etiquetas y notas como JSON.</AppText><View style={{ flexDirection: 'row', gap: 10 }}><AppButton label="Exportar" onPress={() => void exportBackup()} style={{ flex: 1 }} /><AppButton label="Importar" variant="secondary" onPress={() => void importBackup()} style={{ flex: 1 }} /></View></View>
      <View style={{ gap: 5 }}><AppText variant="h2">Versión</AppText><AppText muted>LinkNest MVP · SQLite schema 2</AppText></View>
    </Screen>
  );
}
