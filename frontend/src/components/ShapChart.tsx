"use client"

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShapValue } from '@/lib/api';
import { motion } from 'framer-motion';

interface ShapChartProps {
    data: ShapValue[];
}

const ShapChart: React.FC<ShapChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
                className="h-[400px] w-full"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f2efc9" opacity={0.1} horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#f2efc9"
                            tick={{ fill: '#f2efc9', fontSize: 12, fontWeight: 500 }}
                            domain={[-Math.max(...data.map(d => Math.abs(d.value))), Math.max(...data.map(d => Math.abs(d.value)))]}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#f2efc9"
                            width={100}
                            tick={{ fill: '#f2efc9', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#22401A', borderColor: '#f2efc9', color: '#f2efc9', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                            cursor={{ fill: '#f2efc9', opacity: 0.1 }}
                            formatter={(value: number) => [`PKR ${Math.abs(value).toLocaleString()}`, "Impact"]}
                            labelStyle={{ color: '#C1D96C' }}
                            itemStyle={{ color: '#f2efc9' }}
                        />
                        <ReferenceLine x={0} stroke="#e2d7ab" />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#adc74dff' : '#badcc4'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="flex justify-center items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#adc74dff] shadow-sm shadow-green-500/20"></div>
                    <span className="text-xs text-[#adc74dff] font-medium">Increases Price</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#badcc4] shadow-sm shadow-yellow-500/20"></div>
                    <span className="text-xs text-[#badcc4] font-medium">Decreases Price</span>
                </div>
            </div>
        </div>
    );
};

export default ShapChart;
