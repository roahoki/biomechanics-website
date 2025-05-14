// src/lib/auth.ts
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function getUserFromCookie() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    const secret = process.env.JWT_SECRET!

    if (!token) return null

    try {
        const decoded = verify(token, secret) as { user: string }
        return decoded.user
    } catch {
        return null
    }
}
