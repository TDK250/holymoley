import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const haptics = {
    light: async () => {
        // Haptics disabled
    },
    medium: async () => {
        // Haptics disabled
    },
    heavy: async () => {
        // Haptics disabled
    },
    success: async () => {
        // Haptics disabled
    },
    error: async () => {
        // Haptics disabled
    },
    selection: async () => {
        // Haptics disabled
    }
};
