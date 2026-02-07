import { Html } from "@react-three/drei";
import { useAppStore, type AppState } from "@/store/appStore";

export default function Loader() {
    const accentColor = useAppStore((s: AppState) => s.accentColor);

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16 rounded-full bg-white/10 dark:bg-black/10 backdrop-blur-sm">
                    <div className="absolute inset-0 border-4 rounded-full opacity-20" style={{ borderColor: accentColor }}></div>
                    <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: 'transparent' }}></div>
                    <div className="absolute inset-4 rounded-full animate-pulse opacity-20" style={{ backgroundColor: accentColor }}></div>
                </div>
                <p className="text-slate-900 dark:text-white font-bold tracking-widest text-xs uppercase animate-pulse">Loading Model</p>
            </div>
        </Html>
    );
}
