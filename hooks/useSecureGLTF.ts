"use client";

import { useLoader } from "@react-three/fiber";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";

const ENCRYPTION_KEY_HEX = process.env.NEXT_PUBLIC_ASSET_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function decryptAsset(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch asset: ${url}`);

    const arrayBuffer = await response.arrayBuffer();

    // Format: [IV (12 bytes)][Ciphertext][AuthTag (16 bytes)]
    const iv = arrayBuffer.slice(0, 12);
    const encryptedDataWithTag = arrayBuffer.slice(12);

    const keyData = new Uint8Array(
        ENCRYPTION_KEY_HEX.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(iv) },
        key,
        encryptedDataWithTag
    );

    return decrypted;
}

class SecureGLTFLoader extends THREE.Loader {
    private gltfLoader: GLTFLoader;

    constructor(manager?: THREE.LoadingManager) {
        super(manager);
        this.gltfLoader = new GLTFLoader(manager);
    }

    load(
        url: string,
        onLoad: (data: GLTF) => void,
        onProgress?: (event: ProgressEvent) => void,
        onError?: (event: ErrorEvent) => void
    ) {
        decryptAsset(url)
            .then((buffer) => {
                this.gltfLoader.parse(
                    buffer,
                    "",
                    onLoad,
                    (err: Error | ErrorEvent) => {
                        console.error("Error parsing decrypted GLB:", err);
                        onError?.(new ErrorEvent("error", { error: err }));
                    }
                );
            })
            .catch((err: Error) => {
                console.error("Error decrypting asset:", err);
                onError?.(new ErrorEvent("error", { error: err }));
            });
    }
}

/**
 * A hook to load encrypted GLB models.
 * It fetches the .glb.enc file, decrypts it in memory, and parses it.
 * Supports React Suspense.
 */
export function useSecureGLTF(url: string): GLTF {
    return useLoader(SecureGLTFLoader, url);
}

// Preload helper
useSecureGLTF.preload = (url: string) => {
    // Note: useLoader.preload doesn't work easily with custom complex loaders 
    // without more setup, so we handle it simply if needed or skip for now.
    // For this context, standard useLoader will handle basic caching.
};
