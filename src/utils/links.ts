import { getSupabaseClient } from '@/lib/supabase-db'
import { LinkItem, SortMode } from '@/types/product'
import { filterValidItemsForPublic } from '@/utils/validation-utils'

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
  mixcloud?: SocialIcon
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
  itemButtonColor?: string
}

export interface LinksData {
  links: LinkItem[]
  categories: string[]
  sortMode: SortMode
  title?: string
  description: string
  profileImage: string
  profileImageType: ProfileImageType
  socialIcons: SocialIcons
  backgroundColor?: string
  backgroundSettings?: BackgroundSettings
  styleSettings?: StyleSettings
}

const DEFAULT_LINKS_DATA: LinksData = {
  links: [],
  categories: ["Música", "Tienda", "Eventos", "Prensa", "Posts"],
  sortMode: 'manual',
  title: "biomechanics.wav",
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
    productBuyButtonColor: "#ff6b35",
    itemButtonColor: "#3b82f6"
  }
};

export async function getLinksData(options?: { includeInvalid?: boolean }): Promise<LinksData> {
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
      return transformDataFromSupabase(data.data, options?.includeInvalid);
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
function transformDataFromSupabase(data: any, includeInvalid: boolean = false): LinksData {
  if (!data) {
    return DEFAULT_LINKS_DATA;
  }
  
    // Si los datos ya están en el formato correcto
    if (typeof data === 'object' && 'links' in data) {
      const transformedData = {
        ...DEFAULT_LINKS_DATA,
        ...data,
      };
      
      // Migración: agregar categorías por defecto si no existen
      if (!transformedData.categories) {
        transformedData.categories = ["Destacados", "Música", "Tienda", "Eventos", "Prensa", "Posts"];
      }
      
      // Migración: agregar sortMode por defecto si no existe
      if (!transformedData.sortMode) {
        transformedData.sortMode = 'manual';
      }
      
      // Filtrar items válidos para vista pública (solo si no es admin)
      if (!includeInvalid) {
        transformedData.links = filterValidItemsForPublic(transformedData.links || []);
      }
      
      return transformedData;
    }  // Si los datos están en el formato antiguo (items en lugar de links)
  const migratedData: LinksData = {
    links: includeInvalid ? (data.items || []) : filterValidItemsForPublic(data.items || []), // Filtrar items válidos solo si no es admin
    categories: data.categories || ["Música", "Tienda", "Eventos", "Prensa", "Posts"],
    sortMode: data.sortMode || 'manual',
    title: data.title || DEFAULT_LINKS_DATA.title,
    description: data.description || DEFAULT_LINKS_DATA.description,
    profileImage: data.profileImage || DEFAULT_LINKS_DATA.profileImage,
    profileImageType: data.profileImageType || DEFAULT_LINKS_DATA.profileImageType,
    socialIcons: data.socialIcons || DEFAULT_LINKS_DATA.socialIcons,
    backgroundColor: data.backgroundColor || DEFAULT_LINKS_DATA.backgroundColor,
    backgroundSettings: data.backgroundSettings || DEFAULT_LINKS_DATA.backgroundSettings,
    styleSettings: data.styleSettings || DEFAULT_LINKS_DATA.styleSettings
  };
  
  return migratedData;
}