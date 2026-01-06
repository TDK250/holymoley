import { Html } from "@react-three/drei";

export default function Loader() {
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-rose-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 bg-rose-500/20 rounded-full animate-pulse"></div>
                </div>
                <p className="text-white font-bold tracking-widest text-xs uppercase animate-pulse">Loading Model</p>
            </div>
        </Html>
    );
}
