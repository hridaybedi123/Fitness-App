import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    format,
    parseISO,
    isSameMonth,
    addMonths,
    subMonths
} from 'date-fns';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthlyStepsChart() {
    const { calories } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const chartData = useMemo(() => {
        return calories
            .filter(entry => {
                if (!entry.day || !entry.steps) return false;
                try {
                    const date = parseISO(entry.day);
                    return isSameMonth(date, currentDate);
                } catch (e) {
                    return false;
                }
            })
            .sort((a, b) => a.day.localeCompare(b.day))
            .map(entry => ({
                date: format(parseISO(entry.day), 'MM/dd'),
                steps: entry.steps,
                fullDate: format(parseISO(entry.day), 'EEEE, MMM do, yyyy')
            }));
    }, [calories, currentDate]);

    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-lg shadow-lg">
                    <p className="font-bold mb-2 text-sm">{data.fullDate}</p>
                    <div className="space-y-1 text-sm">
                        <p className="flex justify-between gap-4">
                            <span className="text-gray-400">Steps:</span>
                            <span className="text-[var(--accent-primary)] font-bold">{data.steps.toLocaleString()}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Monthly Steps</h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium min-w-[140px] text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        disabled={isSameMonth(currentDate, new Date()) && currentDate > new Date()}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 5, bottom: 5, left: -20 }}>
                            <defs>
                                <linearGradient id="stepGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                interval="preserveStartEnd"
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fontSize: 12 }}
                                domain={[0, 'auto']}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar
                                dataKey="steps"
                                fill="url(#stepGradient)"
                                radius={[6, 6, 0, 0]}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        className="hover:filter hover:brightness-125 transition-all duration-300"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        No steps recorded for this month
                    </div>
                )}
            </div>
        </div>
    );
}
