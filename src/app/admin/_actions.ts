'use server'

import { checkRole } from '@/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { getLinksData, LinksData, SocialIcons } from '@/utils/links'
import { getSupabaseClient } from '@/lib/supabase-db'

export async function setRole(formData: FormData): Promise<void> {
    const client = await clerkClient()

    // Check that the user trying to set the role is an admin
    if (!checkRole('admin')) {
        throw new Error('Not Authorized')
    }

    try {
        await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { role: formData.get('role') },
        })
    } catch (err) {
        console.error(err)
        throw new Error('Failed to set role')
    }
}

export async function removeRole(formData: FormData): Promise<void> {
    const client = await clerkClient()

    try {
        await client.users.updateUserMetadata(formData.get('id') as string, {
            publicMetadata: { role: null },
        })
    } catch (err) {
        console.error(err)
        throw new Error('Failed to remove role')
    }
}

// Función para guardar datos en Supabase
export async function saveLinksToSupabase(linksData: LinksData) {
  try {
    // Usar el cliente admin de Supabase para operaciones del servidor
    const supabase = getSupabaseClient({ admin: true });

    // Verificar si existe un registro
    const { data: existingData } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 'default')
      .single();

    let result;
    
    if (existingData) {
      // Si existe, actualizar
      result = await supabase
        .from('site_settings')
        .update({ 
          data: linksData,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'default');
    } else {
      // Si no existe, insertar
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

    return { success: true };
  } catch (error: any) {
    console.error('Error guardando datos en Supabase:', error);
    throw new Error(`Error guardando datos: ${error.message}`);
  }
}

export async function updateAdminLinks(formData: FormData) {
  try {
    // Verificar permisos
    if (!checkRole('admin')) {
      throw new Error('No tienes autorización para esta acción')
    }
    
    // Obtener los datos actuales para mantener la estructura
    const currentData = await getLinksData()
    
    // Obtener la descripción del formulario
    const description = formData.get('description')?.toString() || currentData.description || ''
    
    // Manejar la imagen/video de perfil si se proporciona una nueva
    let profileImage = currentData.profileImage
    let profileImageType = currentData.profileImageType
    
    const newProfileImage = formData.get('newProfileImage')?.toString()
    const newProfileImageType = formData.get('newProfileImageType')?.toString()
    
    if (newProfileImage && newProfileImage.trim() !== '') {
      profileImage = newProfileImage.trim()
      profileImageType = (newProfileImageType as any) || 'image'
    }
    
    // Manejar colores de iconos sociales
    const socialIcons: SocialIcons = {
      ...currentData.socialIcons,
      instagram: {
        url: currentData.socialIcons.instagram?.url,
        color: formData.get('socialIcon_instagram_color')?.toString() || currentData.socialIcons.instagram?.color || '#E4405F'
      },
      soundcloud: {
        url: currentData.socialIcons.soundcloud?.url,
        color: formData.get('socialIcon_soundcloud_color')?.toString() || currentData.socialIcons.soundcloud?.color || '#FF5500'
      },
      youtube: {
        url: currentData.socialIcons.youtube?.url,
        color: formData.get('socialIcon_youtube_color')?.toString() || currentData.socialIcons.youtube?.color || '#FF0000'
      },
      tiktok: {
        url: currentData.socialIcons.tiktok?.url,
        color: formData.get('socialIcon_tiktok_color')?.toString() || currentData.socialIcons.tiktok?.color || '#000000'
      }
    }
    
    // Manejar color de fondo
    const backgroundColor = formData.get('backgroundColor')?.toString() || currentData.backgroundColor || '#1a1a1a'
    
    // Manejar configuración de fondo
    const backgroundType = formData.get('backgroundType')?.toString() as 'color' | 'image' || 'color'
    const backgroundImageUrl = formData.get('backgroundImageUrl')?.toString() || currentData.backgroundSettings?.imageUrl || ''
    const backgroundImageOpacity = parseFloat(formData.get('backgroundImageOpacity')?.toString() || '0.5')
    
    const backgroundSettings = {
      type: backgroundType,
      color: backgroundColor,
      imageUrl: backgroundImageUrl,
      imageOpacity: backgroundImageOpacity
    }
    
    // Manejar configuración de estilos (colores de elementos)
    const styleSettings = {
      titleColor: formData.get('titleColor')?.toString() || currentData.styleSettings?.titleColor || '#ffffff',
      linkCardBackgroundColor: formData.get('linkCardBackgroundColor')?.toString() || currentData.styleSettings?.linkCardBackgroundColor || '#ffffff',
      linkCardTextColor: formData.get('linkCardTextColor')?.toString() || currentData.styleSettings?.linkCardTextColor || '#000000'
    }
    
    // Procesar los enlaces
    const ids = formData.getAll('id').map(id => Number(id))
    const urls = formData.getAll('url').map(url => url.toString())
    const labels = formData.getAll('label').map(label => label.toString())
    
    // Crear el nuevo array de enlaces
    const newItems = ids.map((id, index) => ({
      id: id,
      url: urls[index],
      label: labels[index]
    }))
    
    // Crear el objeto de datos para la base de datos
    const linksData: LinksData = {
      description,
      profileImage,
      profileImageType,
      backgroundColor,
      backgroundSettings,
      styleSettings,
      socialIcons,
      links: newItems
    }
    
    // Guardar en Supabase y como fallback en el archivo local
    await saveLinksToSupabase(linksData)
    
    // Revalidar todas las rutas que pueden usar estos datos
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Enlaces actualizados con éxito' }
  } catch (error) {
    console.error('Error al actualizar enlaces:', error)
    return { success: false, error: (error as Error).message }
  }
}
