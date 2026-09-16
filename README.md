# LinkNest

Biblioteca personal de enlaces local-first para Android, construida con Expo, React Native, TypeScript, Expo Router y SQLite.

## Estado actual

La primera vertical funcional incluye:

- Tema editorial suave con soporte claro/oscuro.
- SQLite persistente con WAL, foreign keys y migración inicial.
- Colección de sistema `Unsorted`.
- Quick Save manual y recepción desde Share Sheet, ambos guardados automáticamente en `Unsorted`.
- Colecciones, detalle de colección y detalle de enlace.
- Búsqueda local con FTS5 y fallback para etiquetas.
- Preparación del Share Sheet Android mediante `expo-sharing` y `+native-intent`, con redirección automática a `Unsorted`.
- Resolución local de metadata con prioridad OG > Twitter Card > HTML y fallback no destructivo.
- Tags y notas editables desde el detalle del enlace.
- Exportación e importación de backup JSON versionado.
- Edición de nombre y color de colecciones mediante menú contextual.
- Reintentos de metadata con timeout, límites de respuesta y acción manual desde el detalle.
- Validación estructural y referencias seguras al restaurar backups.

El refinamiento de animaciones, las pruebas en dispositivos físicos y el empaquetado de distribución siguen pendientes.

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

## Releases automáticos

Cada push a `main` ejecuta GitHub Actions, valida el proyecto, genera el APK Android y publica un Release privado con el archivo instalable. También se puede iniciar manualmente desde la pestaña **Actions** de GitHub mediante el workflow `Android APK Release`.

El APK generado está orientado al uso personal y pruebas. Para instalarlo, descarga el archivo `.apk` del Release y ábrelo en Android; si ya existe una versión anterior firmada con la misma clave, se actualizará sobre ella.

## Decisiones importantes

- SQLite es la fuente de verdad; la URL se persiste antes de cualquier metadata de red.
- No hay cuenta, analytics ni backend obligatorio.
- Solo se aceptan esquemas `http` y `https`.
- No se copia la identidad visual ni la interfaz exacta de Tuckii.
- La integración de incoming share está detrás de Expo Sharing porque su API es experimental.
