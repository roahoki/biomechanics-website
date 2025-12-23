import { getSupabaseClient } from '@/lib/supabase-db'
import { checkRole } from '@/utils/roles'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    console.log('🚀 API upload-product-images iniciada')
    
    try {
        // Verificar permisos admin
        console.log('🔐 Verificando permisos admin...')
        if (!checkRole('admin')) {
            console.log('❌ Permisos insuficientes')
            return NextResponse.json(
                { error: 'No tienes autorización para esta acción' },
                { status: 403 }
            )
        }
        console.log('✅ Permisos admin verificados')

        const formData = await request.formData()
        const files = formData.getAll('images') as File[]
        const productId = formData.get('productId') as string

        console.log(`📊 Recibidos: ${files.length} archivos para producto ${productId}`)

        if (!files.length) {
            console.log('❌ No se enviaron archivos')
            return NextResponse.json(
                { error: 'No se enviaron archivos' },
                { status: 400 }
            )
        }

        console.log(`🔄 Subiendo ${files.length} imágenes para producto ${productId}`)

        // Usar cliente admin de Supabase
        const supabase = getSupabaseClient({ admin: true })
        console.log('📡 Cliente Supabase admin creado')
        
        const uploadPromises = files.map(async (file, index) => {
            try {
                const fileExt = file.name.split('.').pop()
                const timestamp = Date.now()
                const randomId = Math.random().toString(36).substring(7)
                
                // Crear estructura: products/product-{id}/image-{timestamp}-{index}-{random}.{ext}
                const folderName = productId ? `product-${productId}` : `temp-${timestamp}`
                const fileName = `${folderName}/image-${timestamp}-${index}-${randomId}.${fileExt}`
                
                console.log(`📤 Subiendo archivo ${index + 1}:`, fileName)
                
                // Convertir File a ArrayBuffer
                const arrayBuffer = await file.arrayBuffer()
                const fileBuffer = new Uint8Array(arrayBuffer)
                
                const { data, error } = await supabase.storage
                    .from('products')
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
                    .from('products')
                    .getPublicUrl(fileName)

                console.log(`✅ Archivo ${index + 1} subido:`, publicUrlData.publicUrl)
                return publicUrlData.publicUrl

            } catch (error) {
                console.error(`💥 Error procesando archivo ${index + 1}:`, error)
                throw error
            }
        })

        const uploadedUrls = await Promise.all(uploadPromises)
        
        console.log(`🎉 Todas las imágenes subidas exitosamente para producto ${productId}`)
        
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
