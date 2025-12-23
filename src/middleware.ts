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
        
        console.log('Middleware - Auth check:', { 
            userId, 
            path: req.nextUrl.pathname,
            hasSessionClaims: !!sessionClaims,
            publicMetadata: sessionClaims?.publicMetadata,
            userMetadata: sessionClaims?.metadata
        });

        // Si el usuario no está autenticado, redirigir a la página de login
        // guardando la URL de destino para redirigir después del login
        if (!userId) {
            console.log('Middleware - Usuario no autenticado, redirigiendo a /sign-in');
            const signInUrl = new URL('/sign-in', req.url);
            // Guardar la URL original como parámetro para redirigir después del login
            signInUrl.searchParams.set('redirect_url', req.url);
            return NextResponse.redirect(signInUrl);
        }

        // Verificamos el rol en ambas ubicaciones posibles
        const isAdmin = 
            (sessionClaims?.publicMetadata as any)?.role === 'admin' || 
            sessionClaims?.metadata?.role === 'admin';
            
        // Si está autenticado pero no es admin, redirigir a la página principal
        if (!isAdmin) {
            console.log('Middleware - Usuario autenticado pero no es admin, redirigiendo a /');
            const url = new URL('/', req.url);
            return NextResponse.redirect(url);
        }
        
        console.log('Middleware - Acceso permitido a ruta admin');
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