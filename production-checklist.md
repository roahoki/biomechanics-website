# Lista de verificación para producción

## Configuración
- [ ] Variables de entorno configuradas (.env.production o en el panel del proveedor)
- [ ] Dominio personalizado configurado
- [ ] Certificados SSL habilitados

## Seguridad
- [ ] API keys de Clerk son secretas y no están expuestas
- [ ] Supabase Service Key no está expuesta al público
- [ ] Headers de seguridad configurados

## Rendimiento
- [ ] Imágenes optimizadas
- [ ] Build de producción revisado localmente (`next build`)
- [ ] Lighthouse o herramientas similares usadas para auditar rendimiento

## SEO
- [ ] Etiquetas meta en cada página
- [ ] robots.txt configurado
- [ ] Sitemap.xml generado

## Integración
- [ ] Configuración de Clerk correcta en producción
- [ ] Supabase conectada correctamente
- [ ] Permisos de CORS configurados (si es necesario)
- [ ] Tabla de links en Supabase creada y configurada
- [ ] Migración de datos de links.json a Supabase completada
- [ ] RLS (Row Level Security) configurado para proteger datos en Supabase

## Experiencia de usuario
- [ ] Páginas de error personalizadas funcionando
- [ ] Retroalimentación al usuario para acciones importantes
- [ ] Navegación y flujo de usuario probados

## Monitoreo
- [ ] Analytics configurado (opcional)
- [ ] Monitoreo de errores configurado (opcional)
- [ ] Logging de accesos a la base de datos configurado
