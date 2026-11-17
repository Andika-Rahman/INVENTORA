import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import CategoryManager from '@/components/categories/CategoryManager';

export default async function CategoriesPage() {
    const session = await getSession();
    if (!session || !['admin', 'warehouse_manager'].includes(session.role)) {
        redirect('/dashboard');
    }

    const result = await query(`
        SELECT
        c.id,
        c.name,
        c.description,
        c.image_url,
        COUNT(p.id)::int AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
    `);

    return <CategoryManager categories={result.rows} />;
}