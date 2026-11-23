'use client';

import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

export default function SplashScreen() {
    const [isFading, setIsFading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
        setIsFading(true);
        }, 2450);

        const removeTimer = setTimeout(() => {
        setIsVisible(false);
        }, 2950);

        return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div
        className={`fixed inset-0 z-100 overflow-hidden flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 transition-all duration-500 ease-out ${
            isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
        }`}
        >
        <div className="absolute w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-4 px-4">
            <div className="relative flex flex-col items-center shrink-0">
            <div className="animate-inventora-pixar-roll w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-red-500 to-red-700 border border-red-400/40 shadow-2xl shadow-red-600/35 flex items-center justify-center text-white">
                <Cpu
                className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-white"
                color="#ffffff"
                strokeWidth={2.2}
                />
            </div>

            <div className="animate-inventora-pixar-shadow w-12 sm:w-14 h-2 mt-2.5 rounded-full bg-red-500/45 blur-xs" />
            </div>

            <div className="text-left pb-3">
            <h1 className="animate-inventora-wordmark text-2xl sm:text-4xl font-extrabold tracking-widest text-slate-900 dark:text-white leading-none">
                INVENTORA
            </h1>
            <p className="animate-inventora-subtext mt-1.5 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                PC & Laptop Warehouse System
            </p>
            </div>
        </div>

        <div className="mt-7 w-48 sm:w-56 h-1 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full w-full bg-linear-to-r from-red-500 to-rose-400 rounded-full animate-inventora-progress" />
        </div>
        </div>
    );
}