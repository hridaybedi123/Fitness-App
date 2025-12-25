import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, Edit2, Check, X, Upload, AlertTriangle } from 'lucide-react';

export default function CalorieTracker() {
  const { calories, addCalorieEntry, updateCalorieEntry, deleteCalorieEntry, clearAllData, importCalorieEntries } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    day: format(new Date(), 'yyyy-MM-dd'),
    target: '',
    exercise: '',
    intake: '',
    steps: '',
  });

  const [editData, setEditData] = useState({
    target: '',
    exercise: '',
    intake: '',
    steps: '',
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
      steps: formData.steps ? Number(formData.steps) : null,
    });

    setFormData({
      day: format(new Date(), 'yyyy-MM-dd'),
      target: '',
      exercise: '',
      intake: '',
      steps: '',
    });
    setShowAddForm(false);
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditData({
      target: entry.target?.toString() || '',
      exercise: entry.exercise?.toString() || '',
      intake: entry.intake?.toString() || '',
      steps: entry.steps?.toString() || '',
    });
  };

  const saveEdit = () => {
    if (!editingId) return;

    updateCalorieEntry(editingId, {
      target: editData.target ? Number(editData.target) : null,
      exercise: editData.exercise ? Number(editData.exercise) : null,
      intake: editData.intake ? Number(editData.intake) : null,
      steps: editData.steps ? Number(editData.steps) : null,
    });

    setEditingId(null);
  };

  const sortedCalories = [...calories]
    .filter(entry => {
      // Filter out entries with missing or invalid dates to prevent crashes
      if (!entry.day) return false;
      try {
        parseISO(entry.day);
        return true;
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => b.day.localeCompare(a.day));

  const calculateNet = (entry: any) => {
    return (entry.intake || 0) - (entry.exercise || 0);
  };

  const calculateDeficit = (entry: any) => {
    const net = calculateNet(entry);
    return entry.target ? entry.target - net : 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Calorie Tracker</h2>
          <p className="text-gray-400">Track your daily calorie intake and expenditure</p>
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

                    // Skip header
                    lines.slice(1).forEach(line => {
                      if (!line.trim()) return;
                      const [day, target, exercise, intake, steps] = line.split(',');

                      if (day && day.trim()) {
                        const parsedTarget = target ? Number(target) : null;
                        const parsedExercise = exercise ? Number(exercise) : null;
                        const parsedIntake = intake ? Number(intake) : null;
                        const parsedSteps = steps ? Number(steps) : null;

                        // Basic validation to avoid NaN
                        if ((parsedTarget !== null && isNaN(parsedTarget)) ||
                          (parsedExercise !== null && isNaN(parsedExercise)) ||
                          (parsedIntake !== null && isNaN(parsedIntake)) ||
                          (parsedSteps !== null && isNaN(parsedSteps))) {
                          return; // Skip invalid lines
                        }

                        newEntries.push({
                          day: day.trim(),
                          target: parsedTarget,
                          exercise: parsedExercise,
                          intake: parsedIntake,
                          steps: parsedSteps,
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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass p-6 rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="w-8 h-8" />
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

      {/* Add Form */}
      {showAddForm && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">New Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target (kcal)</label>
              <input
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="2000"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Exercise (kcal)</label>
              <input
                type="number"
                value={formData.exercise}
                onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                placeholder="300"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Intake (kcal)</label>
              <input
                type="number"
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                placeholder="1800"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Steps</label>
              <input
                type="number"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                placeholder="10000"
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              Add Entry
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-dark-card hover:bg-dark-border text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-card border-b border-dark-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Target</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Exercise</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Intake</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Steps</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Net</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Surplus/Deficit</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCalories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No calorie entries yet. Click "Add Entry" to get started.
                  </td>
                </tr>
              ) : (
                sortedCalories.map((entry) => (
                  <tr key={entry.id} className="border-b border-dark-border hover:bg-dark-card/50">
                    <td className="px-6 py-4 text-sm">
                      {(() => {
                        try {
                          return format(parseISO(entry.day), 'MMM dd, yyyy');
                        } catch (e) {
                          return 'Invalid Date';
                        }
                      })()}
                    </td>
                    {editingId === entry.id ? (
                      <>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={editData.target}
                            onChange={(e) => setEditData({ ...editData, target: e.target.value })}
                            className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={editData.exercise}
                            onChange={(e) => setEditData({ ...editData, exercise: e.target.value })}
                            className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={editData.intake}
                            onChange={(e) => setEditData({ ...editData, intake: e.target.value })}
                            className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <input
                            type="number"
                            value={editData.steps}
                            onChange={(e) => setEditData({ ...editData, steps: e.target.value })}
                            className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 text-right text-sm">{entry.target || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm">{entry.exercise || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm">{entry.intake || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm">{entry.steps || '-'}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      {calculateNet(entry)}
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-medium ${calculateDeficit(entry) > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {calculateDeficit(entry) > 0 ? '+' : ''}{calculateDeficit(entry)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === entry.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-400/10 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(entry)}
                              className="p-1 text-blue-500 hover:bg-blue-500/10 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteCalorieEntry(entry.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
