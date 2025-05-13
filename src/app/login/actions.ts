'use server'

import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'

export async function login({ username, password }: { username: string; password: string }) {
    const validUser = process.env.ADMIN_USER
    const validPass = process.env.ADMIN_PASS
    const secret = process.env.JWT_SECRET!

    if (username === validUser && password === validPass) {
        const token = sign({ user: username }, secret, { expiresIn: '1d' })

        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24,
        })

        return true
    }

    return false
}
