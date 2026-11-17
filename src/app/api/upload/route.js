import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/auth';

export async function POST(request) {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') === 'categories' ? 'categories' : 'products';

    if (!file || typeof file === 'string') {
        return NextResponse.json({ error: 'File gambar tidak ditemukan.' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
        { error: 'Format file harus JPG, PNG, WEBP, atau GIF.' },
        { status: 400 }
        );
    }

    if (file.size > 3 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran gambar maksimal 3MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${safeName}` });
}