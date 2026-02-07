"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { useAppStore, type AppState } from "@/store/appStore";

export default function MoleMarkers() {
    const gender = useAppStore((state: AppState) => state.gender);
    const selectedMoleId = useAppStore((state: AppState) => state.selectedMoleId);
    const setSelectedMoleId = useAppStore((state: AppState) => state.setSelectedMoleId);
    const tempMolePosition = useAppStore((state: AppState) => state.tempMolePosition);
    const accentColor = useAppStore((state: AppState) => state.accentColor);

    const filterCondition = useAppStore((state: AppState) => state.filterCondition);

    // Fetch only moles for the current gender
    const allMoles = useLiveQuery(() =>
        db.moles.where('gender').equals(gender).toArray(),
        [gender]
    );

    const filteredMoles = (allMoles || []).filter(mole =>
        filterCondition === 'all' || (mole.type || 'mole') === filterCondition
    );

    if (!allMoles) return null;

    return (
        <>
            {filteredMoles.map((mole: any) => {
                const isSelected = selectedMoleId === mole.id;

                return (
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
                            color={isSelected ? accentColor : "#45271d"}
                            emissive={isSelected ? accentColor : "#000"}
                            emissiveIntensity={isSelected ? 0.5 : 0}
                        />
                    </mesh>
                )
            })}

            {/* Preview Marker for New Mole */}
            {tempMolePosition && (
                <mesh position={tempMolePosition}>
                    <sphereGeometry args={[0.006, 16, 16]} />
                    <meshStandardMaterial color={accentColor} transparent opacity={0.6} />
                </mesh>
            )}
        </>
    );
}
