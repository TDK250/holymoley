"use client";

import { useAppStore } from "@/store/appStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, Camera, Move, MousePointerClick, ArrowUp, Hand, Pointer, AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function TutorialOverlay() {
    const { tutorialStep, setTutorialStep, completeTutorial, isMenuOpen, setIsMenuOpen, hasInteractedWithModel, isAddingMole, menuHeight } = useAppStore();

    // Reset interaction state when entering spin step (now step 3)
    useEffect(() => {
        if (tutorialStep === 3) {
            useAppStore.getState().setHasInteractedWithModel(false);
        }
    }, [tutorialStep]);

    // Step 3: Advance when model is rotated
    useEffect(() => {
        if (tutorialStep === 3 && hasInteractedWithModel) {
            const timer = setTimeout(() => {
                setTutorialStep(4);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [tutorialStep, hasInteractedWithModel, setTutorialStep]);

    // Step 4: Complete when entering "Add Mole" mode
    useEffect(() => {
        if (tutorialStep === 4 && isAddingMole) {
            completeTutorial();
        }
    }, [tutorialStep, isAddingMole, completeTutorial]);

    if (tutorialStep === 0) return null;

    const nextStep = () => {
        if (tutorialStep >= 4) {
            completeTutorial();
        } else {
            setTutorialStep(tutorialStep + 1);
        }
    };

    const skipTutorial = () => {
        completeTutorial();
    };

    const getPositionClass = () => {
        switch (tutorialStep) {
            case 1: return "items-center justify-center p-4"; // Disclaimer: Center
            case 2: return "items-center justify-end pb-32"; // Welcome: Bottom
            case 3: return "items-center justify-end pb-24"; // Spin: Bottom
            case 4: return "items-center justify-start pt-32"; // Spot: Top
            default: return "items-center justify-end";
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`fixed inset-0 z-50 pointer-events-none flex flex-col ${getPositionClass()} transition-all duration-500`}
            >
                {/* Backdrop for step 1 (Disclaimer) and 2 (Welcome) */}
                {(tutorialStep === 1 || tutorialStep === 2) && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />
                )}

                {/* Step 3 Visual Cue: Swipe Animation */}
                {tutorialStep === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            animate={{ x: [-60, 60] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "mirror" }}
                            className="text-white/80"
                        >
                            <Hand className="w-16 h-16 drop-shadow-lg" />
                        </motion.div>
                        <div className="absolute w-40 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full mt-12" />
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
                        <div className="flex flex-col items-center text-center space-y-4">

                            {/* STEP 1: Disclaimer */}
                            {tutorialStep === 1 && (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                                        <AlertTriangle className="w-8 h-8 text-amber-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Medical Disclaimer</h3>
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left">
                                        <p className="text-amber-200 text-sm leading-relaxed font-medium">
                                            This app is for tracking purposes only and is <strong>not a diagnostic tool</strong>.
                                        </p>
                                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                                            Always consult a qualified dermatologist for any new, changing, or concerning spots on your skin.
                                        </p>
                                    </div>
                                    <button
                                        onClick={nextStep}
                                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors mt-4"
                                    >
                                        I Understand
                                    </button>
                                </>
                            )}

                            {/* STEP 2: Welcome */}
                            {tutorialStep === 2 && (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mb-2">
                                        <span className="text-3xl">👋</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Welcome to Track-A-Mole</h3>
                                    <p className="text-slate-300 leading-relaxed">
                                        Your private, secure companion for tracking skin health over time.
                                    </p>
                                    <div className="flex items-center gap-3 w-full pt-4">
                                        <button onClick={skipTutorial} className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:bg-white/5 transition-colors text-sm font-medium">Skip</button>
                                        <button onClick={nextStep} className="flex-[2] py-3 px-4 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                            Start Tour <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* STEP 3: Spin Model */}
                            {tutorialStep === 3 && (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-2 text-blue-400">
                                        <Move className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Give it a Spin</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Drag on the screen to rotate the 3D model. Pinch to zoom in and out.
                                    </p>
                                    <div className="animate-pulse text-xs text-blue-400 font-bold uppercase tracking-wider mt-2">
                                        Waiting for interaction...
                                    </div>
                                </>
                            )}

                            {/* STEP 4: Add Mole */}
                            {tutorialStep === 4 && (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 text-emerald-400">
                                        <MousePointerClick className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Add Your First Mole</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Tap the <span className="text-rose-400 font-bold whitespace-nowrap">+ New Mole</span> button below to start tracking a spot.
                                    </p>
                                </>
                            )}

                            {/* Step Indicator */}
                            {tutorialStep > 0 && (
                                <div className="flex gap-1.5 pt-2">
                                    {[1, 2, 3, 4].map((step) => (
                                        <div
                                            key={step}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${step === tutorialStep ? "w-6 bg-white" : "w-1.5 bg-white/20"
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
