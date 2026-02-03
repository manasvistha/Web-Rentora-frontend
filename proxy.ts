import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ['/', '/login', '/register', '/forget-password', '/reset-password'];
const adminRoutes = ['/admin'];
const userRoutes = ['/user'];

const matches = (pathname: string, route: string) => pathname === route || pathname.startsWith(`${route}/`);

const parseUser = (raw?: string | null) => {
    if (!raw) return null;
    try {
        return JSON.parse(decodeURIComponent(raw));
    } catch {
        return null;
    }
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("auth_token")?.value ?? null;
    const user = parseUser(request.cookies.get("user_data")?.value ?? null);

    const isPublic = publicRoutes.some(route => matches(pathname, route));
    const isAdminPath = adminRoutes.some(route => matches(pathname, route));
    const isUserPath = userRoutes.some(route => matches(pathname, route));

    const hasAuthToken = Boolean(token);
    const hasUserRole = Boolean(user?.role);
    const isAuthenticated = hasAuthToken && hasUserRole;

    // Unauthenticated access to protected areas
    if (!isAuthenticated && (isAdminPath || isUserPath)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthenticated) {
        // Prevent authenticated users from visiting public auth pages
        if (isPublic) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // Admin-only sections
        if (isAdminPath && user!.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // User sections (both user and admin allowed)
        if (isUserPath && !['user', 'admin'].includes(user!.role)) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|assets|api/.*).*)',
    ],
};