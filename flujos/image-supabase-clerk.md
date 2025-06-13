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

## 🔧 Troubleshooting

### Error: "alg Header Parameter value not allowed"
- Verificar JWKS endpoint en Supabase
- Confirmar JWT template en Clerk
- Asegurar que el template se llame 'supabase'

### Error: "new row violates row-level security policy"
- Verificar políticas RLS en Supabase
- Confirmar que el usuario esté autenticado
- Revisar configuración del bucket

### Error: "Unauthorized"
- Verificar token JWT en consola
- Confirmar que Supabase reciba el token
- Revisar configuración de fetch en cliente
