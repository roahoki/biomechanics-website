# Flujo de Implementación: Subida de Imágenes con Clerk + Supabase

## 🎯 Objetivo
Implementar un sistema donde el admin puede cambiar la imagen de perfil que ven todos los usuarios, integrando autenticación de Clerk con almacenamiento de Supabase.

## 🏗️ Arquitectura del Sistema

```
Frontend (React) ←→ Clerk Auth ←→ Supabase Storage ←→ Next.js Backend ←→ JSON Database
```

## 📋 Configuración Inicial

### 1. Configuración de Supabase Storage

#### A. Crear Bucket
```bash
# En Supabase Dashboard
Storage → Buckets → Create Bucket
- Name: "avatars"
- Public bucket: ✅ Enabled
- File size limit: 50MB
- Allowed MIME types: image/*
```

#### B. Configurar Políticas RLS
```sql
-- Política para INSERT (subida autenticada)
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Política para SELECT (lectura pública)
CREATE POLICY "Public can view avatars" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'avatars');

-- Política para UPDATE (actualización autenticada)
CREATE POLICY "Authenticated users can update avatars" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars');
```

### 2. Configuración de Clerk + Supabase JWT

#### Configuración en Supabase que se integra con Clerk

```
Dashboard → Authentication → Sign In Providers → Third Party Auth → Elegir Clerk y seguir las instrucciones
```

## 🔧 Implementación del Cliente Supabase

### 1. Hook de Autenticación (`src/lib/supabase-auth.ts`)
```typescript
import { useAuth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

export function useSupabaseClient() {
  const { getToken } = useAuth()

  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false },
        global: {
          fetch: async (url, options = {}) => {
            // Obtener JWT de Clerk con template 'supabase'
            const clerkToken = await getToken({ template: 'supabase' })
            
            const headers = new Headers(options?.headers)
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`)
            }

            return fetch(url, { ...options, headers })
          },
        },
      }
    )
  }, [getToken])
}
```

### 2. Lógica de Subida de Imagen
```typescript
const uploadImageToSupabase = async (file: File): Promise<string | null> => {
  try {
    // Generar nombre único
    const fileExt = file.name.split('.').pop()
    const fileName = `profile-${Date.now()}.${fileExt}`
    
    // Subir archivo
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (error) throw error

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return publicUrlData.publicUrl
  } catch (error) {
    console.error('Error subiendo imagen:', error)
    throw error
  }
}
```

## 🎨 Implementación del Frontend

### 1. Estados del Componente
```typescript
const [selectedFile, setSelectedFile] = useState<File | null>(null)
const [previewImage, setPreviewImage] = useState<string>(profileImage)
const [uploadingImage, setUploadingImage] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
```

### 2. Manejo de Selección de Archivo
```typescript
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    setSelectedFile(file)
    
    // Preview inmediato
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
}
```

### 3. Interfaz de Usuario
```jsx
<div className="relative group">
  {/* Imagen actual/preview */}
  <img
    src={previewImage}
    className="w-32 h-32 rounded-full object-cover"
  />
  
  {/* Overlay para editar */}
  <div 
    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
    onClick={() => fileInputRef.current?.click()}
  >
    <span className="text-white">
      {selectedFile ? 'Cambiar' : 'Editar'}
    </span>
  </div>
  
  {/* Input oculto */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileSelect}
    className="hidden"
  />
  
  {/* Indicador de cambio */}
  {selectedFile && (
    <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
      Nuevo
    </div>
  )}
