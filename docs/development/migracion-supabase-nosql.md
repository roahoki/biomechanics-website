# Migración de links.json a Supabase (NoSQL)

Esta guía describe el proceso para migrar el archivo estático `links.json` a una base de datos NoSQL usando Supabase.

## ¿Por qué usar Supabase para datos NoSQL?

Aunque Supabase está construido sobre PostgreSQL (una base de datos relacional), ofrece el tipo de datos JSONB que permite almacenar y consultar datos JSON de forma eficiente, brindando características similares a una base de datos NoSQL:

- Almacenamiento flexible de datos sin esquema rígido
- Consultas eficientes sobre datos JSON
- Mantenimiento de una sola plataforma (ya estamos usando Supabase para autenticación)

## Requisitos previos

1. Tener una cuenta en Supabase con un proyecto creado
2. Configurar las siguientes variables de entorno en tu proyecto:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL pública de tu proyecto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima de tu proyecto Supabase
   - `SUPABASE_SERVICE_KEY`: Clave de servicio (secreta) para operaciones del servidor

## Paso 1: Crear la tabla en Supabase

Ejecuta el siguiente script SQL en el editor SQL de Supabase:

```sql
-- Crear la tabla para almacenar la configuración del sitio
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY, -- Un identificador único, usamos 'default' para el registro principal
  data JSONB NOT NULL, -- Los datos en formato JSON
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Añadir comentarios a la tabla y columnas para documentación
COMMENT ON TABLE public.site_settings IS 'Tabla para almacenar la configuración del sitio, incluyendo los enlaces y estilos';
COMMENT ON COLUMN public.site_settings.id IS 'Identificador único del conjunto de configuración';
COMMENT ON COLUMN public.site_settings.data IS 'Los datos de configuración en formato JSON';
COMMENT ON COLUMN public.site_settings.updated_at IS 'Fecha de la última actualización';

-- Configurar Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Crear política para lectura pública (cualquiera puede leer)
CREATE POLICY "Permitir lectura publica" 
  ON public.site_settings 
  FOR SELECT 
  USING (true);

-- Crear política para permitir inserción/actualización solo a usuarios autenticados con rol admin
CREATE POLICY "Permitir escritura solo a admins"
  ON public.site_settings
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );
```

## Paso 2: Migrar los datos

1. Ve a la aplicación y accede como administrador
2. Navega a la página de migración: `/admin/migration`
3. Haz clic en "Iniciar migración" para transferir los datos del archivo local a Supabase

## Paso 3: Verificar la migración

1. Después de la migración, ve a la tabla `site_settings` en Supabase
2. Debería haber un registro con `id = 'default'` y un objeto JSON en la columna `data`
3. Verifica que los datos sean correctos comparándolos con tu archivo `links.json` original

## Cómo funciona la implementación

### Lectura de datos

La función `getLinksData()` ahora:

1. Intenta primero obtener datos de Supabase
2. Si hay algún error o no hay datos, usa como fallback el archivo JSON local
3. Transforma los datos al formato esperado por la aplicación

### Escritura de datos

La función `updateAdminLinks()` ahora:

1. Procesa los datos del formulario como antes
2. Guarda los datos en Supabase usando la función `saveLinksToSupabase()`
3. También actualiza el archivo JSON local como respaldo
4. Revalida las rutas para reflejar los cambios

### Funcionamiento Offline y Recuperación

- Si la conexión a Supabase falla, la aplicación seguirá funcionando con el archivo local
- Los datos se guardan en ambos lugares para mayor seguridad

## Ventajas del enfoque mixto (Supabase + archivo local)

1. **Flexibilidad**: Cambios dinámicos en producción sin necesidad de redeployear
2. **Rendimiento**: Lectura rápida desde Supabase con caché automática
3. **Seguridad**: Control de acceso granular con Row Level Security (RLS)
4. **Redundancia**: Respaldo local en caso de problemas con la base de datos
5. **Escalabilidad**: Supabase maneja automáticamente el escalado de la base de datos

## Siguientes pasos

- Implementar versionado de cambios
- Añadir una interfaz para ver el historial de cambios
- Configurar backups automáticos
- Implementar una función para restaurar versiones anteriores
