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
        const files = formData.getAll('images') as File[]
        const itemId = formData.get('itemId') as string

        if (!files.length) {
            return NextResponse.json(
                { error: 'No se enviaron archivos' },
                { status: 400 }
            )
        }

        console.log(`🔄 Subiendo ${files.length} imágenes para item ${itemId}`)

        // Usar cliente admin de Supabase
        const supabase = getSupabaseClient({ admin: true })
        
        const uploadPromises = files.map(async (file, index) => {
            try {
                const fileExt = file.name.split('.').pop()
                const timestamp = Date.now()
                const randomId = Math.random().toString(36).substring(7)
                
                // Crear estructura: items/item-{id}/image-{timestamp}-{index}-{random}.{ext}
                const folderName = itemId ? `item-${itemId}` : `temp-${timestamp}`
                const fileName = `${folderName}/image-${timestamp}-${index}-${randomId}.${fileExt}`
                
                console.log(`📤 Subiendo archivo ${index + 1}:`, fileName)
                
                // Convertir File a ArrayBuffer
                const arrayBuffer = await file.arrayBuffer()
                const fileBuffer = new Uint8Array(arrayBuffer)
                
                const { data, error } = await supabase.storage
                    .from('items')
                    .upload(fileName, fileBuffer, {
                        cacheControl: '3600',
                        upsert: true,
                        contentType: file.type
                    })

                if (error) {
                    console.error(`❌ Error subiendo archivo ${index + 1}:`, error)
                    throw new Error(`Error subiendo archivo ${file.name}: ${error.message}`)
                }

                // Obtener URL pública
                const { data: publicUrlData } = supabase.storage
                    .from('items')
                    .getPublicUrl(fileName)

                console.log(`✅ Archivo ${index + 1} subido:`, publicUrlData.publicUrl)
                return publicUrlData.publicUrl

            } catch (error) {
                console.error(`💥 Error procesando archivo ${index + 1}:`, error)
                throw error
            }
        })

        const uploadedUrls = await Promise.all(uploadPromises)
        
        console.log(`🎉 Todas las imágenes subidas exitosamente para item ${itemId}`)
        
        return NextResponse.json({
            success: true,
            urls: uploadedUrls,
            message: `${uploadedUrls.length} imágenes subidas exitosamente`
        })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.error('💥 Error en API de subida:', errorMessage)
        
        return NextResponse.json(
            { 
                success: false, 
                error: errorMessage 
            },
            { status: 500 }
        )
    }
}
