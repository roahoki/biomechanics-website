import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
    '/menu(.*)',
    '/orders(.*)',
    '/api/products/(.*)',
    '/api/orders/(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/admin-setup(.*)',
    '/api(.*)/clerk(.*)'
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // Rutas públicas: no requieren Clerk
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }
    
    // Protect all routes starting with `/admin`
    if (isAdminRoute(req)) {
        const { userId, sessionClaims } = await auth();

        // Si el usuario no está autenticado, redirigir a la página de login
        if (!userId) {
            const signInUrl = new URL('/sign-in', req.url);
            signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
        }

        // IMPORTANTE: Usar SOLO sessionClaims para evitar llamadas a Clerk API en cada request
        // El rol ya viene en los JWT claims, no necesitamos hacer otra llamada
        const isAdmin = 
            (sessionClaims?.publicMetadata as any)?.role === 'admin' || 
            (sessionClaims?.metadata as any)?.role === 'admin';
            
        // Si está autenticado pero no es admin, redirigir a la página principal
        if (!isAdmin) {
            const url = new URL('/', req.url);
            return NextResponse.redirect(url);
        }
    }
})

export const config = {
    matcher: [
        // Solo ejecutar middleware en rutas que lo necesitan
        '/admin/:path*',
        '/api/:path*',
        '/orders/:path*',
        '/links/:path*',
        '/home/:path*',
    ],
}