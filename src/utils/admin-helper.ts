import { clerkClient } from '@clerk/nextjs/server'

export async function makeUserAdmin(userId: string) {
    try {
        const client = await clerkClient()
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: 'admin' },
        })
        console.log(`✅ Usuario ${userId} ahora es admin`)
        return { success: true }
    } catch (error) {
        console.error('❌ Error asignando rol admin:', error)
        return { success: false, error }
    }
}

// Para uso temporal - elimina este archivo después
export async function listUsers() {
    try {
        const client = await clerkClient()
        const users = await client.users.getUserList()
        console.log('📋 Usuarios registrados:')
        users.data.forEach(user => {
            console.log(`- ${user.id}: ${user.emailAddresses[0]?.emailAddress} (rol: ${user.publicMetadata?.role || 'sin rol'})`)
        })
        return users.data
    } catch (error) {
        console.error('❌ Error listando usuarios:', error)
        return []
    }
}
