import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Download, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
interface RecommendationModalProps {
    recommendation: any;
    onClose: () => void;
    category?: string;
}
const RecommendationModal: React.FC<RecommendationModalProps> = ({ recommendation, onClose, category }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    if (!recommendation || !mounted) return null;
    const handleDownload = async () => {
        if (modalRef.current) {
            try {
                const dataUrl = await toPng(modalRef.current, { cacheBust: true, backgroundColor: '#044e22' });
                const link = document.createElement('a');
                link.download = `Valuation-${recommendation.name || 'Detail'}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error("Failed to download image", err);
            }
        }
    };
    const handleShare = () => {
        const text = `Check out this valuation: ${recommendation.name || recommendation.details} - PKR ${Number(recommendation.price || recommendation.prediction).toLocaleString()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };
    const displayData = { ...recommendation.specs, ...recommendation.formData };
    delete displayData.Year;
    const cleanData = Object.entries(displayData).filter(([_, v]) => v !== '' && v !== null && v !== undefined);
    const modalContent = (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/60 backdrop-blur-md" onClick={onClose}>
                <div className="flex min-h-full items-center justify-center p-4">
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[#044e22] border border-[#adc74d]/30 p-6 rounded-[2rem] max-w-lg w-full shadow-2xl relative overflow-hidden text-left"
                        onClick={e => e.stopPropagation()}
                    >
                        { }
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ea96b]/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#adc74d]/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
                        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-1.5 rounded-full z-10">
                            <X className="w-4 h-4" />
                        </button>
                        <div className="space-y-0.5 mb-5 mt-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#adc74d]/20 text-[#adc74d] text-[10px] font-bold uppercase tracking-wider mb-1">
                                {category || recommendation.category || 'Valuation'}
                            </span>
                            <h3 className="text-2xl font-black text-white leading-tight pr-8">{recommendation.name || recommendation.details}</h3>
                            <p className="text-[#adc74d] font-black text-2xl tracking-tight">
                                PKR {Number(recommendation.price || recommendation.prediction).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-[#0a5d2c]/50 p-4 rounded-xl border border-white/5 space-y-2 mb-5">
                            {recommendation.year && (
                                <div className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                    <span className="text-white/60 text-sm font-medium">Model Year</span>
                                    <span className="text-white text-sm font-bold">{recommendation.year}</span>
                                </div>
                            )}
                            {recommendation.location && (
                                <div className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                    <span className="text-white/60 text-sm font-medium">Location</span>
                                    <span className="text-white text-sm font-bold">{recommendation.location}</span>
                                </div>
                            )}
                            {cleanData.map(([key, value]) => (
                                <div className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0" key={key}>
                                    <span className="text-white/60 text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span className="text-white text-sm font-bold text-right">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <Button
                                className="bg-white/10 hover:bg-white/20 text-white border-0 h-10 font-bold rounded-xl text-sm"
                                onClick={handleDownload}
                            >
                                <Download className="w-3.5 h-3.5 mr-2" /> Save Image
                            </Button>
                            <Button
                                className="bg-[#25D366] hover:bg-[#128C7E] text-white border-0 h-10 font-bold rounded-xl text-sm"
                                onClick={handleShare}
                            >
                                <WhatsAppIcon className="w-3.5 h-3.5 mr-2" /> WhatsApp
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
    return createPortal(modalContent, document.body);
};
export default RecommendationModal;
