import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/reservations', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setReservations(response.data);
        setFiltered(response.data);
      } catch (err) {
        setError('Failed to load reservations.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchReservations();
  }, [user]);

  useEffect(() => {
    let results = reservations;
    if (filterName) {
      results = results.filter(r =>
        r.customerName.toLowerCase().includes(filterName.toLowerCase())
      );
    }
    if (filterDate) {
      results = results.filter(r =>
        new Date(r.reservedDate).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString()
      );
    }
    setFiltered(results);
  }, [filterName, filterDate, reservations]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await axiosInstance.delete(`/api/reservations/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setReservations(reservations.filter(r => r._id !== id));
    } catch (err) {
      setError('Failed to cancel reservation.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-amber-600 font-semibold">
      Loading reservations...
    </div>
  );

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4 pb-20">
      <div className="w-full max-w-5xl bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">

        <div className="px-8 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-center text-amber-600">Admin Dashboard</h1>
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="px-8 py-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Name</label>
            <input
              type="text"
              placeholder="Search by customer name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilterName(''); setFilterDate(''); }}
              className="bg-amber-100 text-amber-700 px-4 py-2 rounded hover:bg-amber-200 transition font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="px-8 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Showing {filtered.length} of {reservations.length} reservation(s)
          </p>
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No reservations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-500 text-white">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Guests</th>
                    <th className="p-3 text-left">Table</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Contact</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50'}>
                      <td className="p-3">{r.customerName}</td>
                      <td className="p-3">{new Date(r.reservedDate).toLocaleString()}</td>
                      <td className="p-3">{r.numGuests}</td>
                      <td className="p-3">{r.tableId?.location || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${r.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{r.phoneNum}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleCancel(r._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default AdminDashboard;