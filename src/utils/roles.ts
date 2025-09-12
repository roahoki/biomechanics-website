import { Roles } from '../types/globals'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import 'server-only' // Esto garantiza que este archivo solo se use en el servidor

export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth()
    
    // Buscar el rol tanto en metadata como en publicMetadata
    const userRole = 
        sessionClaims?.metadata?.role || 
        (sessionClaims?.publicMetadata as any)?.role;
    
    console.log('checkRole - verificando rol:', { 
        requestedRole: role, 
        userRole,
        metadata: sessionClaims?.metadata,
        publicMetadata: sessionClaims?.publicMetadata
    });
    
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
    if (!await checkRole('admin')) {
        redirect('/')
        return false
    }
    return true
}