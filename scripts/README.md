# Script de Exportación de Site Settings

Este script permite exportar los datos de configuración del sitio desde Supabase a un archivo JSON.

## Uso

### Opción 1: Usando npm script (recomendado)
```bash
npm run export:site-settings
```

### Opción 2: Ejecutando directamente con tsx
```bash
npx tsx scripts/export-site-settings.ts
```

### Opción 3: Ejecutando directamente con node (requiere compilación)
```bash
npx tsc scripts/export-site-settings.ts && node scripts/export-site-settings.js
```

## Qué hace el script

1. Se conecta a Supabase usando la configuración existente del proyecto
2. Obtiene el registro de `site_settings` con `id = 'default'`
3. Crea un archivo `site_settings.json` en la raíz del proyecto
4. Incluye toda la información del registro (id, data, created_at, updated_at)
5. Muestra un resumen del contenido exportado

## Estructura del archivo generado

```json
{
  "id": "default",
  "data": {
    "links": [...],
    "categories": [...],
    "title": "...",
    "description": "...",
    // ... otros campos de configuración
  },
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

## Requisitos

- Tener configuradas las variables de entorno de Supabase
- Conexión a internet
- Permisos de lectura en la tabla `site_settings`

## Notas

- El archivo `site_settings.json` se generará en la raíz del proyecto
- Si ya existe un archivo con ese nombre, será sobrescrito
- El script incluye logging detallado para facilitar el debugging
