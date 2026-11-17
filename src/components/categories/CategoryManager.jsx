'use client';

import { useState, useActionState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
} from '@/actions/categoryActions';

const initialFormState = { error: '', success: '' };

export default function CategoryManager({ categories }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [deleteFeedback, setDeleteFeedback] = useState('');

    const [createState, createFormAction, isCreating] = useActionState(
        createCategoryAction,
        initialFormState
    );
    const [updateState, updateFormAction, isUpdating] = useActionState(
        updateCategoryAction,
        initialFormState
    );

    const activeState = editingCategory ? updateState : createState;
    const isSubmitting = editingCategory ? isUpdating : isCreating;

    useEffect(() => {
        if (createState?.success || updateState?.success) {
        const timer = setTimeout(() => {
            setModalOpen(false);
            setEditingCategory(null);
            setImageUrl('');
        }, 600);
        return () => clearTimeout(timer);
        }
    }, [createState?.success, updateState?.success]);

    function openCreateModal() {
        setEditingCategory(null);
        setImageUrl('');
        setModalOpen(true);
    }

    function openEditModal(category) {
        setEditingCategory(category);
        setImageUrl(category.image_url || '');
        setModalOpen(true);
    }

    async function handleFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const body = new FormData();
        body.append('file', file);
        body.append('folder', 'categories');

        try {
        const res = await fetch('/api/upload', { method: 'POST', body });
        const data = await res.json();
        if (data.url) {
            setImageUrl(data.url);
        }
        } finally {
        setUploading(false);
        }
    }

    async function handleDelete(category) {
        if (category.product_count > 0) {
        setDeleteFeedback(
            `Kategori "${category.name}" tidak bisa dihapus karena masih digunakan oleh ${category.product_count} produk.`
        );
        return;
        }

        const confirmed = window.confirm(
        `Hapus kategori "${category.name}" secara permanen?`
        );
        if (!confirmed) return;

        const fd = new FormData();
        fd.append('id', String(category.id));
        const res = await deleteCategoryAction(fd);
        if (res?.error) {
        setDeleteFeedback(res.error);
        } else {
        setDeleteFeedback('');
        }
    }

    return (
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-white">Manajemen Kategori Part</h1>
            <p className="text-sm text-slate-400 mt-1">
                Pengelompokan komponen PC & laptop untuk katalog gudang INVENTORA
            </p>
            </div>

            <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer self-start"
            >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
            </button>
        </div>

        {deleteFeedback && (
            <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{deleteFeedback}</span>
            </div>
            <button
                type="button"
                onClick={() => setDeleteFeedback('')}
                className="text-xs text-red-400 hover:text-white cursor-pointer"
            >
                Tutup
            </button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
            <div
                key={cat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
                <div className="flex items-start gap-3.5">
                <SafeImage
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                    <h2 className="font-bold text-white text-sm truncate">{cat.name}</h2>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                        {cat.product_count} SKU
                    </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description || 'Tidak ada deskripsi'}
                    </p>
                </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleDelete(cat)}
                    className="py-2 px-3 rounded-xl bg-red-600/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                </button>
                </div>
            </div>
            ))}
        </div>

        {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">
                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                </h2>
                <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {activeState?.error && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{activeState.error}</span>
                </div>
                )}

                {activeState?.success && (
                <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{activeState.success}</span>
                </div>
                )}

                <form
                action={editingCategory ? updateFormAction : createFormAction}
                className="space-y-4"
                >
                {editingCategory && (
                    <input type="hidden" name="id" value={editingCategory.id} />
                )}
                <input type="hidden" name="image_url" value={imageUrl} />

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Nama Kategori
                    </label>
                    <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingCategory?.name || ''}
                    placeholder="Contoh: Motherboard & Chipset"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Deskripsi Kategori
                    </label>
                    <textarea
                    name="description"
                    rows={3}
                    required
                    defaultValue={editingCategory?.description || ''}
                    placeholder="Keterangan jenis komponen dalam kategori ini"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Gambar Kategori
                    </label>
                    <div className="flex items-center gap-3">
                    <SafeImage
                        src={imageUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover"
                    />
                    <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-blue-500 text-xs text-slate-300 cursor-pointer transition">
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>{uploading ? 'Mengunggah...' : 'Pilih Gambar (JPG/PNG)'}</span>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        />
                    </label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                    >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}
        </div>
    );
    }