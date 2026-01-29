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

        // Consultamos SIEMPRE el rol actual desde Clerk API para evitar cacheos de la sesión
        let isAdmin = false;
        let liveRole: any = undefined;
        try {
            const client = await clerkClient();
            const user = await client.users.getUser(userId);
            liveRole = (user.publicMetadata as any)?.role || (user.privateMetadata as any)?.role;
            isAdmin = liveRole === 'admin';
            console.log('Middleware - Rol (live) desde Clerk API:', { liveRole, isAdmin });
        } catch (e) {
            console.warn('Middleware - No se pudo obtener usuario desde Clerk API', e);
            // Fallback a claims si falla el API
            isAdmin = 
                (sessionClaims?.publicMetadata as any)?.role === 'admin' || 
                sessionClaims?.metadata?.role === 'admin';
        }
            
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
        // Excluir archivos estáticos y _next
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
    ],
}