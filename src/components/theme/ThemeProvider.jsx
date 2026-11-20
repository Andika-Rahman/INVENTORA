'use client';

import { createContext, useContext, useSyncExternalStore, useCallback } from 'react';

const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {},
    setTheme: () => {},
});

const STORAGE_KEY = 'inventora-theme';
const listeners = new Set();

function emitChange() {
    for (const listener of listeners) {
        listener();
    }
}

function subscribe(listener) {
    listeners.add(listener);
    const handleStorage = (event) => {
        if (event.key === STORAGE_KEY) {
        applyThemeClass(getSnapshot());
        listener();
        }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', handleStorage);
    };
}

function getSnapshot() {
    if (typeof document === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    function getServerSnapshot() {
    return 'light';
    }

    function applyThemeClass(nextTheme) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
}

export function ThemeProvider({ children }) {
    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setTheme = useCallback((nextTheme) => {
        const normalized = nextTheme === 'dark' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, normalized);
        applyThemeClass(normalized);
        emitChange();
    }, []);

    const toggleTheme = useCallback(() => {
        const current = getSnapshot();
        setTheme(current === 'dark' ? 'light' : 'dark');
    }, [setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
        {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}