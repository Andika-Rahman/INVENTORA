import ExportCsvButton from '@/components/ui/ExportCsvButton';
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

    return (
        <div className="space-y-4">
        {session.role === 'admin' && (
            <div className="flex justify-end">
            <ExportCsvButton moduleName="categories" label="Export Kategori (CSV)" />
            </div>
        )}

        <CategoryManager categories={result.rows} />
        </div>
    );
}