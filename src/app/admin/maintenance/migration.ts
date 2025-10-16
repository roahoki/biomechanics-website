'use server'

import { getSupabaseClient } from '@/lib/supabase-db'
import { checkRole } from '@/utils/roles'
import { revalidatePath } from 'next/cache'
import { LinksData } from '@/utils/links'

// Configuración inicial para la base de datos
const initialConfig: LinksData = {
  links: [
    {
      id: 1,
      url: "https://www.instagram.com/biomechanics.wav",
      label: "Instagram 📷"
    },
    {
      id: 2,
      url: "https://www.soundcloud.com/biomechanics-wav",
      label: "Soundcloud 🌨️"
    },
    {
      id: 3,
      url: "https://youtube.com/@biomechanics-wav",
      label: "Youtube🎵"
    },
    {
      id: 4,
      url: "https://www.tiktok.com/@biomechanics.wav",
      label: "TikTok🕺🏼"
    },
    {
      id: 5,
      url: "https://www.biomechanics.cl/",
      label: "Website Oficial🌎"
    }
  ],
  categories: ["Música", "Tienda", "Eventos", "Prensa", "Posts"],
  sortMode: 'manual',
  title: "biomechanics.wav",
  description: "Biomechanics Links",
  profileImage: "/profile.jpg",
  profileImageType: "image",
  socialIcons: {
    instagram: {
      url: "https://www.instagram.com/biomechanics.wav",
      color: "#ff00f7"
    },
    soundcloud: {
      url: "https://www.soundcloud.com/biomechanics-wav",
      color: "#ff00f7"
    },
    youtube: {
      url: "https://youtube.com/@biomechanics-wav",
      color: "#ff00f7"
    },
    tiktok: {
      url: "https://www.tiktok.com/@biomechanics.wav",
      color: "#ff00f7"
    }
  },
  backgroundColor: "#3300ff",
  backgroundSettings: {
    type: 'color',
    color: "#3300ff",
    imageOpacity: 0.5
  },
  styleSettings: {
    titleColor: "#dbdb00",
    linkCardBackgroundColor: "#0e0c18",
    linkCardTextColor: "#cccccc",
    productBuyButtonColor: "#ff6b35",
    itemButtonColor: "#3b82f6"
  }
};

export async function migrateJsonToSupabase() {
  // Verificar que el usuario sea administrador
  if (!checkRole('admin')) {
    throw new Error('Solo los administradores pueden realizar esta inicialización')
  }
  
  try {
    // Conectar a Supabase con permisos de escritura
    const supabase = getSupabaseClient({ admin: true })
    
    // Verificar si ya existe una configuración
    const { data: existingData, error: fetchError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('id', 'default')
      .single();
      
    if (existingData) {
      return { success: true, message: 'La configuración ya existe en Supabase' };
    }
    
    // Si no existe, crear la configuración inicial
    const { error } = await supabase
      .from('site_settings')
      .insert({
        id: 'default',
        data: initialConfig,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      throw new Error(`Error al inicializar datos en Supabase: ${error.message}`)
    }
    
    // Revalidar las rutas tras inicialización exitosa
    revalidatePath('/links')
    revalidatePath('/admin/links')
    
    return { success: true, message: 'Inicialización de base de datos completada con éxito' }
  } catch (error) {
    console.error('Error en la migración:', error)
    return { success: false, error: (error as Error).message }
  }
}
