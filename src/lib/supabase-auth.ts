import { useAuth } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'
import { createSafeStorage } from '@/lib/supabase-storage'

// Hook para crear cliente de Supabase autenticado con Clerk
export function useSupabaseClient() {
  const { getToken } = useAuth()

  return useMemo(() => {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
          storage: createSafeStorage(),
        },
        global: {
          // Función para obtener el token JWT de Clerk
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken({
              template: 'supabase', // Nombre del template
            })

            // Debug: Log del token (solo para desarrollo)
            if (clerkToken) {
              console.log('🔑 Token obtenido de Clerk:', clerkToken.substring(0, 50) + '...')
              
              // Decodificar el header para ver el algoritmo
              try {
                const [header] = clerkToken.split('.')
                const decodedHeader = JSON.parse(atob(header))
                console.log('📋 Header del JWT:', decodedHeader)
              } catch (e) {
                console.error('❌ Error decodificando header JWT:', e)
              }
            } else {
              console.warn('⚠️ No se pudo obtener token de Clerk')
            }

            // Agregar el token de Clerk como Authorization header
            const headers = new Headers(options?.headers)
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`)
            }

            // Llamar a fetch con el token
            return fetch(url, {
              ...options,
              headers,
            })
          },
        },
      }
    )
  }, [getToken])
}

// Cliente básico para operaciones públicas (sin auth)
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: createSafeStorage(),
    },
  }
)
