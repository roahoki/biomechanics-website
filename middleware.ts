import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const secret = process.env.JWT_SECRET

    if (!token || !secret) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
        verify(token, secret)
        return NextResponse.next()
    } catch {
        return NextResponse.redirect(new URL('/login', request.url))
    }
}

// Aplicar el middleware solo a rutas bajo /admin
export const config = {
    matcher: ['/admin/:path*'],
}
