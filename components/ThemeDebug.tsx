"use client";

import { useAppStore } from "@/store/appStore";
import { useEffect, useState } from "react";

export default function ThemeDebug() {
    const theme = useAppStore((s) => s.theme);
    const [systemPref, setSystemPref] = useState<string>('unknown');
    const [htmlClass, setHtmlClass] = useState<string>('');

    useEffect(() => {
        const checkState = () => {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setSystemPref(isDark ? 'dark' : 'light');
            setHtmlClass(document.documentElement.className);
        };

        checkState();
        const interval = setInterval(checkState, 1000); // Poll every second for updates

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            setSystemPref(e.matches ? 'dark' : 'light');
        };
        media.addEventListener('change', handler);

        return () => {
            clearInterval(interval);
            media.removeEventListener('change', handler);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 z-[9999] bg-black/80 text-white p-2 text-xs font-monopointer-events-none select-none backdrop-blur-md rounded-br-lg border-b border-r border-white/20">
            <div>Store Theme: <span className="font-bold text-yellow-400">{theme}</span></div>
            <div>System Pref: <span className="font-bold text-green-400">{systemPref}</span></div>
            <div>HTML Class: <span className="font-bold text-blue-400">'{htmlClass}'</span></div>
        </div>
    );
}
