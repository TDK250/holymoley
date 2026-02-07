import { useState, useEffect } from 'react';
import { type Mole, type MoleEntry } from '@/db';
import { X, CheckSquare, Square, Download, Loader2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import { db } from '@/db';
import { useAppStore } from '@/store/appStore';

interface ExportPDFModalProps {
    isOpen: boolean;
    onClose: () => void;
    moles: Mole[];
}

export default function ExportPDFModal({ isOpen, onClose, moles }: ExportPDFModalProps) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const addToScreenshotQueue = useAppStore((state) => state.addToScreenshotQueue);
    const clearScreenshots = useAppStore((state) => state.clearScreenshots);
    const screenshotMap = useAppStore((state) => state.screenshotMap);
    const screenshotQueue = useAppStore((state) => state.screenshotQueue);
    const accentColor = useAppStore((state) => state.accentColor);

    const toggleSelection = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === moles.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(moles.map(m => m.id!));
        }
    };

    const handleGenerateClick = () => {
        if (selectedIds.length === 0) return;
        setIsGenerating(true);
        clearScreenshots();
        addToScreenshotQueue(selectedIds);
    };

    // Effect to watch for completion and trigger PDF
    useEffect(() => {
        if (!isGenerating) return;

        console.log("ExportPDFModal: Queue Length:", screenshotQueue.length, "Map Size:", Object.keys(screenshotMap).length, "Selected:", selectedIds.length);

        // Check if all screenshots are captured
        // We know we are done when the queue is empty AND we have data for all selected IDs
        // (Or at least the queue is empty, meaning we tried everything)
        if (screenshotQueue.length === 0) {
            const generateFinalPDF = async () => {
                console.log("ExportPDFModal: Generating Final PDF...");
                try {
                    const entries = await db.entries.toArray();

                    const doc = (
                        <PDFReport
                            moles={moles}
                            entries={entries}
                            selectedMoleIds={selectedIds}
                            screenshotMap={screenshotMap}
                        />
                    );

                    const blob = await pdf(doc).toBlob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `TrackAMole_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    onClose();
                } catch (err) {
                    console.error("PDF Fail", err);
                    alert("Failed to generate PDF");
                } finally {
                    setIsGenerating(false);
                }
            };

            // If the queue is empty, we must have finished trying to capture everything.
            // Even if we missed some (count mismatch), we should probably proceed to avoid hanging.
            const timeoutId = setTimeout(() => {
                generateFinalPDF();
            }, 500); // Slight buffer to allow final saveScreenshot to propagate

            return () => clearTimeout(timeoutId);
        }
    }, [isGenerating, screenshotQueue.length, screenshotMap, selectedIds, moles, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pointer-events-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Export PDF Report</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 border-b border-gray-100 bg-blue-50">
                    <p className="text-xs text-blue-800 line-clamp-3">
                        <strong>Disclaimer:</strong> This report is for personal notes only.
                        Track-A-Mole is not a diagnostic tool.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-medium text-gray-500">
                            {selectedIds.length} selected
                        </span>
                        <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                        >
                            {selectedIds.length === moles.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="space-y-2">
                        {moles.map(mole => (
                            <button
                                key={mole.id}
                                onClick={() => toggleSelection(mole.id!)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all border ${selectedIds.includes(mole.id!)
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${selectedIds.includes(mole.id!) ? 'bg-blue-500 text-white' : 'border border-gray-300 bg-white'
                                    }`}>
                                    {selectedIds.includes(mole.id!) && <CheckSquare size={14} />}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-gray-800">{mole.label}</div>
                                    <div className="text-xs text-gray-500 capitalize">{mole.type || 'Mole'}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 dark:bg-slate-900/50 dark:border-slate-800">
                    <button
                        onClick={handleGenerateClick}
                        disabled={selectedIds.length === 0 || isGenerating}
                        className="w-full h-12 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg"
                        style={{
                            backgroundColor: isGenerating || selectedIds.length === 0 ? undefined : accentColor,
                            boxShadow: isGenerating || selectedIds.length === 0 ? undefined : `0 10px 15px -3px ${accentColor}33`
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="animate-spin" size={20} style={{ color: accentColor }} />
                                <span style={{ color: accentColor }}>Generating...</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                Generate Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
