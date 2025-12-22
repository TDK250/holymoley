"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import BodyModel from "./BodyModel";
import { useAppStore, type AppState } from "@/store/appStore";

export default function ThreeScene() {
    const gender = useAppStore((state: AppState) => state.gender);
    const isAddingMole = useAppStore((state: AppState) => state.isAddingMole);
    const setIsAddingMole = useAppStore((state: AppState) => state.setIsAddingMole);

    return (
        <div id="canvas-container" className="bg-[#020617]">
            <Canvas key={gender} shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={45} />
                <OrbitControls
                    enablePan={true}
                    panSpeed={0.8}
                    minDistance={0.2}
                    maxDistance={5}
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI}
                    target={[0, 0.3, 0]}
                    makeDefault
                />

                {/* Three-point lighting for better depth */}
                <ambientLight intensity={0.4} />

                {/* Key light */}
                <directionalLight
                    position={[5, 5, 5]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />

                {/* Fill light */}
                <directionalLight
                    position={[-3, 2, -3]}
                    intensity={0.5}
                />

                {/* Rim light */}
                <directionalLight
                    position={[0, 3, -5]}
                    intensity={0.3}
                    color="#4f46e5"
                />

                <Suspense fallback={null}>
                    <BodyModel />
                    {/* <Environment preset="night" /> */}
                </Suspense>
            </Canvas>
        </div>
    );
}
