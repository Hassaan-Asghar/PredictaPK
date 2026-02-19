import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Download, Share2, Sparkles, ArrowRight, FileText } from 'lucide-react';
import MarketTrends from '../MarketTrends';
import { Button } from "@/components/ui/button";
import RecommendationModal from './RecommendationModal';
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

interface DashboardProps {
    recentSearches: any[];
    onStartPrediction: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ recentSearches, onStartPrediction }) => {
    const [selectedItem, setSelectedItem] = useState<any>(null);

    return (
        <div className="space-y-12 mt-8 mb-12 animate-in fade-in duration-700">
            {/* 1. Hero / Project Info Section */}
            <div className="text-center space-y-6 max-w-4xl mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
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

            {/* 2. Market Trends Section */}
            <div className="bg-white/40 border border-[#044e22]/10 rounded-3xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#e2f0e6] p-2.5 rounded-xl text-[#044e22]">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-[#044e22]">Market Insights</h3>
                </div>
                <MarketTrends />
            </div>

            {/* 3. Recent Valuations Section */}
            {recentSearches.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-[#e2f0e6] p-3 rounded-2xl text-[#044e22] ring-2 ring-[#044e22] shadow-sm shadow-[#044e22]/20">
                            <Clock className="w-6 h-6" />
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
                                className="group bg-white/80 backdrop-blur-sm p-5 rounded-3xl border border-[#044e22]/10 hover:border-[#044e22]/30 shadow-sm hover:shadow-xl hover:shadow-[#044e22]/10 transition-all duration-300 relative overflow-hidden cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="bg-[#e2f0e6] text-[#044e22] text-[10px] uppercase font-bold px-3 py-1 rounded-full tracking-wider">{item.category}</span>
                                        <span className="text-[#044e22]/40 text-xs font-semibold">{item.date}</span>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-[#044e22] text-sm md:text-base line-clamp-1 mb-1">{item.details}</h4>
                                        <p className="text-[#4ea96b] font-black text-xl md:text-2xl tracking-tight">PKR {Number(item.prediction).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="mt-4 pt-4 border-t border-[#044e22]/5 flex items-center justify-between gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs font-bold text-[#044e22]/70 hover:text-[#044e22] hover:bg-[#e2f0e6]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem(item);
                                        }}
                                    >
                                        <FileText className="w-3 h-3 mr-1.5" /> Details
                                    </Button>
                                    <div className="w-px h-4 bg-[#044e22]/10"></div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-8 text-xs font-bold text-[#25D366] hover:text-[#25D366]/80 hover:bg-[#25D366]/10"
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

            <RecommendationModal
                recommendation={selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    );
};

export default Dashboard;
