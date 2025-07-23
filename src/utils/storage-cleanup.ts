import { getSupabaseClient } from '@/lib/supabase-db'

export async function cleanupOldFiles(bucket: string, maxAge: number = 30 * 24 * 60 * 60 * 1000) {
    try {
        const supabase = getSupabaseClient({ admin: true })
        
        // Listar archivos en el bucket
        const { data: files, error } = await supabase.storage
            .from(bucket)
            .list()

        if (error) {
            console.error(`Error listando archivos en bucket ${bucket}:`, error)
            return
        }

        if (!files || files.length === 0) {
            console.log(`No hay archivos en el bucket ${bucket}`)
            return
        }

        // Filtrar archivos antiguos
        const now = new Date()
        const oldFiles = files.filter(file => {
            if (!file.updated_at) return false
            const fileDate = new Date(file.updated_at)
            return (now.getTime() - fileDate.getTime()) > maxAge
        })

        console.log(`Encontrados ${oldFiles.length} archivos antiguos en ${bucket}`)

        // Eliminar archivos antiguos
        if (oldFiles.length > 0) {
            const filePaths = oldFiles.map(file => file.name)
            const { error: deleteError } = await supabase.storage
                .from(bucket)
                .remove(filePaths)

            if (deleteError) {
                console.error(`Error eliminando archivos antiguos de ${bucket}:`, deleteError)
            } else {
                console.log(`Eliminados ${oldFiles.length} archivos antiguos de ${bucket}`)
            }
        }

    } catch (error) {
        console.error(`Error en cleanup de ${bucket}:`, error)
    }
}

// Función para limpiar archivos temporales no utilizados
export async function cleanupTempFiles() {
    try {
        // Limpiar archivos temporales en todos los buckets
        await cleanupOldFiles('avatars', 7 * 24 * 60 * 60 * 1000) // 7 días
        await cleanupOldFiles('backgrounds', 7 * 24 * 60 * 60 * 1000) // 7 días
        await cleanupOldFiles('products', 30 * 24 * 60 * 60 * 1000) // 30 días
        await cleanupOldFiles('items', 30 * 24 * 60 * 60 * 1000) // 30 días
        
        console.log('✅ Cleanup de archivos completado')
    } catch (error) {
        console.error('❌ Error en cleanup general:', error)
    }
}
