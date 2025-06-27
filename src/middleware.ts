import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api(.*)/clerk(.*)'])

export default clerkMiddleware(async (auth, req) => {
    // No aplicar protección a las rutas de autenticación
    if (isAuthRoute(req)) {
        return NextResponse.next();
    }
    
    // Protect all routes starting with `/admin`
    if (isAdminRoute(req)) {
        const { userId, sessionClaims } = await auth();

        // Si el usuario no está autenticado, redirigir a la página de login
        // guardando la URL de destino para redirigir después del login
        if (!userId) {
            const signInUrl = new URL('/sign-in', req.url);
            // Guardar la URL original como parámetro para redirigir después del login
            signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
        }

        // Si está autenticado pero no es admin, redirigir a la página principal
        if (sessionClaims?.metadata?.role !== 'admin') {
            const url = new URL('/', req.url);
            return NextResponse.redirect(url);
        }
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
}