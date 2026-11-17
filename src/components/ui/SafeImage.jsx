'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';

export default function SafeImage({ src, alt, className = 'w-10 h-10 rounded-lg object-cover' }) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return (
        <div
            className={`${className} bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0`}
        >
            <Package className="w-5 h-5" />
        </div>
        );
    }

    return (
        <img
        src={src}
        alt={alt || 'Preview'}
        onError={() => setHasError(true)}
        className={`${className} bg-slate-800 border border-slate-700 shrink-0`}
        />
    );
}