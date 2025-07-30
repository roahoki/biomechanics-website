'use server'

import { getSupabaseClient } from '@/lib/supabase-db'
import { checkAdminPermissions } from '../check-permissions'

export async function diagnoseDatabaseStructure() {
  try {
    // Verificar permisos
    const hasPermissions = await checkAdminPermissions()
    if (!hasPermissions) {
      return { success: false, error: 'No tienes autorización para esta acción' }
    }

    const supabase = getSupabaseClient({ admin: true })

    // Obtener todos los datos de la tabla
    const { data: allData, error: fetchError } = await supabase
      .from('site_settings')
      .select('*')

    if (fetchError) {
      console.error('Error al obtener datos:', fetchError)
      return { success: false, error: 'Error al obtener datos: ' + fetchError.message }
    }

    console.log('Todos los datos de la tabla:', allData)

    if (!allData || allData.length === 0) {
      return { success: false, error: 'No hay datos en la tabla site_settings' }
    }

    const firstRow = allData[0]
    const columns = Object.keys(firstRow)
    
    return { 
      success: true, 
      data: {
        totalRows: allData.length,
        columns: columns,
        firstRowData: firstRow,
        allData: allData
      }
    }
  } catch (error) {
    console.error('Error en diagnoseDatabaseStructure:', error)
    return { 
      success: false, 
      error: 'Error interno: ' + (error as Error).message 
    }
  }
}
