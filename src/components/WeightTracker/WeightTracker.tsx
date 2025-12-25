import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { format, parseISO } from 'date-fns';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightTracker() {
  const { weights, addWeightEntry, updateWeightEntry, deleteWeightEntry } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: '',
  });

  const [editData, setEditData] = useState({
    date: '',
    weight: '',
  });

  const handleAdd = () => {
    if (!formData.date || !formData.weight) return;

    addWeightEntry({
      date: formData.date,
      weight: Number(formData.weight),
    });

    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
    });
    setShowAddForm(false);
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditData({
      date: entry.date,
      weight: entry.weight.toString(),
    });
  };

  const saveEdit = () => {
    if (!editingId) return;

    updateWeightEntry(editingId, {
      date: editData.date,
      weight: Number(editData.weight),
    });

    setEditingId(null);
  };

  const sortedWeights = [...weights].sort((a, b) => b.date.localeCompare(a.date));

  const chartData = [...weights]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(w => ({
      date: format(parseISO(w.date), 'MM/dd'),
      weight: w.weight,
    }));

  // Calculate stats
  const latestWeight = sortedWeights[0]?.weight || 0;
  const startWeight = sortedWeights[sortedWeights.length - 1]?.weight || 0;
  const totalChange = latestWeight - startWeight;
  const avgWeight = weights.length > 0
    ? weights.reduce((sum, w) => sum + w.weight, 0) / weights.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Weight Tracker</h2>
          <p className="text-gray-400">Monitor your weight progress over time</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Current Weight</p>
          <p className="text-3xl font-bold">{latestWeight.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">lbs</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Total Change</p>
          <p className={`text-3xl font-bold ${totalChange < 0 ? 'text-green-500' : totalChange > 0 ? 'text-red-500' : ''}`}>
            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">lbs</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Average Weight</p>
          <p className="text-3xl font-bold">{avgWeight.toFixed(1)}</p>
          <p className="text-xs text-gray-500 mt-1">lbs</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} name="Weight (lbs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">New Weight Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="150.5"
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
                <th className="px-6 py-4 text-right text-sm font-medium">Weight (lbs)</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Change</th>
                <th className="px-6 py-4 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedWeights.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No weight entries yet. Click "Add Entry" to get started.
                  </td>
                </tr>
              ) : (
                sortedWeights.map((entry, index) => {
                  const prevEntry = sortedWeights[index + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0;

                  return (
                    <tr key={entry.id} className="border-b border-dark-border hover:bg-dark-card/50">
                      <td className="px-6 py-4 text-sm">
                        {editingId === entry.id ? (
                          <input
                            type="date"
                            value={editData.date}
                            onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                            className="px-2 py-1 bg-dark-card border border-dark-border rounded"
                          />
                        ) : (
                          format(parseISO(entry.date), 'MMM dd, yyyy')
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {editingId === entry.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editData.weight}
                            onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                            className="w-24 px-2 py-1 bg-dark-card border border-dark-border rounded text-right"
                          />
                        ) : (
                          <span className="font-medium">{entry.weight.toFixed(1)}</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-medium ${change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-gray-400'
                        }`}>
                        {prevEntry ? `${change > 0 ? '+' : ''}${change.toFixed(1)}` : '-'}
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
                                onClick={() => deleteWeightEntry(entry.id)}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
