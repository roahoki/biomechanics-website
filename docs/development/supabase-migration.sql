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
    EXISTS (
      SELECT 1
      FROM auth.jwt
      WHERE role = 'admin'
    )
  );

-- Asegurarnos de que auth.users es accesible desde funciones del servidor
GRANT SELECT ON auth.users TO service_role;
