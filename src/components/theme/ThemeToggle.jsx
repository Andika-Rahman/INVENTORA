'use client';

import { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

function emptySubscribe() {
    return () => {};
}

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    return (
        <button
        type="button"
        onClick={toggleTheme}
        aria-label="Ubah Tema Tampilan"
        title={mounted && theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition cursor-pointer"
        >
        {mounted && theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
        ) : (
            <Moon className="w-4 h-4 text-red-600" />
        )}
        </button>
    );
}