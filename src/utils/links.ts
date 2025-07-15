import { getSupabaseClient } from '@/lib/supabase-db'
import { LinkItem } from '@/types/product'

export interface Link {
  id: number
  url: string
  label: string
  type?: 'link'
}

export type ProfileImageType = 'image' | 'video' | 'gif'

export interface SocialIcon {
  url?: string
  color: string
}

export interface SocialIcons {
  instagram?: SocialIcon
  soundcloud?: SocialIcon
  youtube?: SocialIcon
  tiktok?: SocialIcon
}

export interface BackgroundSettings {
  type: 'color' | 'image'
  color?: string
  imageUrl?: string
  imageOpacity?: number
}

export interface StyleSettings {
  titleColor?: string
  linkCardBackgroundColor?: string
  linkCardTextColor?: string
  productBuyButtonColor?: string
}

export interface LinksData {
  links: LinkItem[]
  description: string
  profileImage: string
  profileImageType: ProfileImageType
  socialIcons: SocialIcons
  backgroundColor?: string // Mantener compatibilidad hacia atrás
  backgroundSettings?: BackgroundSettings
  styleSettings?: StyleSettings
}

const DEFAULT_LINKS_DATA: LinksData = {
  links: [],
  description: "biomechanics.wav",
  profileImage: "/ghost.jpg", // URL a una imagen por defecto
  profileImageType: "image",
  socialIcons: {},
  backgroundColor: "#1a1a1a",
  backgroundSettings: {
    type: 'color',
    color: "#1a1a1a",
    imageOpacity: 0.5
  },
  styleSettings: {
    titleColor: "#ffffff",
    linkCardBackgroundColor: "#ffffff",
    linkCardTextColor: "#000000",
    productBuyButtonColor: "#ff6b35"
  }
};

export async function getLinksData(): Promise<LinksData> {
  try {
    // Obtener datos únicamente desde Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    // Si encontramos datos en Supabase, usarlos
    if (data && !error && data.data) {
      console.log('Datos cargados desde Supabase correctamente');
      return transformDataFromSupabase(data.data);
    }
    
    // Si hay un error o no hay datos, registrarlo y usar valores por defecto
    if (error) {
      console.warn('Error al obtener datos de Supabase:', error.message);
    } else if (!data) {
      console.warn('No se encontraron datos en Supabase');
    } else if (!data.data) {
      console.warn('El formato de datos en Supabase es incorrecto');
    }
    
    // Devolver valores por defecto
    return DEFAULT_LINKS_DATA;
  } catch (error) {
    console.error('Error al cargar los enlaces desde Supabase:', error);
    return DEFAULT_LINKS_DATA;
  }
}

// Función para transformar datos desde el formato de Supabase
function transformDataFromSupabase(data: any): LinksData {
  if (!data) {
    return DEFAULT_LINKS_DATA;
  }
  
  // Si los datos ya están en el formato correcto
  if (typeof data === 'object' && 'links' in data) {
    return {
      ...DEFAULT_LINKS_DATA,
      ...data,
    };
  }
  
  // Si los datos están en el formato antiguo (items en lugar de links)
  return {
    links: data.items || [],
    description: data.description || DEFAULT_LINKS_DATA.description,
    profileImage: data.profileImage || DEFAULT_LINKS_DATA.profileImage,
    profileImageType: data.profileImageType || DEFAULT_LINKS_DATA.profileImageType,
    socialIcons: data.socialIcons || DEFAULT_LINKS_DATA.socialIcons,
    backgroundColor: data.backgroundColor || DEFAULT_LINKS_DATA.backgroundColor,
    backgroundSettings: data.backgroundSettings || DEFAULT_LINKS_DATA.backgroundSettings,
    styleSettings: data.styleSettings || DEFAULT_LINKS_DATA.styleSettings
  };
}