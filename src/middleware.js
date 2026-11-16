import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || 'inventora_fallback_secret_key_2026'
);

const COOKIE_NAME = 'inventora_session';

async function getPayload(request) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch {
        return null;
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const payload = await getPayload(request);

    const isAuthRoute = pathname === '/login' || pathname === '/register';
    const isSupplierStatusRoute = pathname === '/supplier-status';
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (isDashboardRoute) {
        if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
        }

        if (payload.role === 'supplier' && payload.status !== 'Approved') {
        return NextResponse.redirect(new URL('/supplier-status', request.url));
        }

        if (pathname.startsWith('/dashboard/suppliers') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (
        pathname.startsWith('/dashboard/categories') &&
        !['admin', 'warehouse_manager'].includes(payload.role)
        ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (pathname.startsWith('/dashboard/products') && payload.role === 'supplier') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (
        pathname.startsWith('/dashboard/restocks') &&
        payload.role === 'staff_gudang'
        ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    if (isSupplierStatusRoute) {
        if (!payload) {
        return NextResponse.redirect(new URL('/login', request.url));
        }
        if (payload.role !== 'supplier' || payload.status === 'Approved') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    if (isAuthRoute && payload) {
        if (payload.role === 'supplier' && payload.status !== 'Approved') {
        return NextResponse.redirect(new URL('/supplier-status', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register', '/supplier-status'],
};