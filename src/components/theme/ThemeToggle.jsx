'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
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

export function FloatingThemeToggle() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false
    );

    if (pathname === '/') return null;

    const isDark = mounted && theme === 'dark';
    const responsiveVisibility = pathname.startsWith('/dashboard')
        ? 'lg:hidden inline-flex'
        : 'inline-flex';

    return (
        <button
        type="button"
        onClick={toggleTheme}
        aria-label="Ubah Tema Tampilan"
        className={`fixed bottom-5 right-5 z-50 ${responsiveVisibility} items-center gap-2 px-3.5 py-2.5 rounded-full bg-white hover:bg-red-50 text-slate-800 border border-slate-200 shadow-lg shadow-slate-300/50 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:shadow-black/50 text-xs font-semibold transition cursor-pointer`}
        >
        {isDark ? (
            <>
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Light Mode</span>
            </>
        ) : (
            <>
            <Moon className="w-4 h-4 text-red-600" />
            <span>Dark Mode</span>
            </>
        )}
        </button>
    );
}