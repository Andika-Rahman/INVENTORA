export function formatRupiah(amount) {
    const numeric = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numeric);
}

export function formatDate(dateValue) {
    if (!dateValue) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateValue));
}

export function getStockStatus(stock, minStock, lowStock) {
    const current = Number(stock);
    const min = Number(minStock);
    const low = Number(lowStock);

    if (current === 0) {
        return {
        label: 'Out of Stock',
        badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
        };
    }
    if (current <= min) {
        return {
        label: 'Severe',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        };
    }
    if (current <= low) {
        return {
        label: 'Low',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        };
    }
    return {
        label: 'Normal',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
}

export function generateDocumentNumber(prefix) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomDigits = String(Math.floor(1000 + Math.random() * 9000));
    return `${prefix}-${year}${month}-${randomDigits}`;
}