</div>
```

## 🔄 Flujo de Guardado

### 1. Proceso de Envío (`handleSubmit`)
```typescript
async function handleSubmit(formData: FormData) {
  setIsSubmitting(true)
  
  try {
    // Paso 1: Subir imagen si hay una nueva
    let newImageUrl = null
    if (selectedFile) {
      setUploadingImage(true)
      newImageUrl = await uploadImageToSupabase(selectedFile)
      if (newImageUrl) {
        formData.append('newProfileImage', newImageUrl)
      }
      setUploadingImage(false)
    }
    
    // Paso 2: Guardar todos los cambios
    const result = await updateAdminLinks(formData)
    
    if (result.success) {
      setSelectedFile(null) // Limpiar estado
      router.refresh() // Recargar datos
    }
  } catch (error) {
    // Manejo de errores
  } finally {
    setIsSubmitting(false)
  }
}
```

### 2. Server Action (`updateAdminLinks`)
```typescript
export async function updateAdminLinks(formData: FormData) {
  try {
    // Verificar permisos admin
    if (!checkRole('admin')) {
      throw new Error('No autorizado')
    }
    
    // Obtener datos actuales
    const currentData = await getLinksData()
    
    // Procesar nueva imagen si existe
    let profileImage = currentData.profileImage
    const newProfileImage = formData.get('newProfileImage')?.toString()
    if (newProfileImage && newProfileImage.trim() !== '') {
      profileImage = newProfileImage.trim()
    }
    
    // Procesar otros campos (description, links)
    const description = formData.get('description')?.toString() || ''
    // ... procesamiento de enlaces
    
    // Crear nuevo objeto de datos
    const newData = {
      description,
      profileImage,
      items: newItems
    }
    
    // Guardar en archivo JSON
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2))
    
    // Revalidar rutas para mostrar cambios
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Cambios guardados' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## 📊 Estructura de Datos

### 1. Archivo JSON (`src/data/links.json`)
```json
{
  "description": "Mi descripción",
  "profileImage": "https://supabase.co/storage/v1/object/public/avatars/profile-123456.jpg",
  "items": [
    {
      "id": 1,
      "url": "https://instagram.com/user",
      "label": "Instagram"
    }
  ]
}
```

### 2. Utility Function (`src/utils/links.ts`)
```typescript
interface LinksData {
  links: Link[]
  description: string
  profileImage: string
}

export async function getLinksData(): Promise<LinksData> {
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
  return {
    links: data.items || [],
    description: data.description || "",
    profileImage: data.profileImage || "/profile.jpg"
  }
}
```

## 🚀 Estados de la Aplicación

### 1. Estado Inicial
```
profileImage: "/profile.jpg" (imagen por defecto)
selectedFile: null
previewImage: "/profile.jpg"
```

### 2. Después de Seleccionar Archivo
```
profileImage: "/profile.jpg" (sin cambios)
selectedFile: File object
previewImage: data:image/jpeg;base64,... (preview del FileReader)
```

### 3. Durante la Subida
```
uploadingImage: true
isSubmitting: true
Status: "Subiendo imagen..."
```

### 4. Después del Guardado Exitoso
```
profileImage: "https://supabase.co/storage/.../profile-123.jpg"
selectedFile: null (limpiado)
previewImage: "https://supabase.co/storage/.../profile-123.jpg"
```

## 🔒 Seguridad y Validaciones

### 1. Validaciones Frontend
- Tipo de archivo: `accept="image/*"`
- Tamaño máximo: Verificación antes de subir
- Preview seguro: FileReader para mostrar imagen

### 2. Validaciones Backend
- Autenticación: JWT de Clerk validado por Supabase
- Autorización: `checkRole('admin')` en server action
- Políticas RLS: Solo usuarios autenticados pueden subir

### 3. Manejo de Errores
```typescript
try {
  // Operación
} catch (error) {
  if (error.message.includes('unauthorized')) {
    setError('Error de autenticación')
  } else if (error.message.includes('alg')) {
    setError('Error de configuración JWT')
  } else {
    setError(`Error: ${error.message}`)
  }
}
```

## 🎯 Beneficios de esta Implementación

1. **Preview Inmediato**: Usuario ve cambios antes de guardar
2. **Autenticación Robusta**: Integración Clerk + Supabase JWT
3. **Almacenamiento Escalable**: Supabase Storage con CDN
4. **Estados Claros**: Feedback visual en cada paso
5. **Rollback Seguro**: Si falla la subida, se mantiene imagen anterior
6. **Separación de Responsabilidades**: Frontend UI, Backend persistencia
7. **Revalidación Automática**: Todos los usuarios ven cambios inmediatos

## 🎬 Extensión: Soporte para Videos y GIFs

### Configuración Adicional del Bucket

