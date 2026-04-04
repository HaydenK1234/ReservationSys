import { useState } from 'react';
import axiosInstance from '../axiosConfig';

const MyReservations = () => {
  const [lookupData, setLookupData] = useState({ reservationId: '', customerName: '' });
  const [reservation, setReservation] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReservation(null);
    try {
      const response = await axiosInstance.get(`/api/reservations/${lookupData.reservationId}`);
      const found = response.data;
      if (found.customerName.toLowerCase() !== lookupData.customerName.toLowerCase()) {
        setError('Name does not match this reservation ID.');
        return;
      }
      setReservation(found);
      setEditData({
        numGuests: found.numGuests,
        reservedDate: found.reservedDate.slice(0, 16)
      });
    } catch (err) {
      setError('Reservation not found. Please check your ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axiosInstance.put(
        `/api/reservations/${reservation._id}`,
        editData
      );
      setReservation(response.data.reservation);
      setEditing(false);
      setSuccess('Reservation updated. A confirmation SMS has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setLoading(true);
    setError('');
    try {
      await axiosInstance.delete(`/api/reservations/${reservation._id}`);
      setReservation(null);
      setSuccess('Your reservation has been cancelled.');
      setLookupData({ reservationId: '', customerName: '' });
    } catch (err) {
      setError('Failed to cancel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center pt-10 px-4 pb-20">
      <div className="w-full max-w-lg bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">

        <div className="px-8 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-center text-amber-600">My Reservations</h1>
        </div>

        <div className="border-t-2 border-amber-300" />

        <div className="px-8 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>
          )}

          {!reservation && (
            <form onSubmit={handleLookup}>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Find Your Reservation</h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reservation ID</label>
              <input
                type="text"
                placeholder="Paste your reservation ID"
                value={lookupData.reservationId}
                onChange={(e) => setLookupData({ ...lookupData, reservationId: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded font-mono focus:outline-none focus:border-amber-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Name used when booking"
                value={lookupData.customerName}
                onChange={(e) => setLookupData({ ...lookupData, customerName: e.target.value })}
                className="w-full mb-6 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Looking up...' : 'Find Reservation'}
              </button>
            </form>
          )}

          {reservation && !editing && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Reservation</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="mb-1 text-sm"><span className="font-medium">Name:</span> {reservation.customerName}</p>
                <p className="mb-1 text-sm"><span className="font-medium">Date:</span> {new Date(reservation.reservedDate).toLocaleString()}</p>
                <p className="mb-1 text-sm"><span className="font-medium">Guests:</span> {reservation.numGuests}</p>
                <p className="mb-1 text-sm"><span className="font-medium">Table:</span> {reservation.tableId?.location}</p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`font-semibold ${reservation.status === 'confirmed' ? 'text-green-600' : 'text-red-600'}`}>
                    {reservation.status}
                  </span>
                </p>
              </div>
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold"
                >
                  Edit Reservation
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition font-semibold disabled:opacity-50"
                >
                  Cancel Reservation
                </button>
              </div>
              <button
                onClick={() => { setReservation(null); setSuccess(''); }}
                className="w-full text-sm text-amber-600 hover:underline"
              >
                Look up a different reservation
              </button>
            </div>
          )}

          {reservation && editing && (
            <form onSubmit={handleUpdate}>
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Reservation</h2>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date and Time</label>
              <input
                type="datetime-local"
                value={editData.reservedDate}
                onChange={(e) => setEditData({ ...editData, reservedDate: e.target.value })}
                className="w-full mb-4 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
              <input
                type="number"
                min="1"
                max="20"
                value={editData.numGuests}
                onChange={(e) => setEditData({ ...editData, numGuests: e.target.value })}
                className="w-full mb-6 p-2 border border-gray-200 rounded focus:outline-none focus:border-amber-400"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-white p-2 rounded hover:bg-amber-600 transition font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="mt-3 w-full text-sm text-amber-600 hover:underline"
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        <div className="border-t-2 border-amber-300" />
        <div className="px-8 py-4 text-center">
          <p className="text-sm text-gray-400">
            Want to make a new booking?{' '}
            <a href="/" className="text-amber-600 hover:underline font-medium">Book a Table</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyReservations;