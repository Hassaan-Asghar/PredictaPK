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
                        <CartesianGrid strokeDasharray="3 3" stroke="#BBF2C3" opacity={0.1} horizontal={false} />
                        <XAxis
                            type="number"
                            stroke="#BBF2C3"
                            tick={{ fill: '#BBF2C3', fontSize: 12, fontWeight: 500 }}
                            domain={[-Math.max(...data.map(d => Math.abs(d.value))), Math.max(...data.map(d => Math.abs(d.value)))]}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            stroke="#BBF2C3"
                            width={100}
                            tick={{ fill: '#BBF2C3', fontSize: 12, fontWeight: 600 }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#22401A', borderColor: '#BBF2C3', color: '#BBF2C3', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                            cursor={{ fill: '#BBF2C3', opacity: 0.1 }}
                            formatter={(value: number) => [`PKR ${Math.abs(value).toLocaleString()}`, "Impact"]}
                            labelStyle={{ color: '#C1D96C' }}
                        />
                        <ReferenceLine x={0} stroke="#BBF2C3" />
                        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#BBF2C3' : '#D9B341'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            <div className="flex justify-center items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#BBF2C3] shadow-sm shadow-green-500/20"></div>
                    <span className="text-xs text-[#BBF2C3] font-medium">Increases Price</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D9B341] shadow-sm shadow-yellow-500/20"></div>
                    <span className="text-xs text-[#BBF2C3] font-medium">Decreases Price</span>
                </div>
            </div>
        </div>
    );
};

export default ShapChart;
