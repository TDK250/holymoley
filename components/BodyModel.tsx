"use client";

import { useGLTF } from "@react-three/drei";
import { useAppStore, type AppState } from "@/store/appStore";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import MoleMarkers from "./MoleMarkers";
import { getAssetPath } from "@/utils/paths";

export default function BodyModel() {
    const gender = useAppStore((state: AppState) => state.gender);
    const isAddingMole = useAppStore((state: AppState) => state.isAddingMole);

    // Loading the specific model based on gender
    const modelPath = gender === "male" ? getAssetPath("/models/male.glb") : getAssetPath("/models/female.glb");
    const { scene } = useGLTF(modelPath);

    // Use useMemo to clone the scene so we don't modify the cached GLTF object directly
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Ensure accurate bounding box by updating matrices
        clone.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        // Normalize scaling.
        // We'll target a normalized size of 1.5 on its largest dimension.
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetScale = 1.5 / maxDim;
        clone.scale.setScalar(targetScale);

        // Position the model specifically so it's centered.
        clone.position.set(
            -center.x * targetScale,
            (-center.y * targetScale) + 0.2, // Adjusted for 1.5 scale framing
            -center.z * targetScale
        );

        return clone;
    }, [scene]);

    const handleBodyClick = (e: any) => {
        e.stopPropagation();
        if (!isAddingMole) return;

        const { point } = e;
        useAppStore.getState().setTempMolePosition([point.x, point.y, point.z]);
    };

    return (
        <group key={gender}>
            <primitive
                object={clonedScene}
                onClick={handleBodyClick}
            />
            <MoleMarkers />
        </group>
    );
}

// Preload models for smoothness
useGLTF.preload(getAssetPath("/models/male.glb"));
useGLTF.preload(getAssetPath("/models/female.glb"));
