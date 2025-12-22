"use client";

import ThreeScene from "@/components/ThreeScene";
import UIOverlay from "@/components/UIOverlay";

export default function Home() {
    return (
        <main className="relative w-screen h-screen overflow-hidden">
            {/* 3D Background */}
            <ThreeScene />

            {/* UI Controls */}
            <UIOverlay />

            {/* Disclaimer Modal (Simplest Version) */}
            <div className="fixed bottom-2 right-2 text-[10px] text-slate-600 pointer-events-none uppercase tracking-widest">
                Not for Medical Diagnosis
            </div>
        </main>
    );
}
