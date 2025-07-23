import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const userId = formData.get('userId') as string

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID requerido' },
                { status: 400 }
            )
        }

        // Asignar rol admin
        const client = await clerkClient()
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: 'admin' },
        })

        console.log(`✅ Usuario ${userId} ahora es admin`)

        // Redirigir de vuelta a la página de admin
        return NextResponse.redirect(new URL('/admin/links', request.url))

    } catch (error) {
        console.error('❌ Error asignando rol admin:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
