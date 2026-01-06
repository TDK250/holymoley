import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const haptics = {
    light: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Light });
        }
    },
    medium: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Medium });
        }
    },
    heavy: async () => {
        if (isNative) {
            await Haptics.impact({ style: ImpactStyle.Heavy });
        }
    },
    success: async () => {
        if (isNative) {
            await Haptics.notification({ type: 'success' as any });
        }
    },
    error: async () => {
        if (isNative) {
            await Haptics.notification({ type: 'error' as any });
        }
    },
    selection: async () => {
        if (isNative) {
            await Haptics.selectionStart();
            await Haptics.selectionChanged();
            await Haptics.selectionEnd();
        }
    }
};
