'use server'

import { getSupabaseClient } from '@/lib/supabase-db'
import { getLinksData } from '@/utils/links'
import { checkRole } from '@/utils/roles'
import { revalidatePath } from 'next/cache'

export async function migrateJsonToSupabase() {
  // Verificar que el usuario sea administrador
  if (!checkRole('admin')) {
    throw new Error('Solo los administradores pueden realizar esta migración')
  }
  
  try {
    // Obtener datos actuales desde el archivo JSON
    const linksData = await getLinksData()
    
    // Conectar a Supabase con permisos de escritura
    const supabase = getSupabaseClient({ admin: true })
    
    // Intentar insertar los datos en Supabase
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'default',
        data: linksData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      
    if (error) {
      throw new Error(`Error al migrar datos a Supabase: ${error.message}`)
    }
    
    // Revalidar las rutas tras migración exitosa
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Migración completada con éxito' }
  } catch (error) {
    console.error('Error en la migración:', error)
    return { success: false, error: (error as Error).message }
  }
}
