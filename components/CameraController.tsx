import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export default function CameraController() {
    const { camera, controls } = useThree();
    const selectedMoleId = useAppStore((state) => state.selectedMoleId);
    const selectedMole = useLiveQuery(
        () => (selectedMoleId ? db.moles.get(selectedMoleId) : undefined),
        [selectedMoleId]
    );

    const targetPosition = useRef(new THREE.Vector3(0, 0.3, 0)); // Default target
    const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 4)); // Default camera pos

    const isFocusing = useRef(false);

    // Add event listener to stop auto-focus on user interaction
    useEffect(() => {
        const orbitControls = controls as unknown as OrbitControls;
        if (!orbitControls) return;

        const onStart = () => {
            isFocusing.current = false;
        };

        orbitControls.addEventListener("start", onStart);
        return () => {
            orbitControls.removeEventListener("start", onStart);
        };
    }, [controls]);

    useEffect(() => {
        if (selectedMole && selectedMole.position) {
            // If mole is selected, focus on it
            const [x, y, z] = selectedMole.position;
            targetPosition.current.set(x, y, z);

            // Calculate ideal camera position
            // We want to face the mole directly, avoiding steep top-down angles.
            // Project the direction vector onto the XZ plane to get a horizontal viewing angle.
            const molePos = new THREE.Vector3(x, y, z);
            const viewDir = new THREE.Vector3(x, 0, z).normalize();

            // Handle edge case where mole is perfectly on the Y axis (unlikely)
            if (viewDir.lengthSq() < 0.001) viewDir.set(0, 0, 1);

            // Position camera further out for a better view (2.5 units) to avoid feeling "too close"
            const camPos = molePos.clone().add(viewDir.multiplyScalar(2.5));
            // Ensure camera is at least at eye level with the mole, maybe slightly offset? 
            // Keeping it same Y level as mole is usually best for "straight on" view.

            targetCameraPosition.current.copy(camPos);

            isFocusing.current = true;
        } else {
            // Reset to full body view
            const newTarget = new THREE.Vector3(0, 0.3, 0);
            targetPosition.current.copy(newTarget);

            // Instead of resetting to a fixed "front" view (which causes the camera to fly THROUGH the body if you're behind it),
            // we preserves the current viewing angle but zoom out to a comfortable distance.
            // This ensures a smooth "pull back" animation that never clips the model.

            // Vector from new target to current camera
            const direction = new THREE.Vector3().subVectors(camera.position, newTarget).normalize();

            // If we get zero length (camera exactly at target), default to front view
            if (direction.lengthSq() < 0.001) direction.set(0, 0, 1);

            // Set camera at distance 4 from target along the same direction
            const newCamPos = newTarget.clone().add(direction.multiplyScalar(4));
            targetCameraPosition.current.copy(newCamPos);

            isFocusing.current = true;
        }
    }, [selectedMole]);

    useFrame((state, delta) => {
        const orbitControls = controls as unknown as OrbitControls;
        if (!orbitControls) return;

        // Smoothly interpolate target
        // Reduced speed from 4 -> 2.5 to make it less jarring/fast
        const step = 2.5 * delta; // Speed

        // Only lerp target if we haven't reached it effectively, or just always lerp (it's fine)
        // Note: OrbitControls updates target on pan, but pan is disabled.
        orbitControls.target.lerp(targetPosition.current, step);

        if (isFocusing.current) {
            state.camera.position.lerp(targetCameraPosition.current, step);

            // Check if close enough to stop focusing
            const dist = state.camera.position.distanceTo(targetCameraPosition.current);
            if (dist < 0.05) {
                isFocusing.current = false;
            }
        }

        orbitControls.update();
    });

    return null;
}
