import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const ManageTables = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [unavailForm, setUnavailForm] = useState({ start: '', end: '', reason: 'maintenance' });
  const [formData, setFormData] = useState({
    seats: '',
    location: '',
    babyHighChair: false,
    status: 'available'
  });

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/tables');
      setTables(response.data);
    } catch (err) {
      setError('Failed to load tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTables();
  }, [user]);

  const resetForm = () => {
    setFormData({ seats: '', location: '', babyHighChair: false, status: 'available' });
    setEditingTable(null);
    setShowForm(false);
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({
      seats: table.seats,
      location: table.location,
      babyHighChair: table.babyHighChair,
      status: table.status
    });
    setShowForm(true);
    setSelectedTable(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingTable) {
        const response = await axiosInstance.put(
          `/api/tables/${editingTable._id}`,
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTables(tables.map(t => t._id === editingTable._id ? response.data : t));
        setSuccess('Table updated successfully.');
      } else {
        const response = await axiosInstance.post(
          '/api/tables',
          formData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setTables([...tables, response.data]);
        setSuccess('Table added successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save table.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      await axiosInstance.delete(`/api/tables/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTables(tables.filter(t => t._id !== id));
      setSuccess('Table deleted.');
    } catch (err) {
      setError('Failed to delete table.');
    }
  };

  const handleAddUnavailable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.post(
        `/api/tables/${selectedTable._id}/unavailable`,
        unavailForm,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTables(tables.map(t => t._id === selectedTable._id ? response.data.table : t));
      setSelectedTable(response.data.table);
      setUnavailForm({ start: '', end: '', reason: 'maintenance' });
      setSuccess('Unavailability window added.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add window.');
    }
  };

  const handleRemoveUnavailable = async (slotId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/tables/${selectedTable._id}/unavailable/${slotId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setTables(tables.map(t => t._id === selectedTable._id ? response.data.table : t));
      setSelectedTable(response.data.table);
      setSuccess('Unavailability window removed.');
    } catch (err) {
      setError('Failed to remove window.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-amber-600 font-semibold">
      Loading tables...
    </div>
  );

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4 pb-20">
      <div className="w-full max-w-4xl bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">

        <div className="px-8 pt-6 pb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-600">Manage Tables</h1>
          <button
            onClick={() => { resetForm(); setShowForm(true); setSelectedTable(null); }}
            className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition font-semibold text-sm"
          >
            + Add Table
          </button>
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="px-8 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-amber-50 p-6 rounded-lg border border-amber-200 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                {editingTable ? 'Edit Table' : 'Add New Table'}
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location / Name</label>
              <input
                type="text"
                placeholder="e.g. Window, Outdoor, Private Room"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400 bg-white"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Seats</label>
              <input
                type="number"
                min="1"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400 bg-white"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400 bg-white"
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="closed">Closed</option>
              </select>
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.babyHighChair}
                  onChange={(e) => setFormData({ ...formData, babyHighChair: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="text-sm text-gray-700">Baby high chair available</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold"
                >
                  {editingTable ? 'Save Changes' : 'Add Table'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-white text-amber-700 border border-amber-300 p-2 rounded hover:bg-amber-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {tables.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tables yet. Add one above.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tables.map((table) => (
                <div key={table._id} className="rounded-lg border border-amber-200 p-4 bg-amber-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{table.location}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${table.status === 'available' ? 'bg-green-100 text-green-600'
                        : table.status === 'maintenance' ? 'bg-amber-200 text-amber-700'
                        : 'bg-red-100 text-red-600'}`}>
                      {table.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Seats: {table.seats}</p>
                  <p className="text-sm text-gray-500">Baby high chair: {table.babyHighChair ? 'Yes' : 'No'}</p>
                  {table.unavailableSlots?.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {table.unavailableSlots.length} unavailability window(s) set
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setSelectedTable(table); setShowForm(false); }}
                      className="flex-1 bg-amber-200 text-amber-800 py-1 rounded hover:bg-amber-300 transition text-sm font-semibold"
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => handleEdit(table)}
                      className="flex-1 bg-amber-500 text-white py-1 rounded hover:bg-amber-600 transition text-sm font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(table._id)}
                      className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTable && (
            <div className="mt-6 rounded-lg border border-amber-200 overflow-hidden">
              <div className="border-t-2 border-amber-300" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Schedule Unavailability — {selectedTable.location}
                  </h2>
                  <button
                    onClick={() => setSelectedTable(null)}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Close
                  </button>
                </div>
                <form onSubmit={handleAddUnavailable} className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                      <input
                        type="datetime-local"
                        value={unavailForm.start}
                        onChange={(e) => setUnavailForm({ ...unavailForm, start: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                      <input
                        type="datetime-local"
                        value={unavailForm.end}
                        onChange={(e) => setUnavailForm({ ...unavailForm, end: e.target.value })}
                        className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <select
                    value={unavailForm.reason}
                    onChange={(e) => setUnavailForm({ ...unavailForm, reason: e.target.value })}
                    className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Restaurant Closed</option>
                    <option value="private">Private Event</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold"
                  >
                    Add Window
                  </button>
                </form>

                {selectedTable.unavailableSlots?.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center">No windows set.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing windows:</p>
                    {selectedTable.unavailableSlots.map((slot) => (
                      <div
                        key={slot._id}
                        className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800 capitalize">{slot.reason}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(slot.start).toLocaleString()} → {new Date(slot.end).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveUnavailable(slot._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t-2 border-amber-300" />
        <div className="px-8 py-4 text-center">
          <p className="text-sm text-gray-400">MyRestaurant Admin Panel</p>
        </div>
      </div>
    </div>
  );
};

export default ManageTables;