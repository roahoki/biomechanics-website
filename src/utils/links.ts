import fs from 'fs/promises'
import path from 'path'
import { getSupabaseClient } from '@/lib/supabase-db'

export interface Link {
  id: number
  url: string
  label: string
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
}

export interface LinksData {
  links: Link[]
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
  description: "",
  profileImage: "/profile.jpg",
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
    linkCardTextColor: "#000000"
  }
};

export async function getLinksData(): Promise<LinksData> {
  try {
    // Intentar obtener datos desde Supabase primero
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    // Si encontramos datos en Supabase, usarlos
    if (data && !error) {
      console.log('Datos cargados desde Supabase correctamente');
      return transformDataFromSupabase(data.data);
    }
    
    // En producción, solo intentar usar Supabase
    if (process.env.NODE_ENV === 'production') {
      console.warn('Error al obtener datos de Supabase en producción:', error?.message);
      // Si no hay datos en Supabase en producción, usar valores por defecto
      return DEFAULT_LINKS_DATA;
    }
    
    // En desarrollo, intentar el archivo local como fallback
    console.log('Usando archivo local como fallback:', error?.message);
    return await getLinksFromFile();
  } catch (error) {
    console.error('Error al cargar los enlaces:', error);
    return DEFAULT_LINKS_DATA;
  }
}

// Función auxiliar para obtener datos del archivo JSON local
async function getLinksFromFile(): Promise<LinksData> {
  try {
    const filePath = path.resolve(process.cwd(), 'src/data/links.json');
    const file = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(file);
    
    return transformDataFromFile(data);
  } catch (error) {
    console.error('Error al cargar el archivo local:', error);
    return DEFAULT_LINKS_DATA;
  }
}

// Función para transformar datos desde el formato del archivo JSON
function transformDataFromFile(data: any): LinksData {
  return {
    links: data.items || [],
    description: data.description || "",
    profileImage: data.profileImage || "/profile.jpg",
    profileImageType: data.profileImageType || "image",
    socialIcons: data.socialIcons || {},
    backgroundColor: data.backgroundColor || "#1a1a1a",
    backgroundSettings: data.backgroundSettings || {
      type: 'color',
      color: data.backgroundColor || "#1a1a1a",
      imageOpacity: 0.5
    },
    styleSettings: data.styleSettings || {
      titleColor: "#ffffff",
      linkCardBackgroundColor: "#ffffff",
      linkCardTextColor: "#000000"
    }
  };
}

// Función para transformar datos desde el formato de Supabase
function transformDataFromSupabase(data: any): LinksData {
  // Si los datos ya están en el formato correcto, solo devuelve
  if (data && typeof data === 'object' && 'links' in data) {
    return {
      ...DEFAULT_LINKS_DATA,
      ...data,
    };
  }
  
  // Si no, intenta convertir al formato esperado
  return transformDataFromFile(data);
}