# 📚 Documentación del Proyecto

## Estructura de Documentación

### `/development/`
Contiene toda la documentación relacionada con el proceso de desarrollo, incluyendo:

- `IMPLEMENTATION_SUMMARY.md` - Resumen de implementaciones
- `REFACTORING.md` - Historial de refactoring
- `UX_IMPROVEMENTS.md` - Mejoras de UX implementadas
- `DRAG_DROP_*.md` - Documentación de drag & drop
- `migracion-supabase-nosql.md` - Migración de base de datos
- `image-supabase-clerk.md` - Integración de imágenes
- `supabase-migration.sql` - Scripts de migración

## Archivos Eliminados en Clean Code (Fase 1)

### Carpetas de Pruebas Obsoletas ❌
- `/src/app/test-images/`
- `/src/app/test-supabase/`
- `/src/app/test-supabase-storage/`
- `/src/app/test-upload/`
- `/src/app/test-upload-fixed/`
- `/src/app/trials/`

### Componentes Duplicados ❌
- `ZoomableImageNew.tsx` (se mantuvo `ZoomableImage.tsx`)

### Reorganización de Admin 📁
- Archivos de mantenimiento movidos a `/src/app/admin/maintenance/`
- Documentación movida de `/flujos/` a `/docs/development/`

## Estado Actual
✅ **Fase 1 completada**: Limpieza de archivos obsoletos
⏳ **Próximo**: Fase 2 - Reorganización de componentes por funcionalidad
