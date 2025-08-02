import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseClient } from '@/lib/supabase-db'
import { checkRole } from '@/utils/roles'

export async function POST(request: NextRequest) {
    try {
        // Verificar autenticación
        const { userId } = await auth()
        console.log('🔍 Usuario autenticado:', userId)

        if (!userId) {
            console.log('❌ Usuario no autenticado')
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Verificar rol de admin
        const isAdmin = await checkRole('admin')
        if (!isAdmin) {
            console.log('❌ Usuario no es admin')
            return NextResponse.json({ error: 'Acceso denegado: se requieren permisos de administrador' }, { status: 403 })
        }

        console.log('✅ Usuario verificado como admin')

        // Obtener los datos del formulario
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            console.log('❌ No se encontró archivo en la petición')
            return NextResponse.json({ error: 'No se encontró archivo' }, { status: 400 })
        }

        console.log('📁 Archivo recibido:', {
            name: file.name,
            size: file.size,
            type: file.type
        })

        // Validar el tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!validTypes.includes(file.type)) {
            console.log('❌ Tipo de archivo no válido:', file.type)
            return NextResponse.json({ 
                error: `Tipo de archivo no válido: ${file.type}. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y videos (MP4, WebM)` 
            }, { status: 400 })
        }

        // Validar el tamaño del archivo (1GB máximo)
        const maxSize = 1024 * 1024 * 1024 // 1GB
        if (file.size > maxSize) {
            console.log('❌ Archivo demasiado grande:', file.size)
            return NextResponse.json({ 
                error: `El archivo es demasiado grande. Tamaño máximo: 1GB` 
            }, { status: 400 })
        }

        // Preparar el nombre del archivo
        const fileExt = file.name.split('.').pop()
        const fileType = file.type.startsWith('video/') ? 'video' : 'image'
        const fileName = `${fileType}-${Date.now()}.${fileExt}`

        console.log('📝 Nombre del archivo generado:', fileName)

        // Subir a Supabase Storage
        const supabase = getSupabaseClient({ admin: true })
        
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
                contentType: file.type
            })

        if (error) {
            console.error('❌ Error subiendo archivo a Supabase:', error)
            return NextResponse.json({ 
                error: `Error subiendo archivo: ${error.message}` 
            }, { status: 500 })
        }

        console.log('📤 Archivo subido exitosamente:', data.path)

        // Obtener URL pública
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        console.log('🔗 URL pública generada:', publicUrlData.publicUrl)

        return NextResponse.json({ 
            success: true,
            url: publicUrlData.publicUrl,
            fileName: fileName
        })

    } catch (error) {
        console.error('💥 Error en la API de upload-avatar:', error)
        const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor'
        return NextResponse.json({ 
            error: errorMessage 
        }, { status: 500 })
    }
}
