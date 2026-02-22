import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Download, Share2, Sparkles, Activity, Target, ArrowRight, FileText, X } from 'lucide-react';
import MarketTrends from '../MarketTrends';
import { Button } from "@/components/ui/button";
import RecommendationModal from './RecommendationModal';
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
interface DashboardProps {
    recentSearches: any[];
    onStartPrediction: () => void;
    onDeleteSearch?: (index: number) => void;
}
const Dashboard: React.FC<DashboardProps> = ({ recentSearches, onStartPrediction, onDeleteSearch }) => {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const totalInsights = recentSearches.length;
    let topCategory = "None";
    if (totalInsights > 0) {
        const categories = recentSearches.map(item => item.category);
        const counts = categories.reduce((acc: any, val: any) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        const maxCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        topCategory = maxCategory.charAt(0).toUpperCase() + maxCategory.slice(1);
    }
    let lastActivity = "Never";
    if (totalInsights > 0 && recentSearches[0].date) {
        lastActivity = recentSearches[0].date;
    }
    return (
        <div className="space-y-8 mt-4 mb-8 animate-in fade-in duration-700">
            { }
            <div className="text-center space-y-4 max-w-4xl mx-auto py-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <div className="pt-2">
                        <Button
                            onClick={onStartPrediction}
                            className="bg-[#044e22] hover:bg-[#087030] text-white text-lg font-bold px-10 py-6 rounded-2xl shadow-xl shadow-[#044e22]/30 hover:scale-105 transition-all duration-300 group"
                        >
                            <Sparkles className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-700" />
                            Start New Prediction
                            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </div>
            { }
            {totalInsights > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto"
                >
                    { }
                    <div className="bg-[#bedec7] backdrop-blur-sm p-4 md:p-5 rounded-3xl border border-[#044e22] flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-[#044e22] p-3 md:p-3.5 rounded-2xl shadow-sm">
                            <Activity className="w-5 h-5 md:w-6 md:h-6 text-[#adc74d]" />
                        </div>
                        <div>
                            <p className="text-[#044e22]/70 text-xs md:text-sm font-bold uppercase tracking-wider mb-0.5 md:mb-1">Total Insights</p>
                            <p className="text-2xl md:text-3xl font-black text-[#044e22]">{totalInsights}</p>
                        </div>
                    </div>
                    { }
                    <div className="bg-[#bedec7] p-4 md:p-5 rounded-3xl border border-[#044e22] flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-[#044e22] p-3 md:p-3.5 rounded-2xl shadow-sm">
                            <Target className="w-5 h-5 md:w-6 md:h-6 text-[#adc74d]" />
                        </div>
                        <div>
                            <p className="text-[#044e22]/70 text-xs md:text-sm font-bold uppercase tracking-wider mb-0.5 md:mb-1">Top Category</p>
                            <p className="text-2xl md:text-3xl font-black text-[#044e22]">{topCategory}</p>
                        </div>
                    </div>
                    { }
                    <div className="bg-[#bedec7] backdrop-blur-sm p-4 md:p-5 rounded-3xl border border-[#044e22] flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-[#044e22] p-3 md:p-3.5 rounded-2xl shadow-sm">
                            <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#adc74d]" />
                        </div>
                        <div>
                            <p className="text-[#044e22]/70 text-xs md:text-sm font-bold uppercase tracking-wider mb-0.5 md:mb-1">Last Active</p>
                            <p className="text-lg md:text-xl font-black text-[#044e22]">{lastActivity}</p>
                        </div>
                    </div>
                </motion.div>
            )}
            { }
            {recentSearches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-[#044e22] p-3 rounded-2xl shadow-sm shadow-[#044e22]/20">
                            <Clock className="w-6 h-6 text-[#adc74d]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-[#044e22] tracking-tight drop-shadow-sm">
                                Recent Valuations
                            </h3>
                            <p className="text-[#044e22]/80 text-sm font-medium">Your latest market queries & saves.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentSearches.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-[#bedec7] backdrop-blur-sm p-5 rounded-3xl border-2 border-[#044e22] hover:border-[#044e22]/30 shadow-md hover:shadow-xl hover:shadow-[#044e22]/20 transition-all duration-300 relative overflow-hidden cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="space-y-2 bg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-[#badcc4] text-[#044e22] text-[10px] uppercase font-bold px-3 py-1 rounded-full border-2 border-[#044e22] tracking-wider shadow-sm">{item.category}</span>
                                            <span className="text-[#044e22] text-xs font-bold">{item.date}</span>
                                        </div>
                                        {onDeleteSearch && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteSearch(idx);
                                                }}
                                                className="text-[#044e22]/50 hover:text-red-600 hover:bg-red-500/10 p-1.5 rounded-full transition-all"
                                                title="Delete Valuation"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#044e22] text-sm md:text-base line-clamp-1 mb-1">{item.details}</h4>
                                        <p className="text-[#044e22] font-black text-xl md:text-2xl tracking-tight">PKR {Number(item.prediction).toLocaleString()}</p>
                                    </div>
                                </div>
                                { }
                                <div className="mt-4 pt-4 border-t border-[#044e22]/10 flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs font-bold text-[#044e22] hover:!text-[#adc74d] hover:!bg-[#044e22] transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(item);
                                        }}
                                    >
                                        <FileText className="w-3.5 h-3.5 mr-1.5" /> Details
                                    </Button>
                                    <div className="w-[1px] h-6 bg-[#044e22]/10" />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs font-bold text-[#044e22] hover:!text-[#adc74d] hover:!bg-[#044e22] transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const text = `Check out this valuation: ${item.details} - PKR ${Number(item.prediction).toLocaleString()}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" /> WhatsApp
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
            { }
            <div className="bg-[#bedec7] border-2 border-[#044e22] rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-[#044e22] p-2.5 rounded-xl shadow-sm">
                        <TrendingUp className="w-6 h-6 text-[#adc74d]" />
                    </div>
                    <h3 className="text-2xl font-black text-[#044e22]">Market Insights</h3>
                </div>
                <div className="relative z-10 w-full">
                    <MarketTrends />
                </div>
            </div>
            <RecommendationModal
                recommendation={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
};
export default Dashboard;
