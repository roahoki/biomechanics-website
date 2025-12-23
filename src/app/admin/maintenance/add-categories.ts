'use server'

import { getSupabaseClient } from '@/lib/supabase-db'
import { checkAdminPermissions } from '@/utils/roles'

export async function addCategoriesToExistingData() {
  try {
    // Verificar permisos
    const hasPermissions = await checkAdminPermissions()
    if (!hasPermissions) {
      return { success: false, error: 'No tienes autorización para esta acción' }
    }

    const supabase = getSupabaseClient({ admin: true })

    // Obtener los datos actuales
    const { data: currentData, error: fetchError } = await supabase
      .from('site_settings')
      .select('*')
      .single()

    if (fetchError) {
      console.error('Error al obtener datos actuales:', fetchError)
      return { success: false, error: 'Error al obtener datos actuales: ' + fetchError.message }
    }

    console.log('Estructura de datos actual:', Object.keys(currentData))
    console.log('Datos completos:', currentData)

    // Detectar qué columna contiene los datos JSON
    let dataColumn = null
    let currentSettings = null

    if (currentData.data) {
      dataColumn = 'data'
      currentSettings = currentData.data
    } else if (currentData.settings) {
      dataColumn = 'settings'
      currentSettings = currentData.settings
    } else if (currentData.config) {
      dataColumn = 'config'
      currentSettings = currentData.config
    } else {
      // Si no hay columna específica, usar toda la fila excepto id y timestamps
      const { id, created_at, updated_at, ...rest } = currentData
      currentSettings = rest
      dataColumn = 'direct'
    }

    console.log('Columna detectada:', dataColumn)
    console.log('Configuración actual:', currentSettings)

    // Verificar si ya tiene categorías
    if (currentSettings && currentSettings.categories) {
      return { success: true, message: 'Los datos ya tienen categorías configuradas' }
    }

    // Agregar categorías a los datos existentes
    const updatedSettings = {
      ...currentSettings,
      categories: ["Música", "Tienda", "Eventos", "Prensa", "Posts"]
    }

    console.log('Configuración actualizada:', updatedSettings)

    // Actualizar en Supabase según la estructura detectada
    let updateData = {}
    if (dataColumn === 'direct') {
      updateData = updatedSettings
    } else {
      updateData = { [dataColumn]: updatedSettings }
    }

    const { error: updateError } = await supabase
      .from('site_settings')
      .update(updateData)
      .eq('id', currentData.id)

    if (updateError) {
      console.error('Error al actualizar datos:', updateError)
      return { success: false, error: 'Error al actualizar datos: ' + updateError.message }
    }

    return { 
      success: true, 
      message: `Categorías agregadas exitosamente usando la columna '${dataColumn}'` 
    }
  } catch (error) {
    console.error('Error en addCategoriesToExistingData:', error)
    return { 
      success: false, 
      error: 'Error interno: ' + (error as Error).message 
    }
  }
}
