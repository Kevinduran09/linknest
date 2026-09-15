# LinkNest

Biblioteca personal de enlaces local-first para Android, construida con Expo, React Native, TypeScript, Expo Router y SQLite.

## Estado actual

La primera vertical funcional incluye:

- Tema editorial suave con soporte claro/oscuro.
- SQLite persistente con WAL, foreign keys y migración inicial.
- Colección de sistema `Unsorted`.
- Quick Save manual y validación/normalización de URLs.
- Inbox para enlaces pendientes.
- Colecciones, detalle de colección y detalle de enlace.
- Búsqueda local con `LIKE`.
- Preparación del Share Sheet Android mediante `expo-sharing` y `+native-intent`.
- Resolución local de metadata con prioridad OG > Twitter Card > HTML y fallback no destructivo.
- Tags y notas editables desde el detalle del enlace.
- Exportación e importación de backup JSON versionado.
- Menú contextual base para las colecciones mediante long press.

El refinamiento de animaciones, edición avanzada de colecciones, FTS5, reintentos de metadata y hardening siguen pendientes.

## Desarrollo

```bash
npm install
npm run typecheck
npm test
npm run start
```

Las capacidades nativas como SQLite y Share Sheet requieren un development build:

```bash
npx expo prebuild
npm run android
```

Expo Go no sustituye un build nativo para validar la recepción desde Chrome, YouTube, TikTok o Pinterest.

## Decisiones importantes

- SQLite es la fuente de verdad; la URL se persiste antes de cualquier metadata de red.
- No hay cuenta, analytics ni backend obligatorio.
- Solo se aceptan esquemas `http` y `https`.
- No se copia la identidad visual ni la interfaz exacta de Tuckii.
- La integración de incoming share está detrás de Expo Sharing porque su API es experimental.
