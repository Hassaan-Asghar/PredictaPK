import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MarketTrends = () => {
    // Static data for demo purposes (would typically come from backend analytics)
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
            <Card className="bg-[#e2f0e6] border-[#044e22]/20 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[#044e22] flex items-center gap-2">
                        <MapPin className="w-5 h-5" /> Top Performing Areas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topAreas.map((area, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-[#044e22]/10">
                                <div>
                                    <p className="font-bold text-[#044e22] text-sm">{area.name}</p>
                                    <p className="text-xs text-[#4ea96b] font-medium">Avg: {area.price}</p>
                                </div>
                                <div className="bg-[#e2f0e6] px-2 py-1 rounded-lg text-[#044e22] font-bold text-xs flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {area.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#e2f0e6] border-[#044e22]/20 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[#044e22] flex items-center gap-2">
                        <DollarSign className="w-5 h-5" /> Vehicle Depreciation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {carDepreciation.map((car, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white/50 p-3 rounded-xl border border-[#044e22]/10">
                                <p className="font-bold text-[#044e22] text-sm">{car.name}</p>
                                <div className="bg-red-100 px-2 py-1 rounded-lg text-red-600 font-bold text-xs flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> {car.value}
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
