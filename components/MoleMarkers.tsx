"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAppStore, type AppState } from "@/store/appStore";

export default function MoleMarkers() {
    const gender = useAppStore((state: AppState) => state.gender);
    const selectedMoleId = useAppStore((state: AppState) => state.selectedMoleId);
    const setSelectedMoleId = useAppStore((state: AppState) => state.setSelectedMoleId);
    const tempMolePosition = useAppStore((state: AppState) => state.tempMolePosition);

    // Fetch only moles for the current gender
    const moles = useLiveQuery(() =>
        db.moles.where('gender').equals(gender).toArray(),
        [gender]
    );

    if (!moles) return null;

    return (
        <>
            {moles.map((mole: any) => (
                <mesh
                    key={mole.id}
                    position={mole.position}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMoleId(mole.id ?? null);
                    }}
                >
                    <sphereGeometry args={[0.005, 16, 16]} />
                    <meshStandardMaterial
                        color={selectedMoleId === mole.id ? "#ef4444" : "#45271d"}
                        emissive={selectedMoleId === mole.id ? "#ef4444" : "#000"}
                        emissiveIntensity={selectedMoleId === mole.id ? 0.5 : 0}
                    />
                </mesh>
            ))}

            {/* Preview Marker for New Mole */}
            {tempMolePosition && (
                <mesh position={tempMolePosition}>
                    <sphereGeometry args={[0.006, 16, 16]} />
                    <meshStandardMaterial color="#ef4444" transparent opacity={0.6} />
                </mesh>
            )}
        </>
    );
}
