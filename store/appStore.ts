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

    // Reminder Settings
    remindersEnabled: boolean;
    setRemindersEnabled: (enabled: boolean) => void;
    reminderValue: number;
    setReminderValue: (value: number) => void;
    reminderUnit: 'days' | 'weeks' | 'months';
    setReminderUnit: (unit: 'days' | 'weeks' | 'months') => void;
    reminderTarget: number; // Day of week (0-6)
    setReminderTarget: (target: number) => void;
    reminderOccurrence: number; // 0: 1st, 1: 2nd, 2: 3rd, 3: 4th, 4: Last
    setReminderOccurrence: (occurrence: number) => void;
    reminderTime: string; // HH:mm
    setReminderTime: (time: string) => void;
}

export const useAppStore = create<AppState>((set) => {
    // Load from localStorage if available
    const isClient = typeof window !== 'undefined';
    const savedGender = isClient ? localStorage.getItem('gender-value') as 'male' | 'female' | null : null;

    const savedRemindersEnabled = isClient ? localStorage.getItem('reminders-enabled') === 'true' : false;
    const savedReminderValue = isClient ? parseInt(localStorage.getItem('reminder-value') || '1') : 1;
    const savedReminderUnit = isClient ? (localStorage.getItem('reminder-unit') || 'months') as 'days' | 'weeks' | 'months' : 'months';
    const savedReminderTarget = isClient ? parseInt(localStorage.getItem('reminder-target') || '1') : 1;
    const savedReminderOccurrence = isClient ? parseInt(localStorage.getItem('reminder-occurrence') || '0') : 0;
    const savedReminderTime = isClient ? localStorage.getItem('reminder-time') || '09:00' : '09:00';

    return {
        gender: savedGender || 'male',
        setGender: (gender) => {
            set({ gender });
            if (isClient) localStorage.setItem('gender-value', gender);
        },
        selectedMoleId: null,
        setSelectedMoleId: (id) => set({ selectedMoleId: id }),
        isAddingMole: false,
        setIsAddingMole: (isAdding) => set({ isAddingMole: isAdding }),
        tempMolePosition: null,
        setTempMolePosition: (pos) => set({ tempMolePosition: pos }),

        // Reminders
        remindersEnabled: savedRemindersEnabled,
        setRemindersEnabled: (enabled) => {
            set({ remindersEnabled: enabled });
            if (isClient) localStorage.setItem('reminders-enabled', String(enabled));
        },
        reminderValue: savedReminderValue,
        setReminderValue: (value) => {
            set({ reminderValue: value });
            if (isClient) localStorage.setItem('reminder-value', String(value));
        },
        reminderUnit: savedReminderUnit,
        setReminderUnit: (unit) => {
            set({ reminderUnit: unit });
            if (isClient) localStorage.setItem('reminder-unit', unit);
        },
        reminderTarget: savedReminderTarget,
        setReminderTarget: (target) => {
            set({ reminderTarget: target });
            if (isClient) localStorage.setItem('reminder-target', String(target));
        },
        reminderOccurrence: savedReminderOccurrence,
        setReminderOccurrence: (occurrence) => {
            set({ reminderOccurrence: occurrence });
            if (isClient) localStorage.setItem('reminder-occurrence', String(occurrence));
        },
        reminderTime: savedReminderTime,
        setReminderTime: (time) => {
            set({ reminderTime: time });
            if (isClient) localStorage.setItem('reminder-time', time);
        },
    };
});
