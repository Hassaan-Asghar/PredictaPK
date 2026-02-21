import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { Activity, TrendingUp, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import ShapChart from '../ShapChart';
import TrendChart from '../TrendChart';
interface PredictionResultProps {
    result: any;
    category: string;
    addToComparison: () => void;
    generatePDF: () => void;
}
const PredictionResult: React.FC<PredictionResultProps> = ({ result, category, addToComparison, generatePDF }) => {
    const explanationData = result?.explanation || [];
    const filteredExplanation = explanationData.filter((i: any) => i.active);
    const formatPakistaniPrice = (amount: number): string => {
        const absAmount = Math.abs(amount);
        if (absAmount >= 10000000) return `${(amount / 10000000).toFixed(2)} Crore`;
        if (absAmount >= 100000) return `${(amount / 100000).toFixed(2)} Lac`;
        if (absAmount >= 1000) return `${(amount / 1000).toFixed(1)} Thousand`;
        return amount.toLocaleString();
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mt-16"
            id="result-section"
        >
            <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-[#4ea96b] via-[#044e22] to-[#4ea96b] shadow-2xl shadow-[#044e22]/20">
                <div className="absolute inset-0 bg-[#4ea96b]/10 blur-3xl opacity-30" />
                <div className="relative text-center p-6 bg-[#badcc4] rounded-[23px] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4ea96b]/40 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#badcc4]/10 to-transparent" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#044e22] rounded-3xl p-8 shadow-xl shadow-[#044e22]/20 border border-[#044e22]/20">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b5f36] border border-[#4ea96b] text-[#e2f0e6] text-xs font-bold uppercase tracking-widest mb-8">
                            <Activity className="w-3.5 h-3.5" /> AI Valuation Complete
                        </div>
                        <div className="flex flex-col items-center justify-center relative">
                            <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#e2f0e6] via-[#e2f0e6] to-[#4ea96b] tracking-tight mb-2 drop-shadow-sm">
                                {formatPakistaniPrice(result?.prediction ?? 0)}
                            </div>
                            <span className="text-xl text-[#adc74d] font-bold tracking-widest uppercase">PKR Estimated</span>
                        </div>
                        {result?.rentalYield && (
                            <div className="mt-4 bg-[#e2f0e6]/10 py-2 px-4 rounded-xl border border-[#e2f0e6]/20">
                                <p className="text-[#e2f0e6] text-sm font-medium">
                                    Expected Annual Return (ROI): <span className="text-[#adc74d] font-bold text-lg">{result.rentalYield}%</span>
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-[#adc74d] mt-4 font-bold uppercase tracking-widest opacity-60">
                            * Disclaimer: Actual price may vary based on condition & location
                        </p>
                        <div className="mt-8 flex flex-col md:flex-row justify-center gap-4 w-full md:max-w-xl mx-auto">
                            <Button
                                type="button"
                                onClick={addToComparison}
                                variant="outline"
                                className="flex-1 bg-[#e2f0e6]/10 text-[#e2f0e6] border-[#e2f0e6]/30 hover:!bg-[#adc74d] hover:text-[#044e22] rounded-xl h-12 font-bold transition-all"
                            >
                                + Add to Compare
                            </Button>
                            <Button
                                type="button"
                                onClick={generatePDF}
                                variant="outline"
                                className="flex-1 bg-[#e2f0e6]/10 text-[#e2f0e6] border-[#e2f0e6]/30 hover:!bg-[#adc74d] hover:text-[#044e22] rounded-xl h-12 font-bold transition-all"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download Report
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    const text = `Check out this ${category} prediction on PredictaPK! Estimated Price: ${formatPakistaniPrice(result?.prediction ?? 0)}`;
                                    window.open(`https:
                                }}
                                variant="outline"
                                className="flex-1 bg-transparent text-[#e2f0e6] border-[#25D366] hover:!bg-[#adc74d] hover:text-[#044e22] rounded-xl h-12 font-bold transition-all"
                            >
                                <WhatsAppIcon className="w-4 h-4 mr-2" /> WhatsApp
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
            {filteredExplanation.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
                    {}
                    {result?.trends && result.trends.length > 0 && (
                        <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl mb-12">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-4 mb-8 pl-6 pt-6">
                                    <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                            Market Trend
                                        </h3>
                                        <p className="text-[#044e22]/80 text-sm font-medium">Estimated value by model year.</p>
                                    </div>
                                </div>
                                <div className="p-8 md:p-10 m-6 rounded-3xl bg-[#044e22] backdrop-blur-sm border border-[#044e22]/20 shadow-xl h-[400px]">
                                    <TrendChart data={result.trends} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12">
                        <Card className="overflow-hidden border-2 border-[#044e22] bg-[#badcc4] shadow-xl shadow-[#044e22]/5 rounded-3xl">
                            <CardContent className="p-0">
                                <div className="flex items-center gap-4 mb-8 pl-6 pt-6">
                                    <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                            AI Market Drivers
                                        </h3>
                                        <p className="text-[#044e22]/80 text-sm font-medium">How specific features impacted this valuation.</p>
                                    </div>
                                </div>
                                <div className="p-8 md:p-10 m-6 rounded-3xl bg-[#044e22] backdrop-blur-sm border border-[#044e22]/20 shadow-xl">
                                    <ShapChart data={filteredExplanation} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 border-t border-[#f2efc9]/30 pt-8">
                                        {filteredExplanation.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-[#22401A] border border-[#f2efc9] p-4 rounded-xl flex justify-between items-center shadow-lg shadow-[#000000]/20 hover:scale-[1.02] transition-transform duration-300">
                                                <div>
                                                    <span className="text-[#f2efc9] font-bold block text-sm mb-1">{item.name}</span>
                                                    <span className="text-[#f2efc9] text-[10px] uppercase tracking-wider font-semibold">Impact</span>
                                                </div>
                                                <div className={`text-lg font-black ${item.value >= 0 ? 'text-[#adc74d]' : 'text-[#badcc4]'} `}>
                                                    {item.value >= 0 ? '+' : ''}{formatPakistaniPrice(item.value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
};
export default PredictionResult;
