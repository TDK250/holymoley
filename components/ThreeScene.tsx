"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
import BodyModel from "./BodyModel";
import { useAppStore, type AppState } from "@/store/appStore";

export default function ThreeScene() {
    const gender = useAppStore((state: AppState) => state.gender);

    return (
        <div id="canvas-container" className="bg-[#020617]">
            <Canvas key={gender} shadows dpr={[1, 2]}>
                {/* 
                   Using a slightly higher FOV and moving the camera further back (position Z: 5)
                   ensures that the model stays in frame even on narrow or wide viewports.
                */}
                <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={45} />
                <OrbitControls
                    enablePan={true}
                    panSpeed={0.8}
                    minDistance={0.5}
                    maxDistance={8}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI}
                    target={[0, 0.3, 0]}
                    makeDefault
                />

                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
                <directionalLight position={[-3, 2, -3]} intensity={0.6} />
                <directionalLight position={[0, 3, -5]} intensity={0.4} color="#4f46e5" />

                <Suspense fallback={null}>
                    <BodyModel />
                </Suspense>
            </Canvas>
        </div>
    );
}
