# Sistema de Permisos de Administrador

Este proyecto maneja permisos de administrador de manera diferente según el contexto:

## Para Server Components y Server Actions

Usar `/src/utils/roles.ts`:

```typescript
import { checkAdminPermissions } from '@/utils/roles'

// En server actions
export async function myServerAction() {
  const hasPermissions = await checkAdminPermissions() // Redirige automáticamente si no es admin
  if (!hasPermissions) return
  
  // ... lógica del servidor
}
```

## Para Client Components

Usar `/src/utils/client-roles.ts`:

```typescript
import { checkClientAdminPermissionsWithRedirect } from '@/utils/client-roles'

// En client components
export default function MyClientComponent() {
  useEffect(() => {
    async function checkPermissions() {
      const isAdmin = await checkClientAdminPermissionsWithRedirect()
      if (!isAdmin) return // Ya se redirigió automáticamente
      
      // ... lógica del cliente
    }
    checkPermissions()
  }, [])
}
```

## API Routes

El endpoint `/api/check-admin` verifica si el usuario actual es administrador y es usado internamente por las funciones de client components.

## Archivos del Sistema

- `/src/utils/roles.ts` - Funciones para servidor (incluye `server-only`)
- `/src/utils/client-roles.ts` - Funciones para cliente (incluye `'use client'`)
- `/src/app/api/check-admin/route.ts` - API endpoint para verificar permisos desde el cliente

## Funciones Disponibles

### Server-side:
- `checkRole(role)` - Verifica si el usuario tiene un rol específico
- `isAdmin()` - Verifica si el usuario es administrador
- `checkAdminPermissions()` - Verifica permisos de admin y redirige si no los tiene

### Client-side:
- `checkClientAdminPermissions()` - Solo verifica permisos (sin redirección)
- `checkClientAdminPermissionsWithRedirect()` - Verifica y redirige automáticamente
- `redirectToHome()` - Redirige manualmente a la página principal
