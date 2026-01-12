"use client";

import { useAppStore } from "@/store/appStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Camera, Move, MousePointerClick, ArrowUp, Hand, Pointer } from "lucide-react";
import { useEffect } from "react";

export default function TutorialOverlay() {
    const { tutorialStep, setTutorialStep, completeTutorial, isMenuOpen, setIsMenuOpen, hasInteractedWithModel, isAddingMole, menuHeight } = useAppStore();

    // Reset interaction state when entering step 2
    useEffect(() => {
        if (tutorialStep === 2) {
            useAppStore.getState().setHasInteractedWithModel(false);
        }
    }, [tutorialStep]);

    // Step 2: Advance when model is rotated
    useEffect(() => {
        if (tutorialStep === 2 && hasInteractedWithModel) {
            // Delay slightly to let them enjoy the rotation
            const timer = setTimeout(() => {
                setTutorialStep(3);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tutorialStep, hasInteractedWithModel, setTutorialStep]);

    // Step 3: Complete when entering "Add Mole" mode
    useEffect(() => {
        if (tutorialStep === 3 && isAddingMole) {
            completeTutorial();
        }
    }, [tutorialStep, isAddingMole, completeTutorial]);

    if (tutorialStep === 0) return null;

    const nextStep = () => {
        if (tutorialStep >= 3) { // Reduced to 3 steps
            completeTutorial();
        } else {
            setTutorialStep(tutorialStep + 1);
        }
    };

    const skipTutorial = () => {
        completeTutorial();
    };

    // Determine position based on step to avoid blocking interactive elements
    // Using simple flex alignment to keep center clear
    const getPositionClass = () => {
        switch (tutorialStep) {
            case 1: return "items-center justify-end pb-32"; // Welcome at bottom to show model
            case 2: return "items-center justify-end pb-24"; // Bottom
            case 3: return "items-center justify-start pt-32"; // Top, avoid + button at bottom
            default: return "items-center justify-end";
        }
    };

    if (tutorialStep === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 pointer-events-none flex flex-col ${getPositionClass()} transition-all duration-500`}
            >
                {/* Backdrop - Only for non-interactive steps or very subtle */}
                {tutorialStep === 1 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={nextStep} />
                )}

                {/* Step 2 Visual Cue: Swipe Animation */}
                {tutorialStep === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            animate={{ x: [-60, 60] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "mirror" }}
                            className="text-white/80"
                        >
                            <Hand className="w-16 h-16 drop-shadow-lg" />
                        </motion.div>
                        {/* Trail effect or simple indication */}
                        <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mt-12" />
                    </div>
                )}

                {/* Step 3 Visual Cue: Tap Animation for Button */}
                {tutorialStep === 3 && (
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            // Positioned roughly where the "New Mole" button is (bottom right, above safe area)
                            className="absolute bottom-16 right-6 md:right-1/3 z-50"
                        >
                            <motion.div
                                animate={{ scale: [1, 0.9, 1], y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-rose-500 bg-white rounded-full p-2 shadow-xl shadow-rose-500/20"
                            >
                                <Pointer className="w-8 h-8 fill-current" />
                            </motion.div>
                        </motion.div>
                    </div>
                )}

                {/* Content Container */}
                <div className="relative z-60 w-full max-w-sm px-6 pointer-events-none mb-4">
                    <motion.div
                        key={tutorialStep}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl pointer-events-auto"
                    >
                        {/* Step Content */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            {tutorialStep === 1 && (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                                        <span className="text-3xl">👋</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Welcome to Track-A-Mole</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        Your personal companion for tracking skin health. Let's take a quick tour.
                                    </p>

                                    {/* Only Step 1 has Next button now */}
                                    <div className="flex items-center gap-3 w-full pt-4">
                                        <button onClick={skipTutorial} className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">Skip</button>
                                        <button onClick={nextStep} className="flex-[2] py-3 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                            Start Tour <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}

                            {tutorialStep === 2 && (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 text-blue-400">
                                        <Move className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Give it a Spin</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Drag on the screen to rotate the model. Pinch to zoom.
                                    </p>
                                    <div className="animate-pulse text-xs text-blue-400 font-bold uppercase tracking-wider mt-2">
                                        Waiting for interaction...
                                    </div>
                                </>
                            )}

                            {tutorialStep === 3 && (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 text-emerald-400">
                                        <MousePointerClick className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Select a Spot</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Tap the <span className="text-rose-400 font-bold border border-rose-500/30 px-1 rounded bg-rose-500/10">+ New Mole</span> button below to start tracking.
                                    </p>
                                </>
                            )}



                            {/* Step Indicator */}
                            <div className="flex gap-1.5 pt-2">
                                {[1, 2, 3].map((step) => (
                                    <div
                                        key={step}
                                        className={`h-1.5 rounded-full transition-all duration-300 ${step === tutorialStep ? "w-6 bg-white" : "w-1.5 bg-white/20"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
