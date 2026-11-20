import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET || 'inventora_default_secret_key_2026'
    );

    async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch {
        return null;
    }
    }

    export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('inventora_session')?.value;
    const session = token ? await verifyToken(token) : null;

    if (pathname === '/') {
        return NextResponse.next();
    }

    if (pathname === '/login' || pathname === '/register') {
        if (session) {
        if (session.role === 'supplier' && session.status !== 'Approved') {
            return NextResponse.redirect(new URL('/supplier-status', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (pathname.startsWith('/dashboard')) {
        if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
        }

        if (session.role === 'supplier' && session.status !== 'Approved') {
        return NextResponse.redirect(new URL('/supplier-status', request.url));
        }

        if (pathname.startsWith('/dashboard/suppliers') && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (
        pathname.startsWith('/dashboard/categories') &&
        !['admin', 'warehouse_manager'].includes(session.role)
        ) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (pathname.startsWith('/dashboard/products') && session.role === 'supplier') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        if (pathname.startsWith('/dashboard/restocks') && session.role === 'staff_gudang') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
    }

    export const config = {
    matcher: ['/', '/login', '/register', '/dashboard/:path*'],
};