"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/appStore";

export default function ScreenshotManager() {
    const { gl, scene, camera } = useThree();
    const screenshotQueue = useAppStore((state) => state.screenshotQueue);
    const popScreenshotQueue = useAppStore((state) => state.popScreenshotQueue);
    const saveScreenshot = useAppStore((state) => state.saveScreenshot);
    const setSelectedMoleId = useAppStore((state) => state.setSelectedMoleId);

    const processingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Don't process if already processing or queue is empty
        if (processingRef.current || screenshotQueue.length === 0) {
            return;
        }

        const nextMoleId = screenshotQueue[0];
        console.log("ScreenshotManager: Starting capture for mole", nextMoleId, "Queue:", screenshotQueue);

        processingRef.current = true;

        // 1. Select the mole to trigger camera movement
        setSelectedMoleId(nextMoleId);

        // 2. Wait for camera transition
        timeoutRef.current = setTimeout(() => {
            console.log("ScreenshotManager: Capturing mole", nextMoleId);

            try {
                // 3. Capture
                gl.render(scene, camera);
                const dataUrl = gl.domElement.toDataURL("image/png");

                // 4. Save
                saveScreenshot(nextMoleId, dataUrl);
                console.log("ScreenshotManager: Saved screenshot for mole", nextMoleId);
            } catch (err) {
                console.error("ScreenshotManager: Failed to capture", err);
            }

            // 5. Pop queue and allow next processing
            popScreenshotQueue();
            processingRef.current = false;

        }, 1500);

        // Cleanup only if component unmounts
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [screenshotQueue.length]); // Only depend on queue length, not the queue itself

    return null;
}
