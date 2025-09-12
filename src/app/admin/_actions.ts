'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getLinksData, LinksData, SocialIcons } from '@/utils/links'
import { getSupabaseClient } from '@/lib/supabase-db'
import { LinkItem, Product } from '@/types/product'
import { cleanupItemCategories } from '@/utils/category-utils'

// Función para guardar datos en Supabase
export async function saveLinksToSupabase(linksData: LinksData) {
  try {
    // Usar el cliente admin de Supabase para operaciones del servidor
    const supabase = getSupabaseClient({ admin: true });

    // Log del proceso
    console.log('💾 Iniciando guardado en Supabase...')
    console.log('📊 Resumen de datos:', {
      linksCount: linksData.links?.length || 0,
      description: linksData.description?.substring(0, 50) + '...',
      profileImage: linksData.profileImage ? 'URL presente' : 'Sin imagen',
      profileImageType: linksData.profileImageType,
      backgroundType: linksData.backgroundSettings?.type,
      backgroundImage: linksData.backgroundSettings?.imageUrl ? 'URL presente' : 'Sin imagen de fondo',
      productCount: linksData.links?.filter(item => item.type === 'product').length || 0,
      itemCount: linksData.links?.filter(item => item.type === 'item').length || 0,
      linkCount: linksData.links?.filter(item => item.type === 'link' || !item.type).length || 0
    })

    // Verificar si existe un registro
    const { data: existingData } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 'default')
      .single();

    let result;
    
    if (existingData) {
      // Si existe, actualizar
      console.log('🔄 Actualizando registro existente...')
      result = await supabase
        .from('site_settings')
        .update({ 
          data: linksData,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');
    } else {
      // Si no existe, insertar
      console.log('🆕 Creando nuevo registro...')
      result = await supabase
        .from('site_settings')
        .insert({ 
          id: 'default',
          data: linksData,
          updated_at: new Date().toISOString()
        });
    }

    if (result.error) {
      throw new Error(`Error al actualizar Supabase: ${result.error.message}`);
    }

    console.log('✅ Datos guardados exitosamente en Supabase')
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error guardando datos en Supabase:', error);
    throw new Error(`Error guardando datos: ${error.message}`);
  }
}

export async function updateAdminLinksWithProducts(items: LinkItem[], otherData: Partial<LinksData>) {
  try {
    // Verificar permisos
    if (!checkRole('admin')) {
      throw new Error('No tienes autorización para esta acción')
    }
    
    // Obtener los datos actuales para mantener la estructura
    const currentData = await getLinksData()
    
    // Limpiar categorías de los items antes de guardar
    const cleanedItems = cleanupItemCategories(items, currentData.categories || [])
    
    console.log('📋 Datos actuales vs nuevos:', {
      currentBackgroundUrl: currentData.backgroundSettings?.imageUrl,
      newBackgroundUrl: otherData.backgroundSettings?.imageUrl,
      currentProfileImage: currentData.profileImage,
      newProfileImage: otherData.profileImage,
      itemsWithCategoriesCleanup: cleanedItems.filter(item => 
        JSON.stringify(item.categories) !== JSON.stringify(items.find(i => i.id === item.id)?.categories)
      ).length
    })
    
    // Crear el objeto de datos para la base de datos
    // Asegurándonos de que los datos nuevos sobrescriban los actuales
    const linksData: LinksData = {
      ...currentData,
      ...otherData,
      links: cleanedItems, // Usar los items con categorías limpias
      // Asegurar que los datos críticos se actualicen correctamente
      profileImage: otherData.profileImage ?? currentData.profileImage,
      profileImageType: otherData.profileImageType ?? currentData.profileImageType,
      backgroundSettings: otherData.backgroundSettings ? {
        type: otherData.backgroundSettings.type ?? currentData.backgroundSettings?.type ?? 'color',
        color: otherData.backgroundSettings.color ?? currentData.backgroundSettings?.color ?? '#000000',
        imageUrl: otherData.backgroundSettings.imageUrl ?? currentData.backgroundSettings?.imageUrl ?? '',
        imageOpacity: otherData.backgroundSettings.imageOpacity ?? currentData.backgroundSettings?.imageOpacity ?? 0.5
      } : currentData.backgroundSettings
    }
    
    console.log('💾 Guardando datos en Supabase:', {
      linksCount: items.length,
      profileImage: linksData.profileImage,
      backgroundImage: linksData.backgroundSettings?.imageUrl,
      backgroundType: linksData.backgroundSettings?.type,
      productImages: items.filter(item => item.type === 'product').map(item => item.images?.length || 0),
      itemImages: items.filter(item => item.type === 'item').map(item => item.images?.length || 0)
    })
    
    // Guardar en Supabase
    await saveLinksToSupabase(linksData)
    
    // Revalidar todas las rutas que pueden usar estos datos
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Enlaces y productos actualizados con éxito' }
  } catch (error) {
    console.error('Error al actualizar enlaces y productos:', error)
    return { success: false, error: (error as Error).message }
  }
}
