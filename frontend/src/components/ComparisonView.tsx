import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Minus, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';

interface ComparisonProps {
    isOpen: boolean;
    onClose: () => void;
    comparisons: any[];
    onRemove: (index: number) => void;
}

const ComparisonView: React.FC<ComparisonProps> = ({ isOpen, onClose, comparisons, onRemove }) => {

    // Helper to format currency
    const formatPrice = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} Lac`;
        return value.toLocaleString();
    };

    const generatePDF = async () => {
        const element = document.getElementById('comparison-modal-wrapper');
        const scrollContainer = document.getElementById('comparison-scroll-container');
        if (!element || !scrollContainer) return;

        // Store original styles
        const originalOverflow = scrollContainer.style.overflow;
        const originalHeight = scrollContainer.style.height;
        const originalMaxHeight = scrollContainer.style.maxHeight;

        // Store wrapper styles (it also has max-h restriction)
        const wrapperOriginalOverflow = element.style.overflow;
        const wrapperOriginalMaxHeight = element.style.maxHeight;
        const wrapperOriginalHeight = element.style.height;

        try {
            // Temporarily expand scroll container to show full content
            scrollContainer.style.overflow = 'visible';
            scrollContainer.style.height = 'auto';
            scrollContainer.style.maxHeight = 'none';

            // Also expand the wrapper so it doesn't clip
            element.style.overflow = 'visible';
            element.style.maxHeight = 'none';
            element.style.height = 'auto';

            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(element, {
                backgroundColor: '#e2f0e6',
                cacheBust: true,
                style: {
                    height: 'auto',
                    overflow: 'visible',
                    maxHeight: 'none',
                }
            });

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (pdfHeight > pdf.internal.pageSize.getHeight()) {
                const pageHeight = pdf.internal.pageSize.getHeight();
                let heightLeft = pdfHeight;
                let position = 0;

                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }
            } else {
                pdf.addImage(dataUrl, 'PNG', 0, 10, pdfWidth, pdfHeight);
            }
            pdf.save(`PredictaPK_Comparison_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("PDF generation failed", err);
        } finally {
            // Restore original styles
            scrollContainer.style.overflow = originalOverflow;
            scrollContainer.style.height = originalHeight;
            scrollContainer.style.maxHeight = originalMaxHeight;

            element.style.overflow = wrapperOriginalOverflow;
            element.style.maxHeight = wrapperOriginalMaxHeight;
            element.style.height = wrapperOriginalHeight;
        }
    };

    if (!isOpen) return null;

    // Extract all unique keys from formData for comparison rows, excluding some internal ones
    const getAllKeys = () => {
        const keys = new Set<string>();

        // First, get all potential keys from all items
        const allPotentialKeys = new Set<string>();
        comparisons.forEach(item => {
            Object.keys(item.formData).forEach(k => allPotentialKeys.add(k));
        });

        // Filter keys that should be shown
        allPotentialKeys.forEach(key => {
            // Specific exclusions
            if (['AgreeToTerms'].includes(key)) return;

            // Check if ANY item has a value for this key (not null/undefined/empty string)
            // We want to show 'City' if it exists.
            const hasValue = comparisons.some(item => {
                const val = item.formData[key];
                return val !== undefined && val !== null && val !== '';
            });

            if (hasValue) {
                keys.add(key);
            }
        });

        return Array.from(keys);
    };

    const keys = getAllKeys();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    id="comparison-modal-wrapper"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[#e2f0e6] w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-[#044e22]/20 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[#044e22]/10 bg-white/50 backdrop-blur-md flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-[#044e22]">Comparison</h2>
                            <p className="text-[#044e22]/70 text-sm">Comparing {comparisons.length} items</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={generatePDF}
                                className="text-[#044e22] border-[#044e22]/20 hover:!bg-[#044e22] hover:text-white gap-2 transition-colors duration-300"
                            >
                                <Download className="w-4 h-4" /> Download Report
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-[#044e22] hover:bg-[#044e22]/10 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div id="comparison-scroll-container" className="flex-1 overflow-auto p-6 bg-[#e2f0e6]">
                        {comparisons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-[#044e22]/50 space-y-4">
                                <p>No items to compare.</p>
                                <Button onClick={onClose}>Close</Button>
                            </div>
                        ) : (
                            <div id="comparison-content" className="grid grid-cols-[200px_1fr] gap-6 min-w-max">
                                {/* Labels Column */}
                                <div className="space-y-4 pt-32"> {/* Offset for header cards */}
                                    {keys.map(key => (
                                        <div key={key} className="h-10 flex items-center text-[#044e22]/70 font-semibold text-sm capitalize px-2">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                    ))}
                                </div>

                                {/* Items Columns */}
                                <div className="flex gap-4">
                                    {comparisons.map((item, idx) => (
                                        <div key={idx} className="w-64 space-y-4 relative group">
                                            <button
                                                onClick={() => onRemove(idx)}
                                                className="absolute -top-3 -right-3 z-10 bg-red-100 text-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>

                                            {/* Top Card (Price) */}
                                            <div className="bg-[#044e22] p-6 rounded-2xl text-[#e2f0e6] shadow-lg relative overflow-hidden h-28 flex flex-col justify-center text-center">
                                                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#e2f0e6] to-[#4ea96b]">
                                                    {formatPrice(item.prediction)}
                                                </div>
                                                <div className="text-xs text-[#adc74d] font-medium tracking-wide uppercase mt-1">
                                                    Estimated Price
                                                </div>
                                            </div>

                                            {/* Data Rows */}
                                            <div className="space-y-4">
                                                {keys.map(key => {
                                                    const val = item.formData[key];
                                                    return (
                                                        <div key={key} className="h-10 flex items-center justify-center bg-white/40 rounded-lg text-[#044e22] font-medium text-sm border border-[#044e22]/5">
                                                            {val === true ? <Check className="w-4 h-4 text-green-600" /> :
                                                                val === false ? <X className="w-4 h-4 text-red-400" /> :
                                                                    val || <Minus className="w-3 h-3 text-[#044e22]/30" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ComparisonView;
