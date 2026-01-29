import { createClient } from '@supabase/supabase-js'
import { LinksData } from '@/utils/links';
import { createSafeStorage } from '@/lib/supabase-storage'

// Definición de tipos para Supabase
export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: string
          data: LinksData
          updated_at: string
        }
        Insert: {
          id?: string
          data: LinksData
          updated_at?: string
        }
        Update: {
          id?: string
          data?: LinksData
          updated_at?: string
        }
      }
    }
  }
}

// Crear un cliente de Supabase con la clave secreta para operaciones del servidor
// Esta función debe usarse SOLO en el servidor
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: createSafeStorage(),
    },
  });
};

// Crear un cliente de Supabase con la clave anónima para operaciones del cliente
// Esta función puede usarse en el cliente o servidor
export const createPublicClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Se requieren las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: createSafeStorage(),
    },
  });
};

// Obtener un cliente de Supabase según el contexto
// Esta función es más segura porque elige la clave correcta según el entorno
export function getSupabaseClient({ admin = false } = {}) {
  return admin ? createAdminClient() : createPublicClient();
}
