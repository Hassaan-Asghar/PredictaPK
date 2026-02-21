import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
interface TrendProps {
    data: { year: number; price: number }[];
}
const TrendChart: React.FC<TrendProps> = ({ data }) => {
    if (!data || data.length === 0) return null;
    const formatPrice = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(2)} Lac`;
        return value.toLocaleString();
    };
    return (
        <div className="w-full h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#adc74d" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#adc74d" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2efc9" opacity={0.1} vertical={false} />
                    <XAxis
                        dataKey="year"
                        stroke="#f2efc9"
                        tick={{ fill: '#f2efc9', fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                        stroke="#f2efc9"
                        tick={{ fill: '#f2efc9', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={formatPrice}
                        width={80}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#22401A',
                            borderColor: '#f2efc9',
                            color: '#f2efc9',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#f2efc9' }}
                        cursor={{ fill: '#f2efc9', opacity: 0.1 }}
                        labelStyle={{ color: '#C1D96C' }}
                        formatter={(value: number) => [`PKR ${value.toLocaleString()}`, "Est. Price"]}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#adc74d"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
export default TrendChart;