#### A. Actualizar Tipos MIME Permitidos
```bash
# En Supabase Dashboard
Storage → Buckets → avatars → Settings
- Allowed MIME types: image/*, video/mp4, video/webm, video/quicktime
- File size limit: 50MB (aumentado para videos)
```

#### B. Tipos de Archivo Soportados
```typescript
export type ProfileImageType = 'image' | 'video' | 'gif'

export function getFileType(file: File): ProfileImageType {
  const type = file.type.toLowerCase()
  
  if (type.startsWith('video/')) {
    return 'video'
  } else if (type === 'image/gif') {
    return 'gif'
  } else if (type.startsWith('image/')) {
    return 'image'
  }
  
  // Fallback basado en extensión
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (['mp4', 'webm', 'mov', 'avi'].includes(extension || '')) {
    return 'video'
  } else if (extension === 'gif') {
    return 'gif'
  }
  
  return 'image'
}
```

#### C. Validación de Archivos
```typescript
export function isValidAvatarFile(file: File): boolean {
  const maxSize = 50 * 1024 * 1024 // 50MB para videos
  const supportedTypes = [
    // Imágenes
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    // Videos
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]
  
  return file.size <= maxSize && supportedTypes.includes(file.type.toLowerCase())
}
```

### Renderizado Dinámico del Avatar

#### A. Componente Renderizador
```tsx
const renderAvatar = () => {
  const commonClasses = "w-32 h-32 rounded-full border-4 border-[var(--color-accent-organic)] mb-4 shadow-lg object-cover"
  
  if (previewType === 'video') {
    return (
      <video 
        src={previewUrl}
        className={commonClasses}
        autoPlay
        loop
        muted
        playsInline
      />
    )
  } else {
    // Para 'image' y 'gif'
    return (
      <img
        src={previewUrl}
        alt="Avatar"
        className={commonClasses}
      />
    )
  }
}
```

#### B. Input de Archivo Extendido
```tsx
<input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/mp4,video/webm,video/quicktime"
  onChange={handleFileSelect}
  className="hidden"
/>
```

#### C. Indicadores Visuales
```tsx
{/* Indicador del tipo actual */}
{!selectedFile && previewType !== 'image' && (
  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
    {getFileTypeText(previewType)}
  </div>
)}

{/* Indicador de cambio pendiente */}
{selectedFile && (
  <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
    {getFileTypeText(previewType)}
  </div>
)}
```

### Estructura de Datos Actualizada

#### JSON con Soporte de Tipos
```json
{
  "description": "Mi descripción",
  "profileImage": "https://supabase.co/storage/v1/object/public/avatars/video-123456.mp4",
  "profileImageType": "video",
  "items": [...]
}
```

### Características de Videos

#### A. Reproducción Automática
- **autoPlay**: Inicia automáticamente
- **loop**: Se reproduce en bucle continuo
- **muted**: Sin sonido (requerido para autoplay)
- **playsInline**: No pantalla completa en móviles

#### B. Optimizaciones
- **Tamaño**: Máximo 50MB
- **Formatos**: MP4, WebM, QuickTime
- **Compresión**: Se recomienda comprimir videos antes de subir

#### C. Consideraciones UX
- Los videos se muestran como avatars circulares
- Reproducción silenciosa para no molestar
- Carga automática al cambiar de página
- Preview inmediato al seleccionar archivo

### Beneficios de Videos/GIFs como Avatar

1. **Más Expresivo**: Mayor personalidad y dinamismo
2. **Diferenciación**: Destaca entre perfiles estáticos  
3. **Engagement**: Capta más atención del usuario
4. **Modernidad**: Sigue tendencias actuales de redes sociales
5. **Creatividad**: Permite expresión artística única

### Consideraciones Técnicas

#### A. Rendimiento
- Videos consumen más ancho de banda
- Tiempo de carga mayor que imágenes
- Procesamiento adicional en el navegador

#### B. Accesibilidad
- Debe funcionar sin JavaScript
- Fallback a imagen estática
- Controles de accesibilidad para usuarios con epilepsia

#### C. SEO y Metadatos
- Videos no indexables como imágenes
- Considerar imagen de fallback para metadatos
- Tiempo de carga afecta Core Web Vitals
