'use client'

// Funciones de roles que pueden ser usadas desde client components
// Estas NO pueden usar funciones de servidor como auth() directamente

export async function checkClientAdminPermissions(): Promise<boolean> {
  try {
    // Para client components, necesitamos hacer una llamada a una API route 
    const response = await fetch('/api/check-admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.warn('Failed to check admin permissions, status:', response.status)
      return false
    }
    
    const result = await response.json()
    return result.isAdmin || false
  } catch (error) {
    console.error('Error checking admin permissions:', error)
    return false
  }
}

// Función helper para redirigir desde client components cuando no hay permisos
export function redirectToHome() {
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}

// Función combinada que verifica permisos y redirige si no los tiene
export async function checkClientAdminPermissionsWithRedirect(): Promise<boolean> {
  const hasPermissions = await checkClientAdminPermissions()
  
  if (!hasPermissions) {
    redirectToHome()
    return false
  }
  
  return true
}
