import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format, parseISO, parse } from 'date-fns';
import { Upload, Trash2, Calendar, Activity, Utensils, Check, TrendingDown, TrendingUp } from 'lucide-react';

export default function CalorieTracker() {
  const { calories, addCalorieEntry, deleteCalorieEntry, clearAllData, importCalorieEntries } = useData();

  const [formData, setFormData] = useState({
    day: format(new Date(), 'yyyy-MM-dd'),
    target: '',
    exercise: '',
    intake: '',
    protein: '',
  });

  const [showClearConfirm, setShowClearConfirm] = useState(0); // 0: none, 1: first confirm, 2: second confirm
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!formData.day) return;

    addCalorieEntry({
      day: formData.day,
      target: formData.target ? Number(formData.target) : null,
      exercise: formData.exercise ? Number(formData.exercise) : null,
      intake: formData.intake ? Number(formData.intake) : null,
      protein: formData.protein ? Number(formData.protein) : null,
      steps: null, // Steps removed from form
    });

    setFormData({
      day: format(new Date(), 'yyyy-MM-dd'),
      target: '',
      exercise: '',
      intake: '',
      protein: '',
    });
  };

  const sortedCalories = [...calories]
    .filter(entry => {
      if (!entry.day) return false;
      try {
        parseISO(entry.day);
        return true;
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => b.day.localeCompare(a.day)); // Always sort descending

  const calculateNet = (entry: any) => {
    return (entry.intake || 0) - (entry.exercise || 0);
  };

  const calculateDeficit = (entry: any) => {
    const net = calculateNet(entry);
    return entry.target ? entry.target - net : 0;
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden per reference design */}

      {/* Add Daily Entry Form - Always Visible */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-green-500 rounded-full"></div>
          <h3 className="text-xl font-bold">Add Daily Entry</h3>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target (kcal)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🎯</span>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  placeholder="2000"
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Exercise (kcal)</label>
              <div className="relative">
                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Intake (kcal)</label>
              <div className="relative">
                <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={formData.intake}
                  onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Protein (g)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">💪</span>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  placeholder="150"
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                Log Day
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Recent Entries Section */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-green-500 rounded-full"></div>
              <h3 className="text-xl font-bold">Recent Entries</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const text = event.target?.result as string;
                        const lines = text.split('\n');
                        const newEntries: any[] = [];

                        // Determine format based on header
                        const header = lines[0].toLowerCase();
                        const isCustomFormat = header.includes('no.') && header.includes('day') && header.includes('plus/minus');

                        let currentYear = new Date().getFullYear();
                        let lastMonth = -1;

                        // Skip header
                        lines.slice(1).forEach(line => {
                          if (!line.trim()) return;

                          let dayStr, target, exercise, intake;

                          if (isCustomFormat) {
                            const cols = line.split(',').map(s => s.trim());
                            if (cols.length < 8) return;

                            try {
                              const parsedDate = parse(cols[1], 'dd-MMM', new Date(currentYear, 0, 1));
                              const month = parsedDate.getMonth();

                              if (lastMonth === 11 && month === 0) {
                                currentYear++;
                                parsedDate.setFullYear(currentYear);
                              }

                              lastMonth = month;
                              parsedDate.setFullYear(currentYear);
                              dayStr = format(parsedDate, 'yyyy-MM-dd');
                            } catch (err) {
                              console.error('Date parse error', cols[1]);
                              return;
                            }

                            target = cols[2];
                            exercise = cols[3];
                            intake = cols[4];
                          } else {
                            [dayStr, target, exercise, intake] = line.split(',');
                          }

                          if (dayStr && dayStr.trim()) {
                            const parsedTarget = target ? Number(target) : null;
                            const parsedExercise = exercise ? Number(exercise) : null;
                            const parsedIntake = intake ? Number(intake) : null;

                            if ((parsedTarget !== null && isNaN(parsedTarget)) ||
                              (parsedExercise !== null && isNaN(parsedExercise)) ||
                              (parsedIntake !== null && isNaN(parsedIntake))) {
                              return;
                            }

                            newEntries.push({
                              day: dayStr.trim(),
                              target: parsedTarget,
                              exercise: parsedExercise,
                              intake: parsedIntake,
                              steps: null,
                            });
                          }
                        });

                        if (newEntries.length > 0) {
                          importCalorieEntries(newEntries);
                        }
                      } catch (error) {
                        console.error('Error parsing CSV:', error);
                        alert('Error parsing CSV file. Please check the format.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-dark-card hover:bg-dark-border text-gray-300 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button
                onClick={() => setShowClearConfirm(1)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Data
              </button>
            </div>
          </div>
        </div>

        {/* Clear Data Confirmation Modal */}
        {showClearConfirm > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass p-6 rounded-xl max-w-md w-full mx-4">
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <Trash2 className="w-8 h-8" />
                <h3 className="text-xl font-bold">
                  {showClearConfirm === 1 ? 'Clear All Data?' : 'Are you absolutely sure?'}
                </h3>
              </div>
              <p className="text-gray-300 mb-6">
                {showClearConfirm === 1
                  ? 'This action will delete all your calorie, workout, and weight data. This cannot be undone.'
                  : 'Please confirm one last time. All your progress data will be permanently erased.'}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(0)}
                  className="px-4 py-2 bg-dark-card hover:bg-dark-border text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showClearConfirm === 1) {
                      setShowClearConfirm(2);
                    } else {
                      clearAllData();
                      setShowClearConfirm(0);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  {showClearConfirm === 1 ? 'Yes, I understand' : 'Permanently Delete Everything'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-card border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Intake</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Exercise</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Protein</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Net</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {sortedCalories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No calorie entries yet. Add your first entry above.
                  </td>
                </tr>
              ) : (
                sortedCalories.map((entry) => {
                  const deficit = calculateDeficit(entry);
                  const net = calculateNet(entry);

                  return (
                    <tr key={entry.id} className="border-b border-dark-border hover:bg-dark-card/50">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {(() => {
                            try {
                              return format(parseISO(entry.day), 'MMM dd, yyyy');
                            } catch (e) {
                              return 'Invalid Date';
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">{entry.target || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm">{entry.intake || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm">{entry.exercise || '-'}</td>
                      <td className="px-6 py-4 text-right text-sm">
                        {entry.protein ? (
                          <span className="font-medium">{entry.protein}g</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">{net}</td>
                      <td className="px-6 py-4 text-right">
                        {entry.target ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${deficit > 0
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                            }`}>
                            {deficit > 0 ? (
                              <>
                                <TrendingDown className="w-3 h-3" />
                                Deficit (-{Math.abs(deficit)})
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3" />
                                Surplus (+{Math.abs(deficit)})
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteCalorieEntry(entry.id)}
                          className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {sortedCalories.length > 0 && (
          <div className="px-6 py-4 border-t border-dark-border">
            <p className="text-sm text-gray-500">
              Showing last {sortedCalories.length} {sortedCalories.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
