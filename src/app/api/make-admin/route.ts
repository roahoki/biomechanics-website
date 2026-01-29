import { clerkClient, auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth()

        if (!userId) {
            return NextResponse.json(
                { error: 'No estás autenticado' },
                { status: 401 }
            )
        }

        // Asignar rol admin al usuario actual
        const client = await clerkClient()
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: 'admin' },
        })

        console.log(`✅ Usuario ${userId} ahora es admin`)

        return NextResponse.json({
            success: true,
            message: 'Ahora eres admin. Recarga la página para acceder a /admin/pricing',
            userId
        })

    } catch (error) {
        console.error('❌ Error asignando rol admin:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
