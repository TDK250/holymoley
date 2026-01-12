import { db } from "@/db";

export const ImportExportService = {
    async exportData(password?: string) {
        const moles = await db.moles.toArray();
        const entries = await db.entries.toArray();

        const data = {
            version: 1,
            timestamp: Date.now(),
            moles,
            entries
        };

        let blob: Blob;
        let filename = `trackamole-backup-${new Date().toISOString().split('T')[0]}`;

        if (password && password.trim().length > 0) {
            const encryptedData = await this.encrypt(JSON.stringify(data), password);
            blob = new Blob([encryptedData], { type: 'application/octet-stream' });
            filename += '.tam';
        } else {
            blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            filename += '.json';
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    async importData(file: File, password?: string): Promise<boolean> {
        try {
            const buffer = await file.arrayBuffer();
            let jsonData: any;

            if (file.name.endsWith('.tam')) {
                if (!password) throw new Error("Password required for encrypted backup");
                try {
                    const decryptedStr = await this.decrypt(buffer, password);
                    jsonData = JSON.parse(decryptedStr);
                } catch (error) {
                    throw new Error("Failed to decrypt backup. Check your password and try again.");
                }
            } else if (file.name.endsWith('.json')) {
                const decoder = new TextDecoder();
                try {
                    jsonData = JSON.parse(decoder.decode(buffer));
                } catch (error) {
                    throw new Error("Invalid JSON format in backup file");
                }
            } else {
                throw new Error("Unsupported file format. Please use .json or .tam files.");
            }

            // Validate backup structure
            if (!jsonData || typeof jsonData !== 'object') {
                throw new Error("Invalid backup format: not a valid object");
            }
            if (!Array.isArray(jsonData.moles) || !Array.isArray(jsonData.entries)) {
                throw new Error("Invalid backup format: missing moles or entries data");
            }
            if (jsonData.version && jsonData.version > 1) {
                throw new Error("This backup was created with a newer version of Track-A-Mole. Please update the app.");
            }

            // Clear and repopulate
            await db.moles.clear();
            await db.entries.clear();

            if (jsonData.moles.length > 0) {
                await db.moles.bulkAdd(jsonData.moles);
            }
            if (jsonData.entries.length > 0) {
                await db.entries.bulkAdd(jsonData.entries);
            }

            return true;
        } catch (error) {
            console.error("Import failed:", error);
            throw error;
        }
    },

    // Crypto Helpers
    async deriveKey(password: string, salt: Uint8Array) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as any,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },

    async encrypt(text: string, password: string) {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await this.deriveKey(password, salt);

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            enc.encode(text)
        );

        const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        result.set(salt, 0);
        result.set(iv, salt.length);
        result.set(new Uint8Array(encrypted), salt.length + iv.length);
        return result;
    },

    async decrypt(buffer: ArrayBuffer, password: string) {
        const data = new Uint8Array(buffer);
        const salt = data.slice(0, 16);
        const iv = data.slice(16, 28);
        const encrypted = data.slice(28);

        const key = await this.deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encrypted
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    }
};
