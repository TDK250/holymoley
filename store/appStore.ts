import { create } from 'zustand';

export interface AppState {
    gender: 'male' | 'female';
    setGender: (gender: 'male' | 'female') => void;
    selectedMoleId: number | null;
    setSelectedMoleId: (id: number | null) => void;
    isAddingMole: boolean;
    setIsAddingMole: (isAdding: boolean) => void;
    tempMolePosition: [number, number, number] | null;
    setTempMolePosition: (pos: [number, number, number] | null) => void;
}

export const useAppStore = create<AppState>((set) => {
    // Load gender from localStorage if available
    const savedGender = typeof window !== 'undefined' ? localStorage.getItem('gender-selected') : null;
    const savedGenderValue = typeof window !== 'undefined' ? localStorage.getItem('gender-value') as 'male' | 'female' | null : null;

    return {
        gender: savedGenderValue || 'male', // Use saved gender or default to male
        setGender: (gender) => {
            set({ gender });
            if (typeof window !== 'undefined') {
                localStorage.setItem('gender-value', gender);
            }
        },
        selectedMoleId: null,
        setSelectedMoleId: (id) => set({ selectedMoleId: id }),
        isAddingMole: false,
        setIsAddingMole: (isAdding) => set({ isAddingMole: isAdding }),
        tempMolePosition: null,
        setTempMolePosition: (pos) => set({ tempMolePosition: pos }),
    };
});
