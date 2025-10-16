'use server'

import { getSupabaseClient } from '@/lib/supabase-db'
import { checkRole } from '@/utils/roles'
import { revalidatePath } from 'next/cache'
import { LinksData } from '@/utils/links'

/**
 * Script de migración para agregar campos de fecha a items existentes
 * - Agrega publicationDate (obligatorio) con fecha actual a todos los items que no lo tengan
 * - activityDate se mantiene como null (opcional)
 */
export async function addDatesToExistingItems() {
  // Verificar que el usuario sea administrador
  if (!checkRole('admin')) {
    throw new Error('Solo los administradores pueden ejecutar esta migración')
  }
  
  try {
    const supabase = getSupabaseClient({ admin: true })
    
    // Obtener la configuración actual
    const { data: currentData, error: fetchError } = await supabase
      .from('site_settings')
      .select('data')
      .eq('id', 'default')
      .single()
      
    if (fetchError) {
      console.error('Error al obtener datos:', fetchError)
      throw new Error(`Error al obtener configuración: ${fetchError.message}`)
    }
    
    if (!currentData?.data) {
      throw new Error('No se encontró configuración en la base de datos')
    }
    
    const linksData = currentData.data as LinksData
    
    // Contador de items actualizados
    let itemsUpdated = 0
    const today = new Date().toISOString().split('T')[0]
    
    // Actualizar items que no tengan publicationDate
    const updatedLinks = linksData.links.map(link => {
      if (link.type === 'item') {
        const item = link as any
        
        // Si no tiene publicationDate, agregarlo
        if (!item.publicationDate) {
          itemsUpdated++
          return {
            ...item,
            publicationDate: today,
            activityDate: item.activityDate || null // Mantener activityDate si existe, si no null
          }
        }
      }
      return link
    })
    
    // Solo actualizar si hubo cambios
    if (itemsUpdated > 0) {
      const updatedData: LinksData = {
        ...linksData,
        links: updatedLinks
      }
      
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ data: updatedData })
        .eq('id', 'default')
        
      if (updateError) {
        console.error('Error al actualizar:', updateError)
        throw new Error(`Error al actualizar: ${updateError.message}`)
      }
      
      // Revalidar rutas
      revalidatePath('/admin/links')
      revalidatePath('/links')
      
      return {
        success: true,
        message: `✅ Migración completada. ${itemsUpdated} items actualizados con publicationDate: ${today}`,
        itemsUpdated
      }
    } else {
      return {
        success: true,
        message: '✅ Todos los items ya tienen publicationDate. No se requieren cambios.',
        itemsUpdated: 0
      }
    }
    
  } catch (error) {
    console.error('Error en migración:', error)
    throw error
  }
}
