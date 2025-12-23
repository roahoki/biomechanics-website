import { getSupabaseClient } from '@/lib/supabase-db'
import { checkRole } from '@/utils/roles'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        // Verificar permisos admin
        if (!checkRole('admin')) {
            return NextResponse.json(
                { error: 'No tienes autorización para esta acción' },
                { status: 403 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('image') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No se envió archivo' },
                { status: 400 }
            )
        }

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Solo se permiten archivos de imagen' },
                { status: 400 }
            )
        }

        // Validar tamaño (máximo 1GB)
        if (file.size > 1024 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'La imagen debe ser menor a 1GB' },
                { status: 400 }
            )
        }

        console.log(`🔄 Subiendo imagen de fondo: ${file.name}`)

        // Usar cliente admin de Supabase
        const supabase = getSupabaseClient({ admin: true })
        
        try {
            const fileExt = file.name.split('.').pop()
            const timestamp = Date.now()
            const randomId = Math.random().toString(36).substring(7)
            
            // Crear nombre único para la imagen de fondo
            const fileName = `background-${timestamp}-${randomId}.${fileExt}`
            
            console.log(`📤 Subiendo imagen de fondo:`, fileName)
            
            // Convertir File a ArrayBuffer
            const arrayBuffer = await file.arrayBuffer()
            const fileBuffer = new Uint8Array(arrayBuffer)
            
            const { data, error } = await supabase.storage
                .from('backgrounds')
                .upload(fileName, fileBuffer, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: file.type
                })

            if (error) {
                console.error(`❌ Error subiendo imagen de fondo:`, error)
                throw new Error(`Error subiendo imagen de fondo: ${error.message}`)
            }

            // Obtener URL pública
            const { data: publicUrlData } = supabase.storage
                .from('backgrounds')
                .getPublicUrl(fileName)

            console.log(`✅ Imagen de fondo subida:`, publicUrlData.publicUrl)
            
            return NextResponse.json({
                success: true,
                url: publicUrlData.publicUrl,
                message: 'Imagen de fondo subida exitosamente'
            })

        } catch (error) {
            console.error(`💥 Error procesando imagen de fondo:`, error)
            throw error
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.error('💥 Error en API de subida de fondo:', errorMessage)
        
        return NextResponse.json(
            { 
                success: false, 
                error: errorMessage 
            },
            { status: 500 }
        )
    }
}
