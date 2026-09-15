import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { initDatabase } from '@/src/database/db';
import { ThemeProvider } from '@/src/theme/ThemeProvider';

export default function RootLayout(): React.JSX.Element {
  return (
    <ThemeProvider>
      <SQLiteProvider databaseName="linknest.db" onInit={initDatabase} useSuspense>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </SQLiteProvider>
    </ThemeProvider>
  );
}

