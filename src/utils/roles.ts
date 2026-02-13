import { Roles } from '../types/globals'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import 'server-only' // Esto garantiza que este archivo solo se use en el servidor

export const checkRole = async (role: Roles) => {
    const { userId, sessionClaims } = await auth()

    if (!userId) return false

    // Obtener SIEMPRE el rol live desde Clerk API
    let userRole: any = undefined
    try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        userRole = (user.publicMetadata as any)?.role || (user.privateMetadata as any)?.role
        console.log('checkRole - rol desde Clerk API:', { userRole })
    } catch (e) {
        console.warn('checkRole - no se pudo obtener usuario de Clerk API, usando claims', e)
        userRole = sessionClaims?.metadata?.role || (sessionClaims?.publicMetadata as any)?.role
    }

    console.log('checkRole - verificando rol:', {
        requestedRole: role,
        userRole,
        metadata: sessionClaims?.metadata,
        publicMetadata: sessionClaims?.publicMetadata
    })

    return userRole === role
}

export const checkRoles = async (roles: Roles[]) => {
    const { sessionClaims } = await auth()
    return roles.includes(sessionClaims?.metadata.role as Roles)
}

export const isAuthenticated = async () => {
    const { sessionClaims } = await auth()
    return !!sessionClaims
}

export const isAdmin = async () => {
    return checkRole('admin')
}

export const checkAdminPermissions = async () => {
    const ok = await checkRole('admin')
    if (!ok) {
        redirect('/')
        return false
    }
    return true
}