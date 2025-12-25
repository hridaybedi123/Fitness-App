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
    parseISO,
    isSameDay,
    getDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export default function WorkoutConsistency() {
    const { workouts, calories } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());

    const { days, consistencyScore, paddingDays } = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const daysInMonth = eachDayOfInterval({ start, end });

        // Calculate padding to start on Monday
        // getDay returns 0 for Sunday, 1 for Monday...
        // We want Monday = 0, Sunday = 6
        const startDay = getDay(start);
        const padding = (startDay + 6) % 7;
        const paddingDaysArr = Array(padding).fill(null);

        let activeCount = 0;
        const processedDays = daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const workout = workouts[dateStr];
            const calorieEntry = calories.find(c => c.day === dateStr);

            const hasWorkout = workout && workout.type !== 'Rest' && workout.type !== '';
            const hasSteps = calorieEntry?.steps && calorieEntry.steps > 0;
            const isActive = hasWorkout || hasSteps;

            if (isActive) activeCount++;

            // Calculate balance for color coding
            const intake = calorieEntry?.intake || 0;
            const exercise = calorieEntry?.exercise || 0;
            const net = intake - exercise;
            const target = calorieEntry?.target || 0;
            const balance = target ? target - net : 0;

            return {
                date: day,
                dateStr,
                dayNumber: format(day, 'd'),
                workout,
                steps: calorieEntry?.steps,
                isActive,
                balance,
                hasCalorieData: !!calorieEntry
            };
        });

        const score = Math.round((activeCount / daysInMonth.length) * 100);

        return {
            days: processedDays,
            consistencyScore: score,
            paddingDays: paddingDaysArr
        };
    }, [workouts, calories, currentDate]);

    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold">Consistency</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-bold text-[var(--accent-primary)]">{consistencyScore}%</span>
                        <span className="text-sm text-gray-400">Active Days</span>
                    </div>
                </div>
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

            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-base text-gray-400 font-black py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} className="aspect-square" />
                ))}

                {days.map((day) => (
                    <div
                        key={day.dateStr}
                        className={`
                            aspect-square rounded-xl p-4 relative group transition-all duration-500
                            border ${isSameDay(day.date, new Date()) ? 'border-[var(--accent-primary)] border-2' : 'border-white/10'}
                            ${day.isActive ? 'bg-[var(--accent-primary)]/20' : 'bg-dark-card/40'}
                            hover:border-[var(--accent-primary)]/80 hover:shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.4)]
                            hover:bg-[var(--accent-primary)]/10 hover:scale-[1.15] hover:z-30 cursor-default
                            `}
                    >
                        <span className={`text-xl font-black ${!isSameMonth(day.date, currentDate) ? 'text-gray-600' : 'text-white'
                            }`}>
                            {day.dayNumber}
                        </span>

                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                            {day.workout && day.workout.type !== 'Rest' && day.workout.type !== '' && (
                                <div className="flex items-center gap-2 text-sm text-white truncate font-black tracking-tight">
                                    <Activity className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                                    <span className="truncate">{day.workout.type}</span>
                                </div>
                            )}

                            {day.steps && day.steps > 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-100 font-extrabold">
                                    <span className="text-lg">👣</span>
                                    <span>{(day.steps / 1000).toFixed(1)}k</span>
                                </div>
                            )}

                            {day.hasCalorieData && (
                                <div className={`h-2 rounded-full w-full shadow-inner ${day.balance >= 0 ? 'bg-[var(--accent-secondary)]' : 'bg-[var(--danger)]'
                                    }`} />
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden group-hover:block">
                            <p className="font-bold mb-2 text-sm">{format(day.date, 'EEEE, MMM do')}</p>
                            <div className="space-y-1 text-xs">
                                {day.workout && (
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Workout:</span>
                                        <span>{day.workout.type}</span>
                                    </p>
                                )}
                                {day.steps && (
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Steps:</span>
                                        <span>{day.steps}</span>
                                    </p>
                                )}
                                {day.hasCalorieData && (
                                    <p className="flex justify-between">
                                        <span className="text-gray-400">Balance:</span>
                                        <span className={day.balance >= 0 ? 'text-[var(--accent-secondary)]' : 'text-[var(--danger)]'}>
                                            {day.balance > 0 ? '+' : ''}{day.balance}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
