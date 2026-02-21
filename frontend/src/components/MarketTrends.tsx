import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, MapPin } from "lucide-react";
import { motion } from "framer-motion";
const MarketTrends = () => {
    const topAreas = [
        { name: "DHA Phase 6, Lahore", price: "4.5 Crore", trend: "+12%" },
        { name: "Bahria Town, Islamabad", price: "3.2 Crore", trend: "+8%" },
        { name: "Clifton, Karachi", price: "5.1 Crore", trend: "+5%" },
    ];
    const carDepreciation = [
        { name: "Toyota Corolla (1st Year)", value: "-10%" },
        { name: "Honda Civic (1st Year)", value: "-12%" },
        { name: "Suzuki Alto (1st Year)", value: "-5%" },
    ];
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12"
        >
            <Card className="bg-[#044e22] border-[#044e22] shadow-xl rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ea96b]/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <CardHeader className="pb-4 pt-6 px-6">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-black tracking-tight z-10 relative">
                        <div className="p-2 bg-[#adc74d]/20 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-[#adc74d]" />
                        </div>
                        Top Performing Areas
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 relative z-10">
                    <div className="space-y-3">
                        {topAreas.map((area, idx) => (
                            <div key={idx} className="group/item flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                <div>
                                    <p className="font-bold text-white text-sm tracking-wide">{area.name}</p>
                                    <p className="text-xs text-[#adc74d] font-bold mt-0.5">Avg: {area.price}</p>
                                </div>
                                <div className="bg-[#adc74d] px-2.5 py-1.5 rounded-xl text-[#044e22] font-black text-xs flex items-center gap-1.5 shadow-sm group-hover/item:scale-105 transition-transform">
                                    <TrendingUp className="w-3.5 h-3.5" /> {area.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-[#044e22] border-[#044e22] shadow-xl rounded-3xl overflow-hidden relative group">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                <CardHeader className="pb-4 pt-6 px-6">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-black tracking-tight z-10 relative">
                        <div className="p-2 bg-[#adc74d]/20 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#adc74d]" />
                        </div>
                        Vehicle Depreciation
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 relative z-10">
                    <div className="space-y-3">
                        {carDepreciation.map((car, idx) => (
                            <div key={idx} className="group/item flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                <p className="font-bold text-white text-sm tracking-wide">{car.name}</p>
                                <div className="bg-[#4d2929] px-2.5 py-1.5 rounded-xl text-[#ffbaba] font-black text-xs flex items-center gap-1.5 border border-[#8a3a3a] shadow-sm group-hover/item:scale-105 transition-transform">
                                    <TrendingDown className="w-3.5 h-3.5" /> {car.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
export default MarketTrends;
