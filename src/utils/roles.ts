import { Roles } from '../types/globals'
import { auth } from '@clerk/nextjs/server'

export const checkRole = async (role: Roles) => {
    const { sessionClaims } = await auth()
    return sessionClaims?.metadata.role === role
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