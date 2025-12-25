import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    subMonths,
    isSameMonth,
    parseISO
} from 'date-fns';
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
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalorieDeficitSurplusChart() {
    const { calories } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthData = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const entry = calories.find(c => c.day === dateStr);

            // Safety check for invalid entries
            if (entry && (!entry.day || typeof entry.day !== 'string')) {
                return {
                    date: dateStr,
                    dayName: format(day, 'E'),
                    dayNumber: format(day, 'd'),
                    balance: 0,
                    net: 0,
                    target: 0,
                    hasData: false
                };
            }

            const intake = entry?.intake || 0;
            const exercise = entry?.exercise || 0;
            const net = intake - exercise;
            const target = entry?.target || 0;

            // Balance Calculation: Target - Net
            // Positive (+) = Deficit (Under limit) -> Good (Green)
            // Negative (-) = Surplus (Over limit) -> Bad (Red) this is okay but it needs to be flipped on the other page. 
            const balance = target ? target - net : 0;

            return {
                date: dateStr,
                dayName: format(day, 'E'), // Mon, Tue
                dayNumber: format(day, 'd'),
                balance,
                net,
                target,
                hasData: !!entry
            };
        });
    }, [calories, currentDate]);

    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-3 rounded-lg shadow-lg">
                    <p className="font-bold mb-2">{format(parseISO(data.date), 'EEEE, MMM do')}</p>
                    <div className="space-y-1 text-sm">
                        <p className="flex justify-between gap-4">
                            <span className="text-gray-400">Target:</span>
                            <span>{data.target}</span>
                        </p>
                        <p className="flex justify-between gap-4">
                            <span className="text-gray-400">Net Calories:</span>
                            <span>{data.net}</span>
                        </p>
                        <div className="border-t border-gray-700 my-1 pt-1">
                            <p className="flex justify-between gap-4 font-bold">
                                <span className={data.balance >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                    {data.balance >= 0 ? 'Deficit:' : 'Surplus:'}
                                </span>
                                <span className={data.balance >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                                    {data.balance > 0 ? '+' : ''}{data.balance}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Calorie Balance</h3>
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
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                        <XAxis
                            dataKey="dayName"
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                            interval={2} // Show every 3rd label to avoid crowding
                        />
                        <YAxis
                            stroke="#666"
                            domain={[-3000, 3000]}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'white', opacity: 0.05 }} />
                        <ReferenceLine y={0} stroke="#666" />
                        <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                            {monthData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.balance >= 0 ? '#22c55e' : '#ef4444'}
                                    fillOpacity={0.8}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#22c55e] opacity-80" />
                    <span className="text-gray-400">Deficit (Under Limit)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#ef4444] opacity-80" />
                    <span className="text-gray-400">Surplus (Over Limit)</span>
                </div>
                <div className="flex items-center gap-2 border-l border-white/10 pl-6 ml-2">
                    <span className="text-gray-400">Net Month:</span>
                    <span className={`font-bold ${monthData.reduce((sum, day) => sum + day.balance, 0) >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {monthData.reduce((sum, day) => sum + day.balance, 0) < 0 ? 'Surplus of ' : 'Deficit of '}
                        {Math.abs(monthData.reduce((sum, day) => sum + day.balance, 0))}
                    </span>
                </div>
            </div>
        </div>
    );
}